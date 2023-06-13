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
    f.plant_loc_id,
    f.plant_id, 
    f.description,
    f.contact,
    f.status_id,
    f.activity_log,
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
  let date = req.params.date;
  let datetype = req.params.datetype;
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

  if (date !== "all") {
    switch (datetype) {
      case "week":
        dateCond = `
                    AND DATE_PART('week', f.CREATED_DATE::DATE) = DATE_PART('week', '${date}'::DATE) 
                    AND DATE_PART('year', f.CREATED_DATE::DATE) = DATE_PART('year', '${date}'::DATE)`;

        break;

      case "month":
        dateCond = `
                    AND DATE_PART('month', f.CREATED_DATE::DATE) = DATE_PART('month', '${date}'::DATE) 
                    AND DATE_PART('year', f.CREATED_DATE::DATE) = DATE_PART('year', '${date}'::DATE)`;

        break;

      case "year":
        dateCond = `AND DATE_PART('year', f.CREATED_DATE::DATE) = DATE_PART('year', '${date}'::DATE)`;

        break;

      case "quarter":
        dateCond = `
                    AND DATE_PART('quarter', f.CREATED_DATE::DATE) = DATE_PART('quarter', '${date}'::DATE) 
                    AND DATE_PART('year', f.CREATED_DATE::DATE) = DATE_PART('year', '${date}'::DATE)`;

        break;
      default:
        dateCond = `AND CL.CREATED_DATE::DATE = '${date}'::DATE`;
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

module.exports = {
  fetchPendingFeedback,
  fetchAssignedFeedback,
  fetchCompletedFeedback,
  fetchFilteredFeedback,
};
