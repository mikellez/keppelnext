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
      plantId: item["plant_id"],
      start_date: item["start_date"],
      end_date: item["end_date"],
      // prev_start_date: item["prev_start_date"],
      // prev_end_date: item["prev_end_date"],
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
      exclusionList: item["exclusion_list"],
      isSingle: item["index"] != null ? true : false,
      index: item["index"],
      prev_schedule_id: item["prev_schedule_id"],
      status: item["status"],
    });
  });
  return newArr;
};

const updateDates = async (scheduleList) => {
  for (let i = 0; i < scheduleList.length; i++) {
    if (scheduleList[i].isSingle) {
      const result = await global.db.query(`SELECT 
      (SC.START_DATE  + interval '8 hour' ) AS START_DATE, 
      (SC.END_DATE  + interval '8 hour' ) AS END_DATE,
      SC.RECURRENCE_PERIOD
      FROM 
      KEPPEL.SCHEDULE_CHECKLIST SC
      WHERE 
      SC.SCHEDULE_ID = GET_ROOT_ID(${scheduleList[i].schedule_id})`);

      scheduleList[i].start_date = result.rows[0].start_date;
      scheduleList[i].end_date = result.rows[0].end_date;
      scheduleList[i].period = result.rows[0].recurrence_period;
    }
  }
  return scheduleList;
};

