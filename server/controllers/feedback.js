const db = require("../../db");
const { generateCSV } = require("../csvGenerator");
const moment = require("moment");

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
  st.status
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

const fetchPendingFeedback = async (req, res, next) => {
  const page = req.query.page || 1;
  const offsetItems = (+page - 1) * ITEMS_PER_PAGE;

  const totalRows = await global.db.query(fetchPendingFeedbackQuery, [
    req.user.id,
  ]);
  const totalPages = Math.ceil(+totalRows.rowCount / ITEMS_PER_PAGE);

  const query =
    fetchPendingFeedbackQuery +
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

const fetchAssignedFeedbackQuery =
  fetchAllFeedbackQuery +
  `
WHERE 
    ua.user_id = $1 AND 
    (f.status_id is null or f.status_id = 2 or f.status_id = 3)
ORDER BY f.feedback_id DESC
`;

const fetchAssignedFeedback = async (req, res, next) => {
  const page = req.query.page || 1;
  const offsetItems = (+page - 1) * ITEMS_PER_PAGE;

  const totalRows = await global.db.query(fetchAssignedFeedbackQuery, [
    req.user.id,
  ]);
  const totalPages = Math.ceil(+totalRows.rowCount / ITEMS_PER_PAGE);

  const query =
    fetchAssignedFeedbackQuery +
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
    (f.status_id = 4)
ORDER BY f.feedback_id desc
`;

const fetchCompletedFeedback = async (req, res, next) => {
  const page = req.query.page || 1;
  const offsetItems = (+page - 1) * ITEMS_PER_PAGE;

  const totalRows = await global.db.query(fetchCompletedFeedbackQuery, [
    req.user.id,
  ]);
  const totalPages = Math.ceil(+totalRows.rowCount / ITEMS_PER_PAGE);

  const query =
    fetchCompletedFeedbackQuery +
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

  const activity_log = {
    date: today,
    name: req.user.name,
    activity: "Assigned",
    activity_type: "Updated Feedback",
  };

  const sql = `
        UPDATE
            keppel.feedback
        SET 
            status_id = 2,
            activity_log = activity_log || $1,
            assigned_user_id = $2
        WHERE 
            feedback_id = $3
    `;

  try {
    // console.log(req.params);
    // console.log(req.body);
    await global.db.query(sql, [
      JSON.stringify(activity_log),
      req.body.assigned_user_id.value,
      req.params.id,
    ]);
    // console.log("submit");
    return res.status(200).json("Feedback successfully assigned");
  } catch (err) {
    // console.log(err);
    return res.status(500).json("Failure to assign feedback");
  }
};

const completeFeedback = async (req, res, next) => {
  const id = req.params.id;
  const sql = `UPDATE keppel.feedback
                SET 
                  status_id = 4,
                  remarks = $1,
                  completed_date = $2
                
                WHERE feedback_id = $3`;

  const today = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");

  console.log(req.body);
  try {
    await global.db.query(sql, [req.body.remarks, today, id]);
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
  const sql = `INSERT INTO keppel.feedback 
              (name,
                description,
                plant_loc_id,
                imageurl,
                plant_id,
                contact,
                created_user_id,
                status_id,
                created_date)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`;

  const today = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
  const activity_log = [
    {
      date: today,
      name: req.user ? req.user.name : "Guest",
      activity: "PENDING",
      activity_type: "Created Feedback",
    },
  ];
  const userID = req.user ? req.user.id : 55;
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
    ]);
  } catch (e) {
    console.log(e);
    return res.status(500).send("Failure to create feedback");
  }
  return res.status(200).send("New feedback created successfully");
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
