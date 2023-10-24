const cron = require("node-cron");
const { Client } = require("pg");
const moment = require("moment");
const dbJSON = require("../db/db.config.json");

const connectDB = () => {
  const dbName = dbJSON["cmms"];
  const client = new Client(dbName);
  client.connect();
  return client;
};

const fetchDueSchedules = async () => {
  /** 
   * This function fetches schedules that are due for reminder notification
   * and creation of checklists (regardless if their advanced or not). It also
   * has logic to handle the recurrences. 
   * 
   * The checklists are generated on each event separately and not in bulk on 
   * the start_date of the schedule.
   * 
   * 
   * DATE_PART('days', AGE(CURRENT_dATE, START_dATE)) = -REMINDER_RECURRENCE
   *    -> for first occurrence
   * 
   * MOD(CAST (DATE_PART('days', AGE(CURRENT_dATE, START_dATE::DATE)) 
   * AS INTEGER), RECURRENCE_PERIOD) = RECURRENCE_PERIOD - REMINDER_RECURRENCE
   *    -> for subsequent occurrences
   */ 

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
            AGE(CURRENT_DATE, START_dATE::DATE) AS AGE,
            DATE_PART('year', AGE(CURRENT_dATE, START_dATE::DATE)) AS years,
            DATE_PART('month', AGE(CURRENT_dATE, START_dATE::DATE)) AS months,
            DATE_PART('days', AGE(CURRENT_dATE, START_dATE::DATE)) AS days,
            SC.ADVANCE_SCHEDULE
        FROM 
            KEPPEL.SCHEDULE_CHECKLIST  AS SC
            LEFT JOIN KEPPEL.USERS AS U ON U.USER_ID = ANY(SC.SCHEDULER_USERIDS_FOR_EMAIL),
            KEPPEL.PLANT_MASTER  AS PM,
            KEPPEL.CHECKLIST_TEMPLATES AS CT,
            KEPPEL.SCHEDULE_TIMELINES AS ST
        WHERE
            ST.TIMELINE_ID = SC.TIMELINE_ID AND
            ST.STATUS = 1 AND
            ST.ACTIVE = 1 AND
            SC.PLANT_ID = PM.PLANT_ID AND 
            CT.CHECKLIST_ID = SC.CHECKLIST_TEMPLATE_ID AND
            (
                CURRENT_dATE + ( INTERVAL '1 days' * ADVANCE_SCHEDULE ) <= END_DATE AND 
                (
                    DATE_PART('days', AGE(CURRENT_dATE, START_dATE::DATE)) + ADVANCE_SCHEDULE = 0 OR   
                    DATE_PART('days', AGE(CURRENT_dATE, START_dATE::DATE)) + ADVANCE_SCHEDULE = -REMINDER_RECURRENCE OR
                    DATE_PART('days', AGE(CURRENT_dATE, START_dATE::DATE)) + ADVANCE_SCHEDULE > 0 AND 
                    (
                        MOD(CAST (DATE_PART('days', AGE(CURRENT_dATE, START_dATE::DATE)) AS INTEGER) + ADVANCE_SCHEDULE, RECURRENCE_PERIOD) = 0 OR
                        MOD(CAST (DATE_PART('days', AGE(CURRENT_dATE, START_dATE::DATE)) AS INTEGER) + ADVANCE_SCHEDULE, RECURRENCE_PERIOD) = RECURRENCE_PERIOD - REMINDER_RECURRENCE
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
  const result = await client.query(
    `
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
    `,
    [template_id]
  );
  client.end();
  return result.rows[0];
};

const createChecklistFromTemplate = async (schedule) => {
  const client = connectDB();
  const assignedID =
    schedule.scheduler_userids_for_email &&
    schedule.scheduler_userids_for_email.length > 0
      ? schedule.scheduler_userids_for_email[0]
      : null;
  const today = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
  const advance_days = schedule.advance_schedule;
  const newDate = today.add(advance_days, 'days').format("YYYY-MM-DD HH:mm:ss");

  const activity_log = [
    {
      date: today,
      name: "System Generated",
      activity: "Created Checklist Record",
      activity_type: assignedID ? "ASSIGNED" : "PENDING",
    },
  ];
  const status = assignedID ? 2 : 1;
  const cl = await fetchChecklistTemplate(schedule.checklist_template_id);

  await client.query(
      `
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
      `,
      [
        cl.chl_name,
        cl.description,
        assignedID,
        cl.signoff_user_id,
        cl.linkedassetids,
        JSON.stringify(cl.datajson),
        "Record",
        schedule.plant_id,
        newDate,
        status,
        JSON.stringify(activity_log),
      ]
    );
  client.end();
};

const main = async () => {
  try {
    const client = connectDB();
    const schedules = await fetchDueSchedules();
    for (let s of schedules) {
      await createChecklistFromTemplate(s);
    }
    console.log("System Generated Checklists Created.");
    client.end();
  } catch (err) {
    console.log(err);
  }
};

const runMainManually = async () => {
  try {
    console.log("Manually triggering main...");
    await main();
    console.log("Manual execution of main completed.");
  } catch (err) {
    console.log(err);
  }
};

const start = async () => {
  module.exports = cron.schedule("0 0 7 * * *", () => {
    main();
  });
}

module.exports = { start };

// Check if the script is being run directly
if (require.main === module) {
  if (process.argv[2] === "manual") {
    runMainManually(); // Run the main function manually
  } else {
    // Schedule the cron job
    start();
  }
}
