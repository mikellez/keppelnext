const db = require("../../db");
const moment = require("moment");

exports.getLogbook = async (req, res, next) => {
  const ITEMS_PER_PAGE = 10;
  const page = req.query.page || 1;
  const offsetItems = (page - 1) * ITEMS_PER_PAGE;

  const result =
    await db.query(`SELECT concat(u1.first_name, ' ', u1.last_name) AS staff1, 
    concat(u2.first_name, ' ', u2.last_name)  AS staff2, 
    lb.date, lb.label, lb.entry FROM keppel.logbook lb 
    JOIN keppel.users u1
    ON lb.staff1 = u1.user_id
    JOIN keppel.users u2 
    ON lb.staff2 = u2.user_id
    ORDER BY lb.date DESC
    LIMIT ${ITEMS_PER_PAGE}
    OFFSET ${offsetItems}
  `);

  const totalRows = await db.query(`SELECT COUNT(*) FROM keppel.logbook`);
  const totalPages = Math.ceil(+totalRows.rows[0].count / ITEMS_PER_PAGE);

  res.status(200).send({ rows: result.rows, total: totalPages });
};

exports.addEntryToLogbook = async (req, res, next) => {
  const { label, entry, staff } = req.body;

  const data = await db.query(
    `SELECT user_id, concat(first_name, ' ', last_name) AS name FROM keppel.users`
  );
  const users = data.rows.map((row) => row.user_id);
  if (!users.includes(staff.first) || !users.includes(staff.second)) {
    res.status(422).send("Invalid duty staff members");
  }

  const result =
    await db.query(`INSERT INTO keppel.logbook (label, entry, date, staff1, staff2)
  VALUES ('${label}', '${entry}', '${moment(new Date()).format(
      "YYYY-MM-DD HH:mm:ss"
    )}', '${staff.first}', '${staff.second}') RETURNING *`);

  const staff1 = data.rows.find((row) => row.user_id === staff.first).name;
  const staff2 = data.rows.find((row) => row.user_id === staff.second).name;

  res.status(201).send({ ...result.rows[0], staff1, staff2 });
};
