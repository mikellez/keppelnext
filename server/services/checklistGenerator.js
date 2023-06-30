const cron = require('node-cron');
const { Client } = require('pg');
const moment = require('moment');

const connectDB = () => {
    const client = new Client({
        host: '192.168.20.96',
        port: 5432,
        database: 'cmms_dev',
        user: 'postgres',
        password: '123Az!!!',
    });
    client.connect();
    return client;
};

const fetchDueSchedules = async () => {
    const client = connectDB();
    const result = await client.query(`
        SELECT 
            SC.SCHEDULE_ID, 
            SC.USER_ID, 
            SC.START_DATE, 
            SC.END_DATE, 
            SC.RECURRENCE_PERIOD,
            SC.REMINDER_RECURRENCE, 
            SC.REMARKS, 
            SC.SCHEDULER_USERIDS_FOR_EMAIL,
            STRING_AGG(U.user_email, ', '), 
            STRING_AGG(U.user_name, ', ') AS USERNAME, 
            PM.PLANT_ID, 
            PM.PLANT_NAME, 
            CT.CHL_NAME,
            SC.CHECKLIST_TEMPLATE_ID,
            AGE(CURRENT_DATE, START_dATE) AS AGE,
            DATE_PART('year', AGE(CURRENT_dATE, START_dATE)) AS years,
            DATE_PART('month', AGE(CURRENT_dATE, START_dATE)) AS months,
            DATE_PART('days', AGE(CURRENT_dATE, START_dATE)) AS days
        FROM 
            KEPPEL.SCHEDULE_CHECKLIST  AS SC
            LEFT JOIN KEPPEL.USERS AS U ON U.USER_ID = ANY(SC.SCHEDULER_USERIDS_FOR_EMAIL),
            KEPPEL.PLANT_MASTER  AS PM,
            KEPPEL.CHECKLIST_TEMPLATES AS CT,
            KEPPEL.SCHEDULE_TIMELINES AS ST
        WHERE
            ST.TIMELINE_ID = SC.TIMELINE_ID AND
            ST.STATUS = 1 AND
            SC.PLANT_ID = PM.PLANT_ID AND 
            CT.CHECKLIST_ID = SC.CHECKLIST_TEMPLATE_ID AND
            (
                CURRENT_dATE <= END_DATE AND 
                (
                    DATE_PART('days', AGE(CURRENT_dATE, START_dATE)) = 0 OR
                    DATE_PART('days', AGE(CURRENT_dATE, START_dATE)) = -REMINDER_RECURRENCE OR
                    DATE_PART('days', AGE(CURRENT_dATE, START_dATE)) > 0 AND 
                    (
                        MOD(CAST (DATE_PART('days', AGE(CURRENT_dATE, START_dATE)) AS INTEGER), RECURRENCE_PERIOD) = 0 OR
                        MOD(CAST (DATE_PART('days', AGE(CURRENT_dATE, START_dATE)) AS INTEGER), RECURRENCE_PERIOD) = REMINDER_RECURRENCE
                    )
                ) 
            )
        GROUP BY (SC.SCHEDULE_ID, PM.PLANT_ID, CT.CHECKLIST_ID,SC.USER_ID)
    `);
    client.end();
    return result.rows;
};

const fetchChecklistTemplate = async (template_id) => {
    const client = connectDB();
    const result = await client.query(`
        SELECT 
            checklist_id,
            chl_name,
            description,
            datajson,
            signoff_user_id,
            linkedassetids
        FROM
            keppel.checklist_templates
        WHERE checklist_id = $1
    `, [template_id]);
    client.end();
    return result.rows[0];
};

const createChecklistFromTemplate = async (schedule) => {
    const client = connectDB();
    const assignedID = schedule.scheduler_userids_for_email && schedule.scheduler_userids_for_email.length > 0 ? 
        schedule.scheduler_userids_for_email[0] : null;
    const today = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
    const activity_log = [
        {
            date: today,
            name: "System Generated",
            activity: assignedID ? "ASSIGNED" : "PENDING",
            activity_type: "Created Checklist Record",
        },
    ];
    const status = assignedID ? 2 : 1;
    const cl = await fetchChecklistTemplate(schedule.checklist_template_id);

    await client.query(`
        INSERT INTO
        keppel.checklist_master
        (
            chl_name,
            description,
            assigned_user_id,
            signoff_user_id,
            linkedassetids,
            datajson,
            chl_type,
            plant_id,
            created_date,
            status_id,
            activity_log
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)    
        RETURNING checklist_id
    `,[
        cl.chl_name,
        cl.description,
        assignedID,
        cl.signoff_user_id,
        cl.linkedassetids,
        JSON.stringify(cl.datajson),
        'Record',
        schedule.plant_id,
        today,
        status,
        JSON.stringify(activity_log)
    ]);
    client.end();
};

const main = async () => {
    try {
        const client = connectDB();
        const schedules = await fetchDueSchedules();
        for (let s of schedules) {
            await createChecklistFromTemplate(s);
        }
        console.log("System Generated Checklists Created.")
        client.end();
    } catch (err) {
        console.log(err);
    }
};

module.exports = cron.schedule('0 0 7 * * *', () => {
    main();
});

