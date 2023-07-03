const db = require("../../db");
const { generateCSV } = require("../csvGenerator");
const moment = require("moment");
const {
  CreateFeedbackMail,
  AssignFeedbackMail,
  CompletedFeedbackMail,
} = require("../mailer/FeedbackMail");
const { getMaxListeners } = require("process");

/** Express router providing user related routes
 * @module controllers/feedback
 * @requires db
 */

const ITEMS_PER_PAGE = 10;

const fetchAllFeedbackQuery = `
SELECT 
  f.feedback_id as id, 
  f.plant_loc_id,
  f.plant_id, 
  f.description,
  f.contact,
  f.imageurl as image,
  f.status_id,
  f.activity_log,
  f.completed_date,
  f.remarks,
  concat( concat(createdU.first_name ,' '), createdU.last_name ) AS createdByUser,
  concat( concat(assignU.first_name ,' '), assignU.last_name ) AS assigned_user_name,
	pl.loc_room,
	pl.loc_id,
	pl.loc_floor,
  pm.plant_name,
  pm.plant_id,
  f.created_date,
  f.assigned_user_id,
  st.status,
  f.name,
  f.created_user_id,
  f.completed_img
FROM 
    keppel.users u
    JOIN keppel.user_access ua ON u.user_id = ua.user_id
    JOIN keppel.feedback f  on ua.allocatedplantids LIKE concat(concat('%',f.plant_id::text), '%')
    LEFT JOIN (
        SELECT 
            t3.feedback_id
        FROM  
            keppel.feedback AS t3
        GROUP BY t3.feedback_id) tmp1 ON tmp1.feedback_id = f.feedback_id
    LEFT JOIN keppel.users assignU ON assignU.user_id = f.assigned_user_id
    LEFT JOIN keppel.users createdU ON createdU.user_id = f.created_user_id
    LEFT JOIN keppel.plant_master pm ON pm.plant_id = f.plant_id
    LEFT JOIN keppeL.plant_location pl ON pl.loc_id = f.plant_loc_id
    JOIN keppel.status_fm st ON st.status_id = f.status_id	
`;

const fetchPendingFeedbackQuery =
  fetchAllFeedbackQuery +
  `
WHERE 
    ua.user_id = $1 AND 
    (f.status_id = 1)
ORDER BY f.feedback_id DESC
`;

const getAllFeedBackQuery = (expand, search) => {
  let expandCond = "";
  let SELECT_ARR = [];

  const SELECT = {
    id: "f.feedback_id AS id",
    plant_loc_id: "f.plant_loc_id",
    plant_id: "f.plant_id",
    description: "f.description",
    contact: "f.contact",
    image: "f.imageurl",
    status_id: "f.status_id",
    activity_log: "f.activity_log",
    completed_date: "f.completed_date",
    remarks: "f.remarks",
    createdByUser: "concat( concat(createdU.first_name ,' '), createdU.last_name ) AS createdByUser",
    assigned_user_name: "concat( concat(assignU.first_name ,' '), assignU.last_name ) AS assigned_user_name",
    loc_room: "pl.loc_room",
    loc_id: "pl.loc_id",
    loc_floor: "pl.loc_floor",
    plant_name: "pm.plant_name",
    plant_id: "pm.plant_id",
    created_date: "f.created_date",
    assigned_user_id: "f.assigned_user_id",
    status: "st.status",
    name: "f.name",
    created_user_id: "f.created_user_id",
    completed_img: "f.completed_img"
  }

  if (expand) {
    const expandArr = expand.split(",");

    SELECT_ARR = [];
    for (let i = 0; i < expandArr.length; i++) {
      SELECT_ARR.push(SELECT[expandArr[i]]);
    }
  } else {
    for (let key in SELECT) {
      if (SELECT.hasOwnProperty(key)) {
        SELECT_ARR.push(SELECT[key]);
      }
    }
  }

  expandCond = SELECT_ARR.join(", ");

  const query = `
    SELECT 
      ${expandCond}
    FROM 
        keppel.users u
        JOIN keppel.user_access ua ON u.user_id = ua.user_id
        JOIN keppel.feedback f  on ua.allocatedplantids LIKE concat(concat('%',f.plant_id::text), '%')
        LEFT JOIN (
            SELECT 
                t3.feedback_id
            FROM  
                keppel.feedback AS t3
            GROUP BY t3.feedback_id) tmp1 ON tmp1.feedback_id = f.feedback_id
        LEFT JOIN keppel.users assignU ON assignU.user_id = f.assigned_user_id
        LEFT JOIN keppel.users createdU ON createdU.user_id = f.created_user_id
        LEFT JOIN keppel.plant_master pm ON pm.plant_id = f.plant_id
        LEFT JOIN keppeL.plant_location pl ON pl.loc_id = f.plant_loc_id
        JOIN keppel.status_fm st ON st.status_id = f.status_id	
    `;

  return query;
}

