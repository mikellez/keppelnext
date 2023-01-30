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
            assigned_usernames: item["username"].split(","),
            assigned_fnames: item["fname"].split(","),
            assigned_lnames: item["lname"].split(","),
            assigned_roles: item["roles"].split(","),
            assigned_emails: item["user_emails"].split(","),
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
            SC.RECURRENCE_PERIOD,SC.REMINDER_RECURRENCE, SC.SCHEDULER_USERIDS_FOR_EMAIL, STRING_AGG(DISTINCT(U.user_email), ' ,') AS USERNAME,
			STRING_AGG(U.user_email, ' ,') AS USER_EMAILS,
		  STRING_AGG(UA.role_name, ' ,') AS ROLES,
		  STRING_AGG(U.first_name, ' ,') AS FNAME,
		  STRING_AGG(U.last_name, ' ,') AS LNAME,
			PM.PLANT_NAME, CT.CHL_NAME, SC.REMARKS
            FROM 
            KEPPEL.SCHEDULE_CHECKLIST  as SC,
            KEPPEL.USERS AS U,
			KEPPEL.USER_ACCESS AS UA,
            KEPPEL.PLANT_MASTER  AS PM,
            KEPPEL.CHECKLIST_TEMPLATES AS CT,
            KEPPEL.USER_PLANT AS UP
            WHERE
            U.USER_ID = ANY( SC.SCHEDULER_USERIDS_FOR_EMAIL) AND
            SC.PLANT_ID = PM.PLANT_ID AND 
            CT.CHECKLIST_ID = SC.CHECKLIST_TEMPLATE_ID AND
			UA.USER_ID = ANY( SC.SCHEDULER_USERIDS_FOR_EMAIL) AND
            SC.PLANT_ID =ANY(SELECT DISTINCT(PLANT_ID) FROM KEPPEL.USER_PLANT WHERE USER_ID = ${req.user.id} OR ${req.user.id} = ANY(SC.SCHEDULER_USERIDS_FOR_EMAIL))
            AND
            SC.timeline_id IN (SELECT timeline_id FROM KEPPEL.schedule_timelines WHERE STATUS = 1 OR STATUS = 5) 
            
            GROUP BY (SC.SCHEDULE_ID, PM.PLANT_ID, CT.CHECKLIST_ID)`);
        } else {
            queryS.push(`SELECT 
            SC.SCHEDULE_ID, (SC.START_DATE  + interval '8 hour' ) as START_DATE,(SC.END_DATE  + interval '8 hour' ) as END_DATE,
          SC.RECURRENCE_PERIOD,SC.REMINDER_RECURRENCE, SC.SCHEDULER_USERIDS_FOR_EMAIL,
          PM.PLANT_NAME, CT.CHL_NAME,SC.CHECKLIST_TEMPLATE_ID, STRING_AGG(U.user_name, ' ,') AS USERNAME,
		  STRING_AGG(U.user_email, ' ,') AS USER_EMAILS,
		  STRING_AGG(UA.role_name, ' ,') AS ROLES,
		  STRING_AGG(U.first_name, ' ,') AS FNAME,
		  STRING_AGG(U.last_name, ' ,') AS LNAME,
		  SC.REMARKS
          FROM 
          KEPPEL.SCHEDULE_CHECKLIST  as SC,
          KEPPEL.PLANT_MASTER  AS PM,
          KEPPEL.CHECKLIST_TEMPLATES AS CT,
          KEPPEL.USERS AS U,
		  KEPPEL.USER_ACCESS AS UA
          WHERE
          SC.PLANT_ID = PM.PLANT_ID AND 
          CT.CHECKLIST_ID = SC.CHECKLIST_TEMPLATE_ID AND
          U.USER_ID = ANY( SC.SCHEDULER_USERIDS_FOR_EMAIL)AND
		  UA.USER_ID = ANY( SC.SCHEDULER_USERIDS_FOR_EMAIL) AND
          SC.timeline_id IN (SELECT timeline_id FROM KEPPEL.schedule_timelines WHERE STATUS = 1 OR STATUS = 5)
          GROUP BY (SC.SCHEDULE_ID, PM.PLANT_ID, CT.CHECKLIST_ID)`);
        };
    } else {
        queryS.push(`SELECT SC.SCHEDULE_ID, SC.CHECKLIST_TEMPLATE_ID, (SC.START_DATE  + interval '8 hour' ) as START_DATE,(SC.END_DATE  + interval '8 hour' ) as END_DATE,
        SC.RECURRENCE_PERIOD,SC.REMINDER_RECURRENCE, SC.SCHEDULER_USERIDS_FOR_EMAIL, STRING_AGG(DISTINCT(U.user_email), ' ,') AS USERNAME,
		STRING_AGG(U.user_email, ' ,') AS USER_EMAILS,
		  STRING_AGG(UA.role_name, ' ,') AS ROLES,
		  STRING_AGG(U.first_name, ' ,') AS FNAME,
		  STRING_AGG(U.last_name, ' ,') AS LNAME,
		PM.PLANT_NAME, CT.CHL_NAME, SC.REMARKS
        FROM 
        KEPPEL.SCHEDULE_CHECKLIST  as SC,
        KEPPEL.USERS AS U,
		KEPPEL.USER_ACCESS AS UA,
        KEPPEL.PLANT_MASTER  AS PM,
        KEPPEL.CHECKLIST_TEMPLATES AS CT,
        KEPPEL.USER_PLANT AS UP
        WHERE
        U.USER_ID = ANY( SC.SCHEDULER_USERIDS_FOR_EMAIL) AND
        SC.PLANT_ID = PM.PLANT_ID AND 
        CT.CHECKLIST_ID = SC.CHECKLIST_TEMPLATE_ID AND 
		UA.USER_ID = ANY( SC.SCHEDULER_USERIDS_FOR_EMAIL) AND
        SC.PLANT_ID = ${req.params.plant_id}
        AND
        SC.timeline_id IN (SELECT timeline_id FROM KEPPEL.schedule_timelines WHERE STATUS = 1 OR STATUS = 5) 
        
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
        db.query("SELECT * from keppel.plant_master WHERE plant_id IN (SELECT UNNEST(string_to_array(allocatedplantids, ', ')::int[]) FROM keppel.user_access WHERE user_id = $1::integer)", [req.user.id], (err, result) => {
            if (err) throw err;
            if (result) {
                res.status(200).send(result.rows);
            }; 
        })
    } else {
        db.query(`SELECT * FROM keppel.plant_master`, (err, result) => {
            if (err) throw err;
            if (result) {
                res.status(200).send(result.rows);
            };
        }); 
    }
};

const getUserPlants = async(req, res, next) => {
    db.query("SELECT * from keppel.plant_master WHERE plant_id IN (SELECT UNNEST(string_to_array(allocatedplantids, ', ')::int[]) FROM keppel.user_access WHERE user_id = $1::integer)", [req.user.id], (err, result) => {
        if (err) throw err;
        if (result) {
            res.status(200).send(result.rows);
        }; 
    });
};

module.exports = {
    getViewSchedules, 
    getPlants,
    getUserPlants,
};