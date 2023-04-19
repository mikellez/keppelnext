const db = require("../../db");


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
          }
        }
      );
    }

module.exports ={
    getUsers
}