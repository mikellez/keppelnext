
const db = require("../db");
const passport = require('passport');
const LocalStrategy = require('passport-local');
const bcrypt = require("bcryptjs");
const session = require('express-session')

module.exports = (server) => {
    server.use(session({
        secret: "secret",
        resave: true,
        saveUninitialized: false
    }))
    server.use(passport.initialize());
    server.use(passport.session());

    passport.use(new LocalStrategy((username, password, callback) => {
        console.log(username, password)
        db.query(`SELECT * FROM keppel.users AS u JOIN keppel.user_access AS ua
        ON u.user_id = ua.user_id WHERE LOWER(ua.user_name) = LOWER($1::text)`, [username], (err, result) => {
            if(err)							return callback(err);
            if(result.rows.length < 1)		return callback(null, false, { message: 'Incorrect username or password.' });

            bcrypt.compare(password, result.rows[0].user_pass.toString(), (bErr, bRes) => {
                console.log(bErr);
                console.log(bRes);

                if (bErr)		return callback(null, false, { message: 'Incorrect username or password.', detailedmsg: bErr });
                if(!bRes)		return callback(null, false, { message: 'Incorrect username or password.' });
                                console.log("success"); return callback(null, result.rows[0]);
            })
        })
    }));

    passport.serializeUser((user, cb) => {
        cb(null, user.user_id);
    });

    passport.deserializeUser((id, cb) => {
        db.query(`SELECT 
                user_name,
                user_email,
                employee_id,
                user_id,
                first_name,
                last_name,
                role_id,
                role_name,
                STRING_TO_ARRAY(allocatedplantids, ', ') as allocated_plants
            FROM 
                keppel.user_access 
            WHERE 
                user_id = $1::integer`, [id], (err, result) => {
            if (err) return cb(err);

            const userInfo = {
                employee_id: result.rows[0].employee_id,
                id: result.rows[0].user_id,
                name: result.rows[0].first_name + " " + result.rows[0].last_name,
                role_id: parseInt(result.rows[0].role_id),
                role_name: result.rows[0].role_name,
                allocated_plants: result.rows[0].allocated_plants.map(plant => parseInt(plant)).sort(),
                email: result.rows[0].user_email,
                username: result.rows[0].user_name,
                test: "test"

            };
            // console.log(userInfo)
            cb(null, userInfo);
        })
    })
}