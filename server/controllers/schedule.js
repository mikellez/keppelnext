const db = require("../../db");
const moment = require("moment");
const dateHandler = require("../dateHandler");

// Function to get a schdeule dates
const makeScheduleDict = (arr) => {
    const newArr = [];
    arr.forEach((item) => {
        newArr.push({
            schedule_id: item["schedule_id"],
            timeline_id: item["timeline_id"],
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
const getViewSchedules = async (req, res, next) => {
    let queryS = [];
    if (req.params.id === "0") {
        if (req.user.role_id === 0 || req.user.role_id === 4) {
            queryS.push(`SELECT SC.SCHEDULE_ID, SC.CHECKLIST_TEMPLATE_ID, (SC.START_DATE  + interval '8 hour' ) as START_DATE,(SC.END_DATE  + interval '8 hour' ) as END_DATE,
            SC.RECURRENCE_PERIOD,SC.REMINDER_RECURRENCE, SC.SCHEDULER_USERIDS_FOR_EMAIL, STRING_AGG(DISTINCT(U.user_email), ' ,') AS USERNAME,
			STRING_AGG(U.user_email, ' ,') AS USER_EMAILS,
		  STRING_AGG(UA.role_name, ' ,') AS ROLES,
		  STRING_AGG(U.first_name, ' ,') AS FNAME,
		  STRING_AGG(U.last_name, ' ,') AS LNAME,
			PM.PLANT_NAME, CT.CHL_NAME, SC.REMARKS, SC.TIMELINE_ID
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
		  SC.REMARKS, SC.TIMELINE_ID
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
        }
    } else {
        queryS.push(`SELECT SC.SCHEDULE_ID, SC.CHECKLIST_TEMPLATE_ID, (SC.START_DATE  + interval '8 hour' ) as START_DATE,(SC.END_DATE  + interval '8 hour' ) as END_DATE,
        SC.RECURRENCE_PERIOD,SC.REMINDER_RECURRENCE, SC.SCHEDULER_USERIDS_FOR_EMAIL, STRING_AGG(DISTINCT(U.user_email), ' ,') AS USERNAME,
		STRING_AGG(U.user_email, ' ,') AS USER_EMAILS,
		  STRING_AGG(UA.role_name, ' ,') AS ROLES,
		  STRING_AGG(U.first_name, ' ,') AS FNAME,
		  STRING_AGG(U.last_name, ' ,') AS LNAME,
		PM.PLANT_NAME, CT.CHL_NAME, SC.REMARKS, SC.TIMELINE_ID
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
        SC.PLANT_ID = ${req.params.id}
        AND
        SC.timeline_id IN (SELECT timeline_id FROM KEPPEL.schedule_timelines WHERE STATUS = 1 OR STATUS = 5) 
        
        GROUP BY (SC.SCHEDULE_ID, PM.PLANT_ID, CT.CHECKLIST_ID)`);
    }
    console.log(queryS[0]);
    db.query(queryS[0], (err, result) => {
        if (err) throw err;
        if (result) {
            const response_dict = makeScheduleDict(result.rows);
            return res.status(200).send(response_dict);
        }
    });
};

// Get plants based on the user role
const getPlants = async (req, res, next) => {
    if (req.user.role_id === 0 || req.user.role_id === 4) {
        db.query(
            "SELECT * from keppel.plant_master WHERE plant_id IN (SELECT UNNEST(string_to_array(allocatedplantids, ', ')::int[]) FROM keppel.user_access WHERE user_id = $1::integer)",
            [req.user.id],
            (err, result) => {
                if (err) throw err;
                if (result) {
                    res.status(200).send(result.rows);
                }
            }
        );
    } else {
        db.query(`SELECT * FROM keppel.plant_master`, (err, result) => {
            if (err) throw err;
            if (result) {
                return res.status(200).send(result.rows);
            }
        });
    }
};

const getUserPlants = async (req, res, next) => {
    db.query(
        "SELECT * from keppel.plant_master WHERE plant_id IN (SELECT UNNEST(string_to_array(allocatedplantids, ', ')::int[]) FROM keppel.user_access WHERE user_id = $1::integer)",
        [req.user.id],
        (err, result) => {
            if (err) throw err;
            if (result) {
                return res.status(200).send(result.rows);
            }
        }
    );
};

// Create a new timeline
const createTimeline = async (req, res, next) => {
    db.query(
        "INSERT INTO keppel.schedule_timelines (timeline_name, description, created_date, created_by, status, plant_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING timeline_id",
        [
            req.body.data.name,
            req.body.data.description,
            new Date(),
            req.user.id,
            3,
            req.body.data.plantId,
        ],
        (err, found) => {
            if (err) throw err;
            if (found) return res.status(201).json(found.rows[0].timeline_id);
        }
    );
};

// Get timeline details
const getTimeline = async (req, res, next) => {
    db.query(
        `SELECT ST.timeline_id as id, ST.timeline_name as name, ST.description, ST.plant_id, ST.status, PM.plant_name
    FROM keppel.schedule_timelines ST 
    JOIN keppel.plant_master PM 
    ON ST.plant_id = PM.plant_id
    WHERE timeline_id = $1`,
        [req.params.id],
        (err, found) => {
            if (err) throw err;
            if (found.rows.length != 0) {
                found.rows[0].plantName = found.rows[0].plant_name;
                found.rows[0].plantId = found.rows[0].plant_id;
                delete found.rows[0].plant_name;
                delete found.rows[0].plant_id;
                return res.status(200).json(found.rows[0]);
            } else return res.status(404).json({ message: "No timeline found" });
        }
    );
};

// Get timeline specific schedules
const getSchedulesTimeline = async (req, res, next) => {
    db.query(
        `SELECT SC.SCHEDULE_ID, (SC.START_DATE  + interval '8 hour' ) as START_DATE,(SC.END_DATE  + interval '8 hour' ) as END_DATE,
        SC.RECURRENCE_PERIOD,SC.REMINDER_RECURRENCE, SC.SCHEDULER_USERIDS_FOR_EMAIL,
        PM.PLANT_NAME, CT.CHL_NAME,SC.CHECKLIST_TEMPLATE_ID, STRING_AGG(U.user_name, ' ,') AS USERNAME,
        STRING_AGG(U.user_email, ' ,') AS USER_EMAILS,
        STRING_AGG(UA.role_name, ' ,') AS ROLES,
        STRING_AGG(U.first_name, ' ,') AS FNAME,
        STRING_AGG(U.last_name, ' ,') AS LNAME,
        SC.REMARKS, SC.TIMELINE_ID
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
        SC.timeline_id = $1 
        GROUP BY (SC.SCHEDULE_ID, PM.PLANT_ID, CT.CHECKLIST_ID)`,
        [req.params.id],
        (err, result) => {
            if (err) throw err;
            if (result) {
                const response_dict = makeScheduleDict(result.rows);
                return res.status(200).send(response_dict);
            }
        }
    );
};

// Get timeline by the status
const getTimelineByStatus = (req, res, next) => {
    idRegex = new RegExp("^\\d+$", "m");
    if (req.params.id && !idRegex.test(req.params.id))
        return res.status(404).json({ message: "Invalid timeline id provided" });

    const queryS = req.params.id
        ? `SELECT ST.timeline_id as id, ST.timeline_name as name, ST.description, ST.plant_id, PM.plant_name, ST.status
    FROM keppel.schedule_timelines ST 
    JOIN keppel.plant_master PM 
    ON ST.plant_id = PM.plant_id
    WHERE status = $1 AND
    created_by = ${req.user.id}`
        : `SELECT ST.timeline_id as id, ST.timeline_name as name, ST.description, ST.plant_id, PM.plant_name, ST.status
    FROM keppel.schedule_timelines ST 
    JOIN keppel.plant_master PM 
    ON ST.plant_id = PM.plant_id
    WHERE status = $1`;
    db.query(queryS, [req.params.status], (err, found) => {
        if (err) throw err;
        if (found.rows.length != 0) {
            found.rows.map((timeline) => {
                timeline.plantId = timeline.plant_id;
                timeline.plantName = timeline.plant_name;
                delete timeline.plant_id;
                delete timeline.plant_name;
                return timeline;
            });
            return res.status(200).json(found.rows);
        } else return res.status(404).json({ message: "No timeline found" });
    });
};

// Edit timeline details
const editTimeline = (req, res, next) => {
    db.query(
        `UPDATE keppel.schedule_timelines SET timeline_name = $1, description = $2 WHERE timeline_id = $3 RETURNING timeline_id`,
        [req.body.data.name, req.body.data.description, req.params.id],
        (err, found) => {
            if (err) throw err;
            if (found) return res.status(200).json(found.rows[0].timeline_id);
        }
    );
};

// Change the status of timeline (Approve/Reject) Note that reject becomes draft
const changeTimelineStatus = (req, res, next) => {
    db.query(
        `UPDATE keppel.schedule_timelines SET status = $1 WHERE timeline_id = $2 RETURNING timeline_id`,
        [req.params.status, req.params.id],
        (err, found) => {
            if (err) throw err;
            if (found) return res.status(200).json(found.rows[0].timeline_id);
        }
    );
};

// Delete a timeline in draft
const deleteTimeline = async (req, res, next) => {
    db.query(
        `DELETE FROM keppel.schedule_checklist WHERE timeline_id = $1;`,
        [req.params.id],
        (err) => {
            if (err) throw err;
            else {
                db.query(
                    `DELETE FROM keppel.schedule_timelines WHERE timeline_id = $1;`,
                    [req.params.id],
                    (err) => {
                        if (err) throw err;
                    }
                );
            }
            return res.status(204).send("success");
        }
    );
};

// Delete a schedule in a timeline
const deleteSchedule = async (req, res, next) => {
    db.query(
        `DELETE FROM KEPPEL.SCHEDULE_CHECKLIST WHERE SCHEDULE_ID = $1`,
        [req.params.id],
        (err) => {
            if (err) console.log(err.message);
            else res.status(204).send("Successfully deleted");
        }
    );
};

// Get assigned-to users
const getOpsAndEngineers = async (req, res, next) => {
    db.query(
        `SELECT u.user_id as id, r.role_id, role_name, concat( concat(u.first_name , ' ') , u.last_name) AS name, user_email as email, first_name as fname, last_name as lname, user_name as username
        FROM keppel.user_role ur, keppel.role r, keppel.role_parent rp, keppel.users u 
        LEFT JOIN keppel.user_plant up ON up.user_id = u.user_id
            WHERE rp.role_id = r.role_id
                and rp.role_parent_id = ur.role_parent_id
                and u.user_id = ur.user_id
                and (r.role_name = 'Operation Specialist' or r.role_name = 'Engineer' or r.role_name = 'Manager')
                and up.plant_id =  $1;`,
        [req.params.plant_id],
        (err, result) => {
            if (err) throw err;
            if (result.rows.length == 0) {
                return res.status(201).send({
                    success: false,
                    msg: "No Operators added",
                });
            }
            return res.status(200).send(result.rows);
        }
    );
};

const insertSchedule = async (req, res, next) => {
    db.query(
        `INSERT INTO keppel.schedule_checklist
        (checklist_template_id, remarks, start_date, end_date, recurrence_period, reminder_recurrence, scheduler_history, user_id, scheduler_userids_for_email, plant_id, timeline_id, prev_schedule_id) 
        VALUES ($1, $2, $3, $4, $5, $6, CONCAT('created by',$7::varchar), $8, $9::int[], $10, $11, $12);`,
        [
            req.body.schedule.checklistId,
            req.body.schedule.remarks,
            moment(req.body.schedule.startDate).format("YYYY-MM-DD HH:mm:ss"),
            moment(req.body.schedule.endDate).format("YYYY-MM-DD HH:mm:ss"),
            req.body.schedule.recurringPeriod,
            req.body.schedule.reminderRecurrence,
            req.user.id,
            req.user.id,
            req.body.schedule.assignedIds,
            req.body.schedule.plantId,
            req.body.schedule.timelineId,
            req.body.schedule.prevId,
        ],
        (err, result) => {
            if (err) throw err;
            if (result) return res.status(200).send("success");
        }
    );
};

module.exports = {
    getViewSchedules,
    getPlants,
    getUserPlants,
    createTimeline,
    getTimeline,
    getSchedulesTimeline,
    getTimelineByStatus,
    editTimeline,
    changeTimelineStatus,
    deleteTimeline,
    deleteSchedule,
    getOpsAndEngineers,
    insertSchedule,
};
