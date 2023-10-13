const db = require("../../db");
const moment = require("moment");

const getLogbook = async (req, res, next) => {
  const ITEMS_PER_PAGE = 10;
  const page = req.query.page || 1;
  const offsetItems = (page - 1) * ITEMS_PER_PAGE;

  try {
    const result = await global.db.query(
      `SELECT concat(u1.first_name, ' ', u1.last_name) AS staff1, 
      concat(u2.first_name, ' ', u2.last_name)  AS staff2, 
      lb.date, lb.label, lb.entry, l1.name, l1.description FROM keppel.logbook lb

      JOIN keppel.users u1 ON lb.staff1 = u1.user_id
      JOIN keppel.users u2 ON lb.staff2 = u2.user_id
      LEFT JOIN keppel.logbook_labels l1 ON lb.label_id = l1.label_id
      
      WHERE lb.plant_id = $1
      
      ORDER BY lb.date DESC
      LIMIT ${ITEMS_PER_PAGE}
      OFFSET ${offsetItems}
  `,
      [req.params.plant_id]
    );

    const totalRows = result.rows.length;
    const totalPages = Math.ceil(totalRows / ITEMS_PER_PAGE);

    res.status(200).send({ rows: result.rows, total: totalPages });
  } catch (e) {
    // console.log(e);
    throw e;
  }
};

const addEntryToLogbook = async (req, res, next) => {
  const { label, entry, staff, plant_id, label_id } = req.body;
  // console.log("hello");
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
    // console.log(err);
    throw err;
  }
  const now = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
  let result;
  try {
    result = await global.db.query(
      `INSERT INTO keppel.logbook (label, entry, date, staff1, staff2, plant_id, label_id)
    VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [label, entry, now, staff.first, staff.second, plant_id, label_id]
    );
  } catch (err) {
    // console.log(err);
    throw err;
  }

  const staff1 = data.rows.find((row) => row.user_id === staff.first).name;
  const staff2 = data.rows.find((row) => row.user_id === staff.second).name;

  res.status(201).send({ ...result.rows[0], staff1, staff2 });
};

// Gets all the logbook labels
const getAllLogbookLabels = async (req, res, next) => {
    try{
      const result = await global.knex("keppel.logbook_labels").select("*");
      if (result.length > 0) {
        return res.status(200).send(result);
      } else {
        return res.status(404).json({ msg: "No labels found" });
      }
    }
    catch(err){
      console.log(err);
      return res.status(500).json({ msg: err });
    }
}

module.exports = {
  getLogbook,
  addEntryToLogbook,
  getAllLogbookLabels,
}