const getPendingFeedbackQuery = (expand, search) => {
  return (
    getAllFeedBackQuery(expand, search) +
    `
      WHERE 
          ua.user_id = $1 AND 
          (f.status_id = 1)
      ORDER BY f.feedback_id DESC
      `
  );
}

const getAssignedFeedbackQuery = (expand, search) => {
  return (
    getAllFeedBackQuery(expand, search) +
    `
      WHERE
          ua.user_id = $1 AND
          (f.status_id is null or f.status_id = 2 or f.status_id = 3) AND
          (CASE
            WHEN (SELECT ua.role_id
                FROM
                    keppel.user_access ua
                WHERE
                    ua.user_id = $1) = 4
            THEN assignU.user_id = $1
            ELSE True
            END)
      ORDER BY f.feedback_id DESC
      `
  );
}

const getCompletedFeedbackQuery = (expand, search) => {
  return (
    getAllFeedBackQuery(expand, search) +
    `
      WHERE
          ua.user_id = $1 AND
          (f.status_id = 4) AND
          (CASE
            WHEN (SELECT ua.role_id
                FROM
                    keppel.user_access ua
                WHERE
                    ua.user_id = $1) = 4
            THEN assignU.user_id = $1
            ELSE True
            END)
      ORDER BY f.feedback_id desc
      `
  );
}

const fetchPendingFeedback = async (req, res, next) => {
  const page = req.query.page || 1;
  const expand = req.query.expand || null;
  const search = req.query.search || null;
  const offsetItems = (+page - 1) * ITEMS_PER_PAGE;

  const totalRows = await global.db.query(getPendingFeedbackQuery(expand, search), [
    req.user.id,
  ]);
  const totalPages = Math.ceil(+totalRows.rowCount / ITEMS_PER_PAGE);

  const query =
    getPendingFeedbackQuery(expand, search) +
    ` LIMIT ${ITEMS_PER_PAGE} OFFSET ${offsetItems}`;

    console.log(query)

  try {
    const result = await global.db.query(query, [req.user.id]);
    //if (result.rows.length == 0)
      //return res.status(204).json({ msg: "No Feedback" });

    return res.status(200).json({ rows: result.rows, total: totalPages });
  } catch (error) {
    return res.status(500).json({ msg: error });
  }
};

const fetchAssignedFeedbackQuery =
  fetchAllFeedbackQuery +
  `
WHERE 
    ua.user_id = $1 AND 
    (f.status_id is null or f.status_id = 2 or f.status_id = 3) AND
    (CASE
      WHEN (SELECT ua.role_id
          FROM
              keppel.user_access ua
          WHERE
              ua.user_id = $1) = 4
      THEN assignU.user_id = $1
      ELSE True
      END) 
ORDER BY f.feedback_id DESC
`;

const fetchAssignedFeedback = async (req, res, next) => {
  const page = req.query.page || 1;
  const expand = req.query.expand || null;
  const search = req.query.search || null;
  const offsetItems = (+page - 1) * ITEMS_PER_PAGE;

  const totalRows = await global.db.query(getAssignedFeedbackQuery(expand, search), [
    req.user.id,
  ]);
  const totalPages = Math.ceil(+totalRows.rowCount / ITEMS_PER_PAGE);

  const query =
    getAssignedFeedbackQuery(expand, search) +
    ` LIMIT ${ITEMS_PER_PAGE} OFFSET ${offsetItems}`;

  try {
    const result = await global.db.query(query, [req.user.id]);
    if (result.rows.length == 0)
      return res.status(204).json({ msg: "No Feedback" });
    // console.log(result.rows);
    // console.log(totalPages);
    return res.status(200).json({ rows: result.rows, total: totalPages });
  } catch (error) {
    return res.status(500).json({ msg: error });
  }
};

