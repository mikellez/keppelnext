const db = require("../../db");
const bcrypt = require("bcryptjs");
const { generateCSV } = require("../csvGenerator");
const moment = require("moment");

const ITEMS_PER_PAGE = 10;

// const searchCondition = (search) => {
//   `
//     WHERE full_name Li
//   `
// }

const getUsers = async (req, res, next) => {
  const page = req.query.page || 1;
  const search = req.query.search || "";
  const offsetItems = (page - 1) * ITEMS_PER_PAGE;
  let totalPages;
  let q = `SELECT 
    employee_id,
    CONCAT(first_name, ' ', last_name) AS full_name,
    user_id,
    user_name,
    role_name
  FROM 
    keppel.user_access
  WHERE
    CONCAT(first_name, ' ', last_name) ILIKE $1
  `;
  console.log(q);
  // Query to get total number of users
  const Result = await global.db.query(q, ["%" + search + "%"]);
  // Calculate total pages required based on number of user records
  totalPages = Math.ceil(Result.rowCount / ITEMS_PER_PAGE);
  q += ` LIMIT ${ITEMS_PER_PAGE} OFFSET ${offsetItems}`;
  // Query again to get required amount for the particular page
  global.db.query(q,
    ["%" + search + "%"],
    (err, result) => {
      if (err) throw err;
      if (result) {
        res.status(200).json({rows: result.rows, total: totalPages});
      }
    }
  );
};

const addUser = async (req, res, next) => {
  //   console.log(req.body);
  var salt = bcrypt.genSaltSync(10);
  let hash = bcrypt.hashSync(req.body.password, salt);
  const role = {
    1: 'manager',
    2: 'engineer',
    3: 'specialist',
    4: 'admin',
    5: 'cmtEngineer',
    6: 'cmtSpecialist'
  }

  q = `DO $$ 
  DECLARE
     new_user_id INTEGER;
  BEGIN
     WITH num AS (
        SELECT user_id
        FROM keppel.users
        ORDER BY user_id DESC
        LIMIT 1
     )
     SELECT user_id + 1 INTO new_user_id
     FROM num;
     
     INSERT INTO keppel.users 
     (user_id, user_name, user_email, user_pass, 
    first_name, last_name, employee_id)
    VALUES 
     (new_user_id, '${req.body.username}', '${req.body.email}', '${hash}',
     '${req.body.firstName}', '${req.body.lastName}', '${req.body.employeeId}');
    
    INSERT INTO keppel.user_role_privileges
    (role_parent_id, user_id)
    VALUES
    ('${req.body.roleType}', new_user_id);

    Insert INTO keppel.user_role
    (user_id,role_parent_id)
    VALUES
    (new_user_id,'${req.body.roleType}');

    Insert INTO keppel.auth_assignment
    (user_id,item_name)
    VALUES
    (new_user_id,'${role[req.body.roleType]}');
     `;

  plants = ``;
  for (const plant of req.body.allocatedPlants) {
    plants += `INSERT INTO keppel.user_plant
    (plant_id, user_id)
    VALUES
    (${plant}, new_user_id);
    `;
  }
  q += plants + ` END $$;`;
  //   console.log(q);
  try {
    await global.db.query(q);
    return res.status(200).json("success");
  } catch (err) {
    console.log(err);
  }
};

const getUsersCSV = (req, res, next) => {
  global.db.query(
    `SELECT 
    employee_id,
    CONCAT(first_name, ' ', last_name) AS full_name,
    role_name
FROM 
    keppel.user_access
`,
    [],
    (err, result) => {
      if (err) return res.status(400).json({ msg: err });
      if (result.rows.length == 0)
        return res.status(201).json({ msg: "No Users" });
      generateCSV(result.rows)
        .then((buffer) => {
          res.set({
            "Content-Type": "text/csv",
          });
          return res.status(200).send(buffer);
        })
        .catch((error) => {
          res.status(500).send(`Error in generating csv file`);
        });
    }
  );
};

const deleteUser = async (req, res, next) => {
  const { id } = req.params;
  const query = `DELETE FROM keppel.user_role_privileges
    WHERE user_id = ${id};
    
    DELETE FROM keppel.user_plant
    WHERE user_id = ${id};
    
    DELETE FROM keppel.user_role
    WHERE user_id = ${id};
    
    DELETE FROM keppel.users
    WHERE user_id = ${id};`;
  // console.log(query);
  try {
    await global.db.query(query);
    return res.status(200).json("success");
  } catch (err) {
    console.log(err);
  }
};

