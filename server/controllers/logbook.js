const db = require("../../db");
const moment = require("moment");

exports.getLogbook = async (req, res, next) => {
  const ITEMS_PER_PAGE = 10;
  const page = req.query.page || 1;
  const offsetItems = (page - 1) * ITEMS_PER_PAGE;

  try {
    const result =
      await global.db.query(`SELECT concat(u1.first_name, ' ', u1.last_name) AS staff1, 
      concat(u2.first_name, ' ', u2.last_name)  AS staff2, 
      lb.date, lb.label, lb.entry FROM keppel.logbook lb 
      JOIN keppel.users u1
      ON lb.staff1 = u1.user_id
      JOIN keppel.users u2 
      ON lb.staff2 = u2.user_id
      WHERE lb.plant_id = $1
      ORDER BY lb.date DESC
      LIMIT ${ITEMS_PER_PAGE}
      OFFSET ${offsetItems}
  `, [req.params.plant_id]);
    
    const totalRows = result.rows.length;
    const totalPages = Math.ceil(totalRows / ITEMS_PER_PAGE);
    
    res.status(200).send({ rows: result.rows, total: totalPages });
  } catch (e) {
    console.log(e);
    throw(e);
  }
};

exports.addEntryToLogbook = async (req, res, next) => {
  const { label, entry, staff, plant_id } = req.body;
  console.log("hello");
  let data;
  try {

    data = await global.db.query(
      `SELECT user_id, concat(first_name, ' ', last_name) AS name FROM keppel.users`
    );
    const users = data.rows.map((row) => row.user_id);
    if (!users.includes(staff.first) || !users.includes(staff.second)) {
      res.status(422).send("Invalid duty staff members");
    }
  } catch (err) {
    console.log(err);
    throw(err);
  }
  const now = moment(new Date()).format(
    "YYYY-MM-DD HH:mm:ss"
  )
  let result;
  try {

    result =
    await global.db.query(`INSERT INTO keppel.logbook (label, entry, date, staff1, staff2, plant_id)
    VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`, [label, entry, now, staff.first, staff.second, plant_id]);
  } catch (err) {
    console.log(err);
    throw(err);
  }

  const staff1 = data.rows.find((row) => row.user_id === staff.first).name;
  const staff2 = data.rows.find((row) => row.user_id === staff.second).name;

  res.status(201).send({ ...result.rows[0], staff1, staff2 });
};