// Get all schedules or plant specific schedules
const getViewSchedules = async (req, res, next) => {
  let queryS = [];
  if (req.params.id === "0") {
    if (req.user.role_id === 0 || req.user.role_id === 4) {
      queryS.push(`
            SELECT DISTINCT SC.SCHEDULE_ID, SC.CHECKLIST_TEMPLATE_ID, (SC.START_DATE  + interval '8 hour' ) as START_DATE,(SC.END_DATE  + interval '8 hour' ) as END_DATE,
                    SC.RECURRENCE_PERIOD,SC.REMINDER_RECURRENCE, SC.SCHEDULER_USERIDS_FOR_EMAIL, 
                    STRING_AGG(DISTINCT(U.user_email), ' ,') AS USERNAME,
                    STRING_AGG(U.user_email, ' ,') AS USER_EMAILS,
                    STRING_AGG(UA.role_name, ' ,') AS ROLES,
                    STRING_AGG(U.first_name, ' ,') AS FNAME,
                    STRING_AGG(U.last_name, ' ,') AS LNAME,
                    PM.PLANT_NAME, PM.PLANT_ID, CT.CHL_NAME, SC.REMARKS, SC.TIMELINE_ID, SC.STATUS, SC.PREV_SCHEDULE_ID
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
                    U.USER_ID = UA.USER_ID AND
                    SC.PLANT_ID =ANY(SELECT DISTINCT(PLANT_ID) FROM KEPPEL.USER_PLANT WHERE USER_ID = ${req.user.id} OR ${req.user.id} = ANY(SC.SCHEDULER_USERIDS_FOR_EMAIL)) AND
                    SC.timeline_id IN (SELECT timeline_id FROM KEPPEL.schedule_timelines WHERE STATUS = 1 OR STATUS = 5) AND
                    (SC.STATUS = 1 OR SC.STATUS = 5)
                GROUP BY (SC.SCHEDULE_ID, PM.PLANT_ID, CT.CHECKLIST_ID)
            UNION ALL
            SELECT DISTINCT SC.SCHEDULE_ID, SC.CHECKLIST_TEMPLATE_ID, (SC.START_DATE  + interval '8 hour' ) as START_DATE,(SC.END_DATE  + interval '8 hour' ) as END_DATE,
                    SC.RECURRENCE_PERIOD,SC.REMINDER_RECURRENCE, SC.SCHEDULER_USERIDS_FOR_EMAIL,
                    '' AS USERNAME,
                    '' AS USER_EMAILS,
                    '' AS ROLES,
                    '' AS FNAME,
                    '' AS LNAME,
                    PM.PLANT_NAME, PM.PLANT_ID, CT.CHL_NAME, SC.REMARKS, SC.TIMELINE_ID, SC.STATUS, SC.PREV_SCHEDULE_ID
                FROM 
                    KEPPEL.SCHEDULE_CHECKLIST  as SC,
                    KEPPEL.PLANT_MASTER  AS PM,
                    KEPPEL.CHECKLIST_TEMPLATES AS CT,
                    KEPPEL.USER_PLANT AS UP
                WHERE
                    SC.PLANT_ID = PM.PLANT_ID AND 
                    CT.CHECKLIST_ID = SC.CHECKLIST_TEMPLATE_ID AND
                    (SC.SCHEDULER_USERIDS_FOR_EMAIL IS NULL OR SC.SCHEDULER_USERIDS_FOR_EMAIL = '{}')  AND
                    SC.PLANT_ID =ANY(SELECT DISTINCT(PLANT_ID) FROM KEPPEL.USER_PLANT WHERE USER_ID = 17 OR 17 = ANY(SC.SCHEDULER_USERIDS_FOR_EMAIL)) AND
                    SC.timeline_id IN (SELECT timeline_id FROM KEPPEL.schedule_timelines WHERE STATUS = 1 OR STATUS = 5) AND
                    (SC.STATUS = 1 OR SC.STATUS = 5)
                GROUP BY (SC.SCHEDULE_ID, PM.PLANT_ID, CT.CHECKLIST_ID)`);
    } else {
      queryS.push(`
            SELECT DISTINCT SC.SCHEDULE_ID, (SC.START_DATE  + interval '8 hour' ) as START_DATE,(SC.END_DATE  + interval '8 hour' ) as END_DATE,
                    SC.RECURRENCE_PERIOD,SC.REMINDER_RECURRENCE, SC.SCHEDULER_USERIDS_FOR_EMAIL,
                    PM.PLANT_NAME, PM.PLANT_ID, CT.CHL_NAME,SC.CHECKLIST_TEMPLATE_ID, STRING_AGG(U.user_name, ' ,') AS USERNAME,
                    STRING_AGG(U.user_email, ' ,') AS USER_EMAILS,
                    STRING_AGG(UA.role_name, ' ,') AS ROLES,
                    STRING_AGG(U.first_name, ' ,') AS FNAME,
                    STRING_AGG(U.last_name, ' ,') AS LNAME,
                    SC.REMARKS, SC.TIMELINE_ID, SC.EXCLUSION_LIST, SC.INDEX, SC.STATUS, SC.PREV_SCHEDULE_ID
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
                    U.USER_ID = UA.USER_ID AND
                    SC.timeline_id IN (SELECT timeline_id FROM KEPPEL.schedule_timelines WHERE STATUS = 1 OR STATUS = 5) AND
                    (SC.STATUS = 1 OR SC.STATUS = 5)
                GROUP BY (SC.SCHEDULE_ID, PM.PLANT_ID, CT.CHECKLIST_ID)
            UNION ALL 
            SELECT DISTINCT SC.SCHEDULE_ID, (SC.START_DATE  + interval '8 hour' ) as START_DATE,(SC.END_DATE  + interval '8 hour' ) as END_DATE,
                    SC.RECURRENCE_PERIOD,SC.REMINDER_RECURRENCE, SC.SCHEDULER_USERIDS_FOR_EMAIL,
                    PM.PLANT_NAME, PM.PLANT_ID, CT.CHL_NAME,SC.CHECKLIST_TEMPLATE_ID,
                    '' AS USERNAME,
                    '' AS USER_EMAILS,
                    '' AS ROLES,
                    '' AS FNAME,
                    '' AS LNAME,
                    SC.REMARKS, SC.TIMELINE_ID, SC.EXCLUSION_LIST, SC.INDEX, SC.STATUS, SC.PREV_SCHEDULE_ID
                FROM 
                    KEPPEL.SCHEDULE_CHECKLIST  as SC,
                    KEPPEL.PLANT_MASTER  AS PM,
                    KEPPEL.CHECKLIST_TEMPLATES AS CT
                WHERE
                    SC.PLANT_ID = PM.PLANT_ID AND 
                    CT.CHECKLIST_ID = SC.CHECKLIST_TEMPLATE_ID AND
                    (SC.SCHEDULER_USERIDS_FOR_EMAIL IS NULL OR SC.SCHEDULER_USERIDS_FOR_EMAIL = '{}')  AND
                    SC.timeline_id IN (SELECT timeline_id FROM KEPPEL.schedule_timelines WHERE STATUS = 1 OR STATUS = 5) AND
                    (SC.STATUS = 1 OR SC.STATUS = 5)
                GROUP BY (SC.SCHEDULE_ID, PM.PLANT_ID, CT.CHECKLIST_ID)`);
    }
  } else {
    queryS.push(`
        SELECT DISTINCT SC.SCHEDULE_ID, SC.CHECKLIST_TEMPLATE_ID, (SC.START_DATE  + interval '8 hour' ) as START_DATE,(SC.END_DATE  + interval '8 hour' ) as END_DATE,
                SC.RECURRENCE_PERIOD,SC.REMINDER_RECURRENCE, SC.SCHEDULER_USERIDS_FOR_EMAIL, STRING_AGG(DISTINCT(U.user_email), ' ,') AS USERNAME,
                STRING_AGG(U.user_email, ' ,') AS USER_EMAILS,
                STRING_AGG(UA.role_name, ' ,') AS ROLES,
                STRING_AGG(U.first_name, ' ,') AS FNAME,
                STRING_AGG(U.last_name, ' ,') AS LNAME,
                PM.PLANT_NAME, PM.PLANT_ID, CT.CHL_NAME, 
                SC.REMARKS, SC.TIMELINE_ID, SC.EXCLUSION_LIST, SC.INDEX, SC.STATUS, SC.PREV_SCHEDULE_ID
            FROM 
                KEPPEL.SCHEDULE_CHECKLIST  as SC,
                KEPPEL.USERS AS U,
                KEPPEL.USER_ACCESS AS UA,
                KEPPEL.PLANT_MASTER  AS PM,
                KEPPEL.CHECKLIST_TEMPLATES AS CT
            WHERE
                U.USER_ID = ANY( SC.SCHEDULER_USERIDS_FOR_EMAIL) AND
                SC.PLANT_ID = PM.PLANT_ID AND 
                CT.CHECKLIST_ID = SC.CHECKLIST_TEMPLATE_ID AND 
                UA.USER_ID = ANY( SC.SCHEDULER_USERIDS_FOR_EMAIL) AND
                U.USER_ID = UA.USER_ID AND
                SC.PLANT_ID = ${req.params.id} AND
                SC.timeline_id IN (SELECT timeline_id FROM KEPPEL.schedule_timelines WHERE STATUS = 1 OR STATUS = 5) AND
                (SC.STATUS = 1 OR SC.STATUS = 5)
            GROUP BY (SC.SCHEDULE_ID, PM.PLANT_ID, CT.CHECKLIST_ID)
        UNION ALL 
        SELECT DISTINCT SC.SCHEDULE_ID, SC.CHECKLIST_TEMPLATE_ID, (SC.START_DATE  + interval '8 hour' ) as START_DATE,(SC.END_DATE  + interval '8 hour' ) as END_DATE,
                SC.RECURRENCE_PERIOD,SC.REMINDER_RECURRENCE, SC.SCHEDULER_USERIDS_FOR_EMAIL, 
		            '' AS USERNAME,
                '' AS USER_EMAILS,
                '' AS ROLES,
                '' AS FNAME,
                '' AS LNAME,
                PM.PLANT_NAME, PM.PLANT_ID, CT.CHL_NAME, 
                SC.REMARKS, SC.TIMELINE_ID, SC.EXCLUSION_LIST, SC.INDEX, SC.STATUS, SC.PREV_SCHEDULE_ID
            FROM 
                KEPPEL.SCHEDULE_CHECKLIST  as SC,
                KEPPEL.PLANT_MASTER  AS PM,
                KEPPEL.CHECKLIST_TEMPLATES AS CT
            WHERE
                SC.PLANT_ID = PM.PLANT_ID AND 
                CT.CHECKLIST_ID = SC.CHECKLIST_TEMPLATE_ID AND 
                SC.PLANT_ID = ${req.params.id} AND
                (SC.SCHEDULER_USERIDS_FOR_EMAIL IS NULL OR SC.SCHEDULER_USERIDS_FOR_EMAIL = '{}')  AND
                SC.timeline_id IN (SELECT timeline_id FROM KEPPEL.schedule_timelines WHERE STATUS = 1 OR STATUS = 5) AND
                (SC.STATUS = 1 OR SC.STATUS = 5)   
            GROUP BY (SC.SCHEDULE_ID, PM.PLANT_ID, CT.CHECKLIST_ID)`);
  }
  // console.log(queryS[0]);
  global.db.query(queryS[0], (err, schedules) => {
    if (err) throw err;
    if (schedules) {
      const response_dict = makeScheduleDict(schedules.rows);
      updateDates(response_dict)
        .then((result) => {
          return res.status(200).send(result);
        })
        .catch((err) => console.log(err));
    }
  });
};