const logout = async (req, res, next) => {
  const id = req.user.id;
  let newdate = moment(new Date()).format("L HH:mm A");
  var sql = `INSERT INTO keppel.loginevents (userid,datetime,activity) VALUES (${id},'${newdate}','logged out')`;
  try {
    await global.db.query(sql);
    return res.status(200).json("success");
  } catch (err) {
    console.log(err);
  }
};

const getUsersData = async (req, res, next) => {
  const { id } = req.params;
  const query = `SELECT
    first_name,
    last_name,
    employee_id,
    allocated_plants,
    allocatedplantids,
    user_name,
    user_email,
    role_id
    FROM keppel.user_access
    WHERE user_id = ${id};`;
  // console.log(query);
  try {
    const result = await global.db.query(query);
    return res.status(200).json(result.rows[0]);
  } catch (err) {
    console.log(err);
  }
};

const getUsersplantData = async (req, res, next) => {
  const { id } = req.params;
  const query = `SELECT plant_id FROM keppel.request WHERE user_id = ${id}
    UNION ALL
    SELECT plant_id FROM keppel.schedule_checklist WHERE user_id = ${id}
    UNION ALL
    SELECT plant_id FROM keppel.checklist_master WHERE assigned_user_id = ${id} OR signoff_user_id = ${id};
    `;
  // console.log(query);
  try {
    const result = await global.db.query(query);
    return res.status(200).json(result.rows);
  } catch (err) {
    console.log(err);
  }
};

const updateUser = async (req, res, next) => {
  const {
    user_id,
    first_name,
    last_name,
    employee_id,
    addplantids,
    removeplantids,
    password,
    user_name,
    user_email,
  } = req.body;
  // console.log(req.body);
  query = `UPDATE keppel.users SET first_name = '${first_name}', last_name = '${last_name}', employee_id = '${employee_id}', user_name = '${user_name}', user_email = '${user_email}' WHERE user_id = ${user_id};
    `;

  if (password != "" && password != undefined && password != null) {
    var salt = bcrypt.genSaltSync(10);
    let hash = bcrypt.hashSync(password, salt);
    console.log('hash', hash, user_id)
    query += `UPDATE keppel.users SET user_pass = '${hash}' WHERE user_id = ${user_id};`;
  }

  plants = ``;
  for (const plant of addplantids) {
    plants += `INSERT INTO keppel.user_plant
      (plant_id, user_id)
      VALUES
      (${plant}, ${user_id});
      `;
  }
  for (const plant of removeplantids) {
    plants += `DELETE FROM keppel.user_plant
        WHERE plant_id = ${plant} AND user_id = ${user_id};
        `;
  }

  role = ``;
  role += `UPDATE keppel.user_role_privileges
    SET role_parent_id = ${req.body.role_id}
    WHERE user_id = ${user_id};`;

  role += `UPDATE keppel.user_role
    SET role_parent_id = ${req.body.role_id}
    WHERE user_id = ${user_id};`;

  plants += query;
  plants += role;
  // console.log(plants)

  try {
    await global.db.query(plants);
    return res.status(200).json("success");
  } catch (err) {
    console.log(err);
  }
};

const checkEmail = async (req, res, next) => {
  const { id } = req.params;
  const email = await global.db.query(
    `SELECT EXISTS(SELECT 1 FROM keppel.users WHERE user_email = '${id}');`
  );
  // console.log(email.rows[0].exists);
  return res.status(200).json(email.rows[0].exists);
};

const checkUsername = async (req, res, next) => {
  const { id } = req.params;
  const username = await global.db.query(
    `SELECT EXISTS(SELECT 1 FROM keppel.users WHERE user_name = '${id}');`
  );
  // console.log(username.rows[0].exists);
  return res.status(200).json(username.rows[0].exists);
};

module.exports = {
  getUsersCSV,
  getUsers,
  addUser,
  deleteUser,
  logout,
  getUsersData,
  getUsersplantData,
  updateUser,
  checkEmail,
  checkUsername,
};
