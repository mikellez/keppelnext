const db = require("../../db");
const moment = require("moment");

const updateUser = async (req, res, next) => {
    console.log(req.body);
    q = `UPDATE keppel.users SET 
    user_name = '${req.body.username}', user_email = '${req.body.email}'
    WHERE user_id = ${req.body.userId};`

    console.log(q);
    try {await db.query(q); return res.status(200).json("success");} catch (err) {console.log(err);}
};

module.exports = {
    updateUser
  };