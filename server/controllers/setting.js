const db = require("../../db");
const moment = require("moment");
const bcrypt = require("bcryptjs");



const updateUser = async (req, res, next) => {
    console.log(req.body);
    q = `UPDATE keppel.users SET 
    user_name = '${req.body.username}', user_email = '${req.body.email}'
    WHERE user_id = ${req.body.userId};`

    console.log(q);
    try {await db.query(q); return res.status(200).json("success");} catch (err) {console.log(err);}
};

const updatePassword = async (req, res, next) => {
    console.log(req.body);
    const password = await db.query(`SELECT user_pass FROM keppel.users WHERE user_id = ${req.body.id};`);
    let password2 = password.rows[0].user_pass.toString();
    console.log(password2)
    console.log(req.body.current_password)
    await bcrypt.compare(req.body.current_password, password2, async (err, result) => {
        // console.log(err);
        console.log(result);
        if (result == true) {
            var salt = bcrypt.genSaltSync(10);
            let hash = bcrypt.hashSync(req.body.new_password, salt);  
            q = `UPDATE keppel.users SET user_pass = '${hash}' WHERE user_id = ${req.body.id};`
            console.log(q);
            try {await db.query(q); return res.status(200).json("success");} catch (err) {console.log(err);}
        } else {
            return res.status(400).json("error");
        }
    });
}

module.exports = {
    updateUser,
    updatePassword
  }