const fetchCompletedFeedbackQuery =
  fetchAllFeedbackQuery +
  `				
WHERE 
    ua.user_id = $1 AND 
    (f.status_id = 4) AND
    (CASE
      WHEN (SELECT ua.role_id
          FROM
              keppel.user_access ua
          WHERE
              ua.user_id = $1) = 4
      THEN assignU.user_id = $1
      ELSE True
      END)
ORDER BY f.feedback_id desc
`;

const fetchCompletedFeedback = async (req, res, next) => {
  const page = req.query.page || 1;
  const expand = req.query.expand || null;
  const search = req.query.search || null;
  const offsetItems = (+page - 1) * ITEMS_PER_PAGE;

  const totalRows = await global.db.query(getCompletedFeedbackQuery(expand, search), [
    req.user.id,
  ]);
  const totalPages = Math.ceil(+totalRows.rowCount / ITEMS_PER_PAGE);

  const query =
    getCompletedFeedbackQuery(expand, search) +
    ` LIMIT ${ITEMS_PER_PAGE} OFFSET ${offsetItems}`;

  try {
    const result = await global.db.query(query, [req.user.id]);
    if (result.rows.length == 0)
      return res.status(204).json({ msg: "No Feedback" });

    return res.status(200).json({ rows: result.rows, total: totalPages });
  } catch (error) {
    return res.status(500).json({ msg: error });
  }
};

const fetchFilteredFeedback = async (req, res, next) => {
  let status = req.params.status;
  let plant = req.params.plant;
  let page = req.params?.page;
  let dateCond = "";
  let statusCond = "";
  let plantCond = "";
  let userRoleCond = "";
  let pageCond = "";

  if (page) {
    const offsetItems = (page - 1) * ITEMS_PER_PAGE;
    pageCond = `OFFSET ${offsetItems} LIMIT ${ITEMS_PER_PAGE}`;
  }

  if (![1, 2, 3].includes(req.user.role_id)) {
    userRoleCond = `AND (ua.user_id = ${req.user.id} OR f.assigned_user_id = ${req.user.id})`;
  }

  if (plant && plant != 0) {
    plantCond = `AND f.plant_id = '${plant}'`;
  }

  if (status) {
    if (status.includes(",")) {
      statusCond = `AND f.status_id IN (${status})`;
    } else {
      statusCond = `AND f.status_id = '${status}'`;
    }
  }

  const sql =
    fetchAllFeedbackQuery +
    `
    WHERE 1 = 1
        AND ua.user_id = ${req.user.id} 
        ${plantCond}
        ${statusCond}
        ${dateCond}
    ORDER BY f.feedback_id DESC
    `;

  const countSql = `SELECT COUNT(*) AS total FROM (${sql}) AS t1`;

  const totalRows = await global.db.query(countSql);
  const totalPages = Math.ceil(+totalRows.rows[0].total / ITEMS_PER_PAGE);

  global.db.query(sql + pageCond, (err, result) => {
    if (err) return res.status(500).json({ msg: err });
    if (result.rows.length == 0)
      return res.status(204).json({ msg: "No feedback" });

    return res.status(200).json({ rows: result.rows, total: totalPages });
  });
};

const assignFeedback = async (req, res, next) => {
  const today = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");


  const sql = `
        UPDATE
            keppel.feedback
        SET 
            status_id = 2,
            activity_log = activity_log || 
            jsonb_build_object(
              'date', '${today}',
              'name', '${req.user.name}',
              'activity', 'Assigned Feedback Case ID-${req.params.id} to ${req.body.assigned_user_name}',
              'activity_type', 'ASSIGNED'
            ),
            assigned_user_id = $1
        WHERE 
            feedback_id = $2
    `;

    console.log(sql);

  try {
    // console.log(req.params);
    // console.log(req.body);
    const data = await global.db.query(sql, [
      req.body.assigned_user_id.value,
      req.params.id,
    ]);
    // console.log(fetchEmailDetailsForSpecificFeedback(req.body.id));

    const {
      assigned_user_email,
      creator_email,
      plant_name,
      status,
      name,
      description,
      created_date,
      completed_date,
    } = await fetchEmailDetailsForSpecificFeedback(req.params.id);

    const mail = new AssignFeedbackMail(
      [assigned_user_email, req.user.email],
      {
        plant_name: plant_name,
        name: name,
        description: description,
        id: req.body.id,
        created_date: today,
      }
      // ["wenjunjie14@gmail.com"]
    );

    await mail.send();

    // console.log("submit");
    return res.status(200).json("Feedback successfully assigned");
  } catch (err) {
    // console.log(err);
    return res.status(500).json("Failure to assign feedback");
  }
};