// Get plants based on the user role
const getPlants = async (req, res, next) => {
  if (req?.user) {
    global.db.query(
      `SELECT * from keppel.plant_master WHERE plant_id IN (SELECT UNNEST(string_to_array(allocatedplantids, ', ')::int[])
             FROM keppel.user_access WHERE user_id = $1::integer) ORDER BY plant_id ASC`,
      [req.user.id],
      (err, result) => {
        if (err) throw err;
        if (result) {
          res.status(200).send(result.rows);
        }
      }
    );
  } else {
    global.db.query(
      `SELECT * FROM keppel.plant_master ORDER BY plant_id ASC`,
      (err, result) => {
        if (err) throw err;
        if (result) {
          return res.status(200).send(result.rows);
        }
      }
    );
  }
};

const getPlantById = async (req, res, next) => {
  global.db.query(
    "SELECT * from keppel.plant_master WHERE plant_id = $1::integer",
    [req.params.id],
    (err, result) => {
      if (err) throw err;
      if (result) {
        res.status(200).send(result.rows);
      }
    }
  );
};

const getUserPlants = async (req, res, next) => {
  global.db.query(
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
  global.db.query(
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
  global.db.query(
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
  global.db.query(
    // first select is for schedules that are assigned to specific users
    // second select is for schedules with no specific users assigned
    // union together to return all related schedules (both assignned and not assigned)
    `SELECT SC.SCHEDULE_ID, (SC.START_DATE  + interval '8 hour' ) as START_DATE,(SC.END_DATE  + interval '8 hour' ) as END_DATE,
        SC.RECURRENCE_PERIOD,SC.REMINDER_RECURRENCE, SC.SCHEDULER_USERIDS_FOR_EMAIL,
        PM.PLANT_NAME, PM.PLANT_ID, CT.CHL_NAME,SC.CHECKLIST_TEMPLATE_ID, STRING_AGG(U.user_name, ' ,') AS USERNAME,
        STRING_AGG(U.user_email, ' ,') AS USER_EMAILS,
        STRING_AGG(UA.role_name, ' ,') AS ROLES,
        STRING_AGG(U.first_name, ' ,') AS FNAME,
        STRING_AGG(U.last_name, ' ,') AS LNAME,
        SC.REMARKS, SC.TIMELINE_ID, SC.EXCLUSION_LIST, SC.INDEX, SC.STATUS, SC.PREV_SCHEDULE_ID
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
        GROUP BY (SC.SCHEDULE_ID, PM.PLANT_ID, CT.CHECKLIST_ID)
    UNION ALL
    SELECT SC.SCHEDULE_ID, (SC.START_DATE  + interval '8 hour' ) as START_DATE,(SC.END_DATE  + interval '8 hour' ) as END_DATE,
            SC.RECURRENCE_PERIOD,SC.REMINDER_RECURRENCE, SC.SCHEDULER_USERIDS_FOR_EMAIL,
            PM.PLANT_NAME, PM.PLANT_ID, CT.CHL_NAME,SC.CHECKLIST_TEMPLATE_ID, 
            '' AS USERNAME,
            '' AS USER_EMAILS,
            '' AS ROLES,
            '' AS FNAME,
            '' AS LNAME,
            SC.REMARKS, SC.TIMELINE_ID, SC.EXCLUSION_LIST, SC.INDEX, SC.STATUS, SC.PREV_SCHEDULE_ID
        FROM 
            KEPPEL.SCHEDULE_CHECKLIST  as SC,
            KEPPEL.PLANT_MASTER  AS PM,
            KEPPEL.CHECKLIST_TEMPLATES AS CT
        WHERE
            SC.PLANT_ID = PM.PLANT_ID AND 
            CT.CHECKLIST_ID = SC.CHECKLIST_TEMPLATE_ID AND
            (SC.SCHEDULER_USERIDS_FOR_EMAIL IS NULL OR SC.SCHEDULER_USERIDS_FOR_EMAIL = '{}')  AND
            SC.timeline_id = $1 
            GROUP BY (SC.SCHEDULE_ID, PM.PLANT_ID, CT.CHECKLIST_ID)`,
    [req.params.id],
    (err, schedules) => {
      if (err) throw err;
      if (schedules) {
        const response_dict = makeScheduleDict(schedules.rows);
        updateDates(response_dict)
          .then((result) => {
            return res.status(200).send(result);
          })
          .catch((err) => console.log(err));
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
  global.db.query(queryS, [req.params.status], (err, found) => {
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
  global.db.query(
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
  const status = +req.params.status;
  const queryS =
    status === 1
      ? `
      UPDATE keppel.schedule_checklist
      SET start_date = NULL, end_date = NULL
      WHERE timeline_id = (SELECT timeline_id FROM keppel.schedule_timelines 
                           WHERE status = 1 AND plant_id = (SELECT plant_id FROM keppel.schedule_timelines
                                                           WHERE timeline_id = ${req.params.id})) AND
      start_date > CURRENT_DATE + interval '8 hour';
      
      UPDATE keppel.schedule_checklist AS SC 
      SET scheduler_history = ''||scheduler_history||', end date updated from '||end_date,
      end_date = CURRENT_DATE + interval '8 hour' - interval '1 day'
      WHERE timeline_id = (SELECT timeline_id FROM keppel.schedule_timelines 
                WHERE status = 1 AND plant_id = (SELECT plant_id FROM keppel.schedule_timelines
                                WHERE timeline_id = ${req.params.id}))
      AND start_date IS NOT NULL;
      
      UPDATE keppel.schedule_checklist sc
      SET status = 5 
      WHERE timeline_id IN (
        SELECT timeline_id FROM keppel.schedule_timelines st WHERE st.plant_id = (
          SELECT plant_id FROM keppel.schedule_timelines
            WHERE timeline_id = ${req.params.id}
        ) AND st.status = 1
      );
      
      
      UPDATE keppel.schedule_timelines 
      SET status = 5 
      WHERE status = 1 AND plant_id = (SELECT plant_id FROM keppel.schedule_timelines
                                WHERE timeline_id = ${req.params.id});
      
      
      
      
      UPDATE keppel.schedule_timelines SET status = 1 WHERE timeline_id = ${req.params.id} RETURNING *;
      
      UPDATE keppel.schedule_checklist SET status = 1 WHERE timeline_id = ${req.params.id};
    `
      : `
    UPDATE keppel.schedule_checklist SET status = ${req.params.status} WHERE timeline_id = ${req.params.id};
    UPDATE keppel.schedule_timelines SET status = ${req.params.status} WHERE timeline_id = ${req.params.id} RETURNING *;
    `;
  global.db.query(queryS, (err, found) => {
    if (err) throw err;
    if (found) return res.status(200).json(req.params.id);
  });
};

// Delete a timeline in draft
const deleteTimeline = async (req, res, next) => {
  global.db.query(
    `DELETE FROM keppel.schedule_checklist WHERE timeline_id = $1;`,
    [req.params.id],
    (err) => {
      if (err) throw err;
      else {
        global.db.query(
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
  global.db.query(
    `DELETE FROM KEPPEL.SCHEDULE_CHECKLIST WHERE SCHEDULE_ID = $1`,
    [req.params.id],
    (err) => {
      if (err) console.log(err.message);
      else res.status(204).send("Schedule uccessfully deleted");
    }
  );
};

// Get assigned-to users
const getOpsAndEngineers = async (req, res, next) => {
  let sql;
  const arr = req.params.plant_id.split(",");
  for (let i = 0; i < arr.length; i++) {
    arr[i] = +arr[i];
  }

  if (req.params.plant_id.toString().length > 1) {
    sql = `SELECT DISTINCT(u.user_id) as id, concat( concat(u.first_name , ' ') , u.last_name) AS name, user_email as email, first_name as fname, last_name as lname, user_name as username
          FROM keppel.users u
          LEFT JOIN keppel.user_plant up ON up.user_id = u.user_id
          WHERE up.plant_id = ANY($1::int[])`;
  } else {
    sql = `SELECT u.user_id as id, r.role_id, role_name, concat( concat(u.first_name , ' ') , u.last_name) AS name, user_email as email, first_name as fname, last_name as lname, user_name as username
    FROM keppel.user_role ur, keppel.role r, keppel.role_parent rp, keppel.users u 
    LEFT JOIN keppel.user_plant up ON up.user_id = u.user_id
        WHERE rp.role_id = r.role_id
            and rp.role_parent_id = ur.role_parent_id
            and u.user_id = ur.user_id
            and (r.role_name = 'Operation Specialist' or r.role_name = 'Engineer' or r.role_name = 'Manager')
            and up.plant_id = $1;`;
  }
  global.db.query(
    sql,
    [req.params.plant_id.toString().length > 1 ? arr : req.params.plant_id],
    (err, result) => {
      if (err) throw err;
      if (result.rows.length == 0) {
        // console.log(sql);
        // console.log(result.rows);

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
  global.db.query(
    `INSERT INTO keppel.schedule_checklist
        (checklist_template_id, remarks, start_date, end_date, recurrence_period, reminder_recurrence, scheduler_history, user_id, scheduler_userids_for_email, plant_id, timeline_id, prev_schedule_id, status, index) 
        VALUES ($1, $2, $3, $4, $5, $6, CONCAT('created by',$7::varchar), $8, $9::int[], $10, $11, $12, $13, $14);`,
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
      req.body.schedule.status,
      req.body.schedule.index,
    ],
    (err, result) => {
      if (err) throw err;
      if (result) return res.status(200).send("success");
    }
  );
};

const manageSingleEvent = (req, res, next) => {
  if (req.body.action === "approve") {
    global.db.query(
      "UPDATE KEPPEL.SCHEDULE_CHECKLIST SET STATUS = 1 WHERE SCHEDULE_ID = $1 RETURNING INDEX, PREV_SCHEDULE_ID",
      [req.body.schedule.schedule_id],
      (err, found) => {
        if (err) throw err;
        // console.log(found.rows);
        global.db.query(
          `UPDATE KEPPEL.SCHEDULE_CHECKLIST 
            SET EXCLUSION_LIST = ARRAY_APPEND(EXCLUSION_LIST, ${found.rows[0].index}) 
            WHERE SCHEDULE_ID = ${found.rows[0].prev_schedule_id}; 

            SELECT SC.SCHEDULE_ID, 
            CT.CHL_NAME, 
            STRING_AGG(DISTINCT(U.user_email), ' ,') AS EMAILS, 
            U1.USER_EMAIL
            FROM KEPPEL.SCHEDULE_CHECKLIST SC
            JOIN KEPPEL.USERS U1 ON SC.USER_ID = U1.USER_ID,
            KEPPEL.USERS U,
            KEPPEL.CHECKLIST_TEMPLATES CT
            WHERE 
            SC.CHECKLIST_TEMPLATE_ID = CT.CHECKLIST_ID AND
            U.USER_ID = ANY( SC.SCHEDULER_USERIDS_FOR_EMAIL) AND
            SC.SCHEDULE_ID = ${found.rows[0].prev_schedule_id}
            GROUP BY (SC.SCHEDULE_ID, CT.CHL_NAME, U1.USER_EMAIL)`,
          (err, found) => {
            if (err) throw err;
            // mailer()
            return res.status(200).send("event approved");
          }
        );
      }
    );
  } else if (req.body.action === "reject") {
    global.db.query(
      "UPDATE KEPPEL.SCHEDULE_CHECKLIST SET STATUS = 2 WHERE SCHEDULE_ID = $1",
      [req.body.schedule.schedule_id],
      (err, found) => {
        if (err) throw err;
        return res.status(200).send("event rejected");
      }
    );
  } else if (req.body.action === "edit") {
    const data = req.body.scheduleData;
    global.db.query(
      `UPDATE KEPPEL.SCHEDULE_CHECKLIST 
            SET START_DATE = $1,
            END_DATE = $2,
            REMARKS = $3,
            SCHEDULER_USERIDS_FOR_EMAIL = ARRAY [${data.userIds}]
            WHERE SCHEDULE_ID = $4`,
      [data.startDate, data.endDate, data.remarks, req.params.schedule_id],
      (err, found) => {
        if (err) throw err;
        return res.status(200).send("event edited");
      }
    );
  } else {
    return res.status(404).send("Invalid management action");
  }
};

const createSingleEvent = (req, res, next) => {
  const data = req.body.schedule;
  global.db.query(
    `INSERT INTO KEPPEL.SCHEDULE_CHECKLIST 
            (
                CHECKLIST_TEMPLATE_ID, 
                REMARKS, 
                START_DATE, 
                END_DATE, 
                RECURRENCE_PERIOD, 
                REMINDER_RECURRENCE, 
                SCHEDULER_HISTORY,
                USER_ID,
                SCHEDULER_USERIDS_FOR_EMAIL,
                PLANT_ID,
                PREV_SCHEDULE_ID,
                TIMELINE_ID,
                STATUS,
                INDEX
            )
            VALUES ($1, $2, $3, $4, 0, 1, $5, $6, ARRAY [${data.userIds}], $7, $8, $9, 4, $10)`,
    [
      data.checklistId,
      data.remarks,
      data.startDate,
      data.endDate,
      `PENDING_previous date: ${data.prevDate}_created by ${data.userId}`,
      data.userId,
      data.plantId,
      req.params.schedule_id,
      data.timelineId,
      req.params.index,
    ],
    (err) => {
      if (err) throw err;
      return res.send("event changed");
    }
  );
};

const getPendingSingleEvents = (req, res, next) => {
  global.db.query(
    `SELECT 
        ST.TIMELINE_ID,
        ST.TIMELINE_NAME,
        ST.DESCRIPTION,
        ST.PLANT_ID,
        SC.SCHEDULE_ID,
        CT.CHL_NAME
        FROM KEPPEL.SCHEDULE_TIMELINES ST
        JOIN KEPPEL.SCHEDULE_CHECKLIST SC ON ST.TIMELINE_ID = SC.TIMELINE_ID
        JOIN KEPPEL.CHECKLIST_TEMPLATES CT ON CT.CHECKLIST_ID = SC.CHECKLIST_TEMPLATE_ID
        WHERE SC.INDEX IS NOT NULL AND SC.STATUS = 4`,
    (err, found) => {
      if (err) throw err;
      if (found.rows.length === 0)
        return res.status(404).send("no pending schedules");
      return res.send(
        found.rows.map((item) => {
          return {
            id: item.timeline_id,
            name: item.timeline_name,
            plantId: item.plant_id,
            description: item.description,
            scheduleId: item.schedule_id,
            checklistName: item.chl_name,
          };
        })
      );
    }
  );
};

const getScheduleById = (req, res, next) => {
  global.db.query(
    `SELECT SC.SCHEDULE_ID, (SC.START_DATE  + interval '8 hour' ) as START_DATE,(SC.END_DATE  + interval '8 hour' ) as END_DATE,
            SC.RECURRENCE_PERIOD,SC.REMINDER_RECURRENCE, SC.SCHEDULER_USERIDS_FOR_EMAIL,
            PM.PLANT_NAME, PM.PLANT_ID, CT.CHL_NAME,SC.CHECKLIST_TEMPLATE_ID, STRING_AGG(U.user_name, ' ,') AS USERNAME,
            STRING_AGG(U.user_email, ' ,') AS USER_EMAILS,
            STRING_AGG(UA.role_name, ' ,') AS ROLES,
            STRING_AGG(U.first_name, ' ,') AS FNAME,
            STRING_AGG(U.last_name, ' ,') AS LNAME,
            SC.REMARKS, SC.TIMELINE_ID, SC.EXCLUSION_LIST, SC.INDEX, SC.STATUS, SC.PREV_SCHEDULE_ID
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
            SC.SCHEDULE_ID = $1
        GROUP BY (SC.SCHEDULE_ID, PM.PLANT_ID, CT.CHECKLIST_ID)
        UNION ALL
        SELECT SC.SCHEDULE_ID, (SC.START_DATE  + interval '8 hour' ) as START_DATE,(SC.END_DATE  + interval '8 hour' ) as END_DATE,
            SC.RECURRENCE_PERIOD,SC.REMINDER_RECURRENCE, SC.SCHEDULER_USERIDS_FOR_EMAIL,
            PM.PLANT_NAME, PM.PLANT_ID, CT.CHL_NAME,SC.CHECKLIST_TEMPLATE_ID, 
            '' AS USERNAME,
            '' AS USER_EMAILS,
            '' AS ROLES,
            '' AS FNAME,
            '' AS LNAME,
            SC.REMARKS, SC.TIMELINE_ID, SC.EXCLUSION_LIST, SC.INDEX, SC.STATUS, SC.PREV_SCHEDULE_ID
        FROM 
            KEPPEL.SCHEDULE_CHECKLIST  as SC,
            KEPPEL.PLANT_MASTER  AS PM,
            KEPPEL.CHECKLIST_TEMPLATES AS CT
        WHERE
            SC.PLANT_ID = PM.PLANT_ID AND 
            CT.CHECKLIST_ID = SC.CHECKLIST_TEMPLATE_ID AND
            (SC.SCHEDULER_USERIDS_FOR_EMAIL IS NULL OR SC.SCHEDULER_USERIDS_FOR_EMAIL = '{}')  AND
            SC.SCHEDULE_ID = $1
        GROUP BY (SC.SCHEDULE_ID, PM.PLANT_ID, CT.CHECKLIST_ID) `,

    [req.params.id],
    (err, schedules) => {
      if (err) throw err;
      if (schedules) {
        const response_dict = makeScheduleDict(schedules.rows);
        updateDates(response_dict)
          .then((result) => {
            return res.status(200).send(result);
          })
          .catch((err) => console.log(err));
      }
    }
  );
};

const updateSchedule = async (req, res, next) => {
  global.db.query(
    `
    UPDATE keppel.schedule_checklist SET
        checklist_template_id = $1,
        remarks = $2,
        start_date = $3, 
        end_date = $4, 
        recurrence_period = $5, 
        reminder_recurrence = $6, 
        scheduler_history = CONCAT('created by',$7::varchar), 
        user_id = $8, 
        scheduler_userids_for_email = $9::int[], 
        plant_id = $10, 
        timeline_id = $11, 
        prev_schedule_id = $12, 
        status = 3 
    WHERE schedule_id = $13;`,
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
      req.body.schedule.scheduleId,
    ],
    (err, result) => {
      if (err) throw res.status(500).send("unable to update schedule");
      if (result) return res.status(200).send("schedule successfully updated");
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
  manageSingleEvent,
  createSingleEvent,
  getPendingSingleEvents,
  getScheduleById,
  updateSchedule,
  getPlantById,
};
