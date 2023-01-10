const db = require("../../db");
const dateHandler = require("../dateHandler")

// Function to get a schdeule dates
const makeScheduleDict = (arr) => {
    const newArr = [];
    arr.forEach((item) => {
        newArr.push({
            schedule_id: item["schedule_id"],
            checklist_name: item["chl_name"],
            plant: item["plant_name"],
            start_date: item["start_date"],
            end_date: item["end_date"],
            period: item["recurrence_period"],
            calendar_dates: dateHandler.getDateRange(
                item["start_date"],
                item["recurrence_period"],
                item["end_date"]
            ),
            checklist_id: item["checklist_template_id"],
            assigned_ids: item["scheduler_userids_for_email"],
            username: item["username"],
            remarks: item["remarks"],
        });
    });
    return newArr;
};

// Get all schedules or plant specific schedules
const getViewSchedules = async(req, res, next) => {
    let queryS = [];
    if (req.params.plant_id === '0') {
        if (req.user.role_id === 0 || req.user.role_id === 4) {
            queryS.push(`SELECT SC.SCHEDULE_ID, SC.CHECKLIST_TEMPLATE_ID, (SC.START_DATE  + interval '8 hour' ) as START_DATE,(SC.END_DATE  + interval '8 hour' ) as END_DATE,
            SC.RECURRENCE_PERIOD,SC.REMINDER_RECURRENCE, SC.SCHEDULER_USERIDS_FOR_EMAIL, STRING_AGG(DISTINCT(U.user_email), ' ,') AS USERNAME, PM.PLANT_NAME, CT.CHL_NAME, SC.REMARKS
            FROM 
            KEPPEL.SCHEDULE_CHECKLIST  as SC,
            KEPPEL.USERS AS U,
            KEPPEL.PLANT_MASTER  AS PM,
            KEPPEL.CHECKLIST_TEMPLATES AS CT,
            KEPPEL.USER_PLANT AS UP
            WHERE
            U.USER_ID = ANY( SC.SCHEDULER_USERIDS_FOR_EMAIL) AND
            SC.PLANT_ID = PM.PLANT_ID AND 
            CT.CHECKLIST_ID = SC.CHECKLIST_TEMPLATE_ID AND 
            SC.PLANT_ID =ANY(SELECT DISTINCT(PLANT_ID) FROM KEPPEL.USER_PLANT WHERE USER_ID = ${req.user.id} OR ${req.user.id} = ANY(SC.SCHEDULER_USERIDS_FOR_EMAIL))
            AND
            SC.timeline_id IN (SELECT timeline_id FROM KEPPEL.schedule_timelines WHERE STATUS = 1) 
            
            GROUP BY (SC.SCHEDULE_ID, PM.PLANT_ID, CT.CHECKLIST_ID)`);
        } else {
            queryS.push(`SELECT 
            SC.SCHEDULE_ID, (SC.START_DATE  + interval '8 hour' ) as START_DATE,(SC.END_DATE  + interval '8 hour' ) as END_DATE,
          SC.RECURRENCE_PERIOD,SC.REMINDER_RECURRENCE, SC.SCHEDULER_USERIDS_FOR_EMAIL,
          PM.PLANT_NAME, CT.CHL_NAME,SC.CHECKLIST_TEMPLATE_ID, STRING_AGG(U.user_name, ' ,') AS USERNAME, SC.REMARKS
          FROM 
          KEPPEL.SCHEDULE_CHECKLIST  as SC,
          KEPPEL.PLANT_MASTER  AS PM,
          KEPPEL.CHECKLIST_TEMPLATES AS CT,
          KEPPEL.USERS AS U
          WHERE
          SC.PLANT_ID = PM.PLANT_ID AND 
          CT.CHECKLIST_ID = SC.CHECKLIST_TEMPLATE_ID AND
          U.USER_ID = ANY( SC.SCHEDULER_USERIDS_FOR_EMAIL) AND
          SC.timeline_id IN (SELECT timeline_id FROM KEPPEL.schedule_timelines WHERE STATUS = 1)
          GROUP BY (SC.SCHEDULE_ID, PM.PLANT_ID, CT.CHECKLIST_ID)`);
        };
    } else {
        queryS.push(`SELECT SC.SCHEDULE_ID, SC.CHECKLIST_TEMPLATE_ID, (SC.START_DATE  + interval '8 hour' ) as START_DATE,(SC.END_DATE  + interval '8 hour' ) as END_DATE,
        SC.RECURRENCE_PERIOD,SC.REMINDER_RECURRENCE, SC.SCHEDULER_USERIDS_FOR_EMAIL, STRING_AGG(DISTINCT(U.user_email), ' ,') AS USERNAME, PM.PLANT_NAME, CT.CHL_NAME, SC.REMARKS
        FROM 
        KEPPEL.SCHEDULE_CHECKLIST  as SC,
        KEPPEL.USERS AS U,
        KEPPEL.PLANT_MASTER  AS PM,
        KEPPEL.CHECKLIST_TEMPLATES AS CT,
        KEPPEL.USER_PLANT AS UP
        WHERE
        U.USER_ID = ANY( SC.SCHEDULER_USERIDS_FOR_EMAIL) AND
        SC.PLANT_ID = PM.PLANT_ID AND 
        CT.CHECKLIST_ID = SC.CHECKLIST_TEMPLATE_ID AND 
        SC.PLANT_ID = ${req.params.plant_id}
        AND
        SC.timeline_id IN (SELECT timeline_id FROM KEPPEL.schedule_timelines WHERE STATUS = 1) 
        
        GROUP BY (SC.SCHEDULE_ID, PM.PLANT_ID, CT.CHECKLIST_ID)`)
    }
    console.log(queryS[0])
    db.query(queryS[0], (err, result) => {
        if (err) throw err;
        if (result) {
            const response_dict = makeScheduleDict(result.rows);
            res.status(200).send(response_dict);
        };
    });
};

// Get plants based on the user role
const getPlants = async(req, res, next) => {
    if (req.user.role_id === 0 || req.user.role_id === 4) {
        db.query(`SELECT * FROM keppel.plant_master`, (err, result) => {
            if (err) throw err;
            if (result) {
                res.status(200).send(result.rows);
            };
        }); 
    } else {
        db.query("SELECT * FROM keppel.plant_master WHERE plant_id IN (SELECT plant_id FROM keppel.user_plant WHERE user_id = $1::integer)", [req.user.id], (err, result) => {
            if (err) throw err;
            if (result) {
                res.status(200).send(result.rows);
            }; 
        })
    }
};

// Get details of a user via user id
const getUser = async(req, res, next) => {
    db.query(`SELECT user_email, first_name, last_name FROM keppel.users WHERE user_id = $1::integer`, [req.params.user_id], (err, result) => {
        if (err) throw err;
        if (result) {
            res.status(200).send(result.rows[0]);
        }; 
    })
}

module.exports = {
    getViewSchedules, 
    getPlants,
    getUser
};