const completeFeedback = async (req, res, next) => {
  const id = req.params.id;
  const today = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
  const sql = `UPDATE keppel.feedback
                SET 
                  status_id = 4,
                  remarks = $1,
                  completed_date = $2,
                  completed_img = $3,
                  activity_log = activity_log ||
                    jsonb_build_object(
                      'date', '${today}',
                      'name', '${req.user.name}',
                      'activity', 'Completed Feedback Case ID-${req.params.id}',
                      'activity_type', 'WORK DONE'
                    )
                
                WHERE feedback_id = $4`;

  
  // console.log(req.body);
  try {
    await global.db.query(sql, [
      req.body.remarks,
      today,
      req.body.completed_img,
      id,
    ]);
    const {
      assigned_user_email,
      creator_email,
      plant_name,
      status,
      name,
      description,
      created_date,
      completed_date,
      remarks,
    } = await fetchEmailDetailsForSpecificFeedback(req.params.id);

    const mail = new CompletedFeedbackMail(
      [assigned_user_email, creator_email, req.body.contact.email],
      {
        plant_name: plant_name,
        name: name,
        remarks: remarks,
        id: req.body.id,
        created_date: today,
        completed_date: today,
      }
    );

    await mail.send();

    return res.status(200).json("Feedback successfully completed");
  } catch (err) {
    console.log(err);
    return res.status(500).json("Failure to complete Feedback");
  }
};

const getSingleFeedback = async (req, res, next) => {
  // console.log(req.params.feedback_id);
  const sql = fetchAllFeedbackQuery + `WHERE f.feedback_id = ${req.params.id}`;
  global.db.query(sql, (err, result) => {
    if (err) {
      return res.status(500).send("Error occured in the server");
    }
    if (result.rows.length > 0) {
      return res.status(200).send(result.rows[0]);
    } else {
      return res.status(404).send("No Feedback found");
    }
  });
};

const createFeedback = async (req, res, next) => {
  const feedback = req.body;
  console.log(req.body);
  const sql = `INSERT INTO keppel.feedback 
              (name,
                description,
                plant_loc_id,
                imageurl,
                plant_id,
                contact,
                created_user_id,
                status_id,
                created_date,
                completed_img,
                activity_log)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`;

  const today = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
  const activity_log = [
    {
      date: today,
      name: req.user ? req.user.name : "Guest",
      activity: `Created Feedback on ${feedback.plantName} ${feedback.location}` ,
      activity_type: "PENDING",
    },
  ];
  // Assign as Guest
  const userID = req.user ? req.user.id : 55;
  // Update guest inputted email
  if (!req.user) {
    feedback.contact = { ...feedback.contact, email: feedback.email };
  }
  try {
    await global.db.query(sql, [
      feedback.name,
      feedback.comments,
      feedback.taggedLocID,
      feedback.image,
      feedback.plantID,
      JSON.stringify(feedback.contact),
      userID,
      1,
      today,
      feedback.completed_img,
      JSON.stringify(activity_log),
    ]);

    const mail = new CreateFeedbackMail([feedback.contact.email], {
      name: feedback.name,
      description: feedback.comments,
      created_date: today,
    });

    await mail.send();
  } catch (e) {
    console.log(e);
    return res.status(500).send("Failure to create feedback");
  }
  return res.status(200).send("New feedback created successfully");
};

const fetchEmailDetailsForSpecificFeedback = async (feedback_id) => {
  const sql = `       
  SELECT 
       u1.user_email as assigned_user_email,
       u3.user_email as creator_email,
       pm.plant_name,
       s.status,
       f.name as name,
       f.description,
       f.created_date,
       f.completed_date,
       f.remarks,
       f.completed_img
       
   FROM 
       keppel.feedback f
           JOIN keppel.users u1 ON f.assigned_user_id = u1.user_id
           JOIN keppel.users u3 ON f.created_user_id = u3.user_id
           JOIN keppel.plant_master pm ON f.plant_id = pm.plant_id
           JOIN keppel.status_cm s ON f.status_id = s.status_id
   WHERE
       f.feedback_id = $1
`;
  const data = await global.db.query(sql, [feedback_id]);

  return data.rows[0];
};

module.exports = {
  fetchPendingFeedback,
  fetchAssignedFeedback,
  fetchCompletedFeedback,
  fetchFilteredFeedback,
  createFeedback,
  assignFeedback,
  completeFeedback,
  getSingleFeedback,
};
