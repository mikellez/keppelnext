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
    f.feedback_id, 
    f.plant_loc, 
    f.plant_id, 
    f.status_id,
    f.activity_log,
    concat( concat(createdU.first_name ,' '), createdU.last_name ) AS createdByUser,
    concat( concat(assignU.first_name ,' '), assignU.last_name ) AS assigneduser,
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
    JOIN keppel.status_cm st ON st.status_id = f.status_id	
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

  const totalRows = await global.db.query(fetchForReviewFeedbackQuery, [
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
    fetchAssignedChecklistsQuery +
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

const fetchForReviewFeedbackQuery =
  fetchAllFeedbackQuery +
  `				
WHERE 
    ua.user_id = $1 AND 
    (f.status_id = 4 OR f.status_id = 6)
ORDER BY f.feedback_id desc
`;

const fetchForReviewFeedback = async (req, res, next) => {
  const page = req.query.page || 1;
  const offsetItems = (+page - 1) * ITEMS_PER_PAGE;

  const totalRows = await global.db.query(fetchForReviewFeedbackQuery, [
    req.user.id,
  ]);
  const totalPages = Math.ceil(+totalRows.rowCount / ITEMS_PER_PAGE);

  const query =
    fetchForReviewFeedbackQuery +
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

module.exports = {
  fetchPendingFeedback,
  fetchAssignedFeedback,
  fetchForReviewFeedback,
};
