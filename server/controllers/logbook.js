const db = require("../../db");
const moment = require("moment");

exports.getLogbook = async (req, res, next) => {
  const result =
    await db.query(`SELECT concat(u1.first_name, ' ', u1.last_name) AS staff1, 
    concat(u2.first_name, ' ', u2.last_name)  AS staff2, 
    lb.date, lb.label, lb.entry FROM keppel.logbook lb 
    JOIN keppel.users u1
    ON lb.staff1 = u1.user_id
    JOIN keppel.users u2 
    ON lb.staff2 = u2.user_id
    ORDER BY lb.date DESC
  `);
  res.status(200).send(result.rows);
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
