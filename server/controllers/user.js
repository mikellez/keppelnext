const db = require("../../db");
const bcrypt = require('bcryptjs');
const { generateCSV } = require("../csvGenerator");

const getUsers = (req, res, next) => {
    db.query(
        `SELECT 
        employee_id,
        CONCAT(first_name, ' ', last_name) AS full_name,
        role_name
    FROM 
        keppel.user_access
    `,
        [],
        (err, result) => {
          if (err) throw err;
          if (result) {
            res.status(200).send(result.rows);
          }});}

const addUser = async (req, res, next) => {
  console.log(req.body);
  var salt = bcrypt.genSaltSync(10);
  let hash = bcrypt.hashSync(req.body.password, salt);  
  q = 
  `DO $$ 
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
     `
    
  plants = ``
  for (const plant of req.body.allocatedPlants) {
    plants += `INSERT INTO keppel.user_plant
    (plant_id, user_id)
    VALUES
    (${plant}, new_user_id);
    `
  }  
  q += plants + ` END $$;`
  console.log(q);
  try {await db.query(q); return res.status(200).json("success");} catch (err) {console.log(err);}
  
}

const getUsersCSV = (req, res, next) => {
    db.query(`SELECT 
    employee_id,
    CONCAT(first_name, ' ', last_name) AS full_name,
    role_name
FROM 
    keppel.user_access
`, [], (err, result) => {
        if (err) return res.status(400).json({ msg: err });
        if (result.rows.length == 0) return res.status(201).json({ msg: "No Users" });
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
    });
};

module.exports ={
    getUsersCSV,
    getUsers,
    addUser
}