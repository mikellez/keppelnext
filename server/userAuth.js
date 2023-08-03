
const db = require("../db");
const passport = require('passport');
const LocalStrategy = require('passport-local');
const bcrypt = require("bcryptjs");
const session = require('express-session')
const moment = require('moment');

module.exports = (server) => {
    server.use(session({
        secret: "secret",
        resave: true,
        saveUninitialized: false
    }))
    server.use(passport.initialize());
    server.use(passport.session());

    passport.use(new LocalStrategy((username, password, callback) => {
        global.db.query(`SELECT * FROM keppel.users AS u WHERE LOWER(u.user_name) = LOWER($1::text)`, [username], (err, result) => {
            if(err)							return callback(err);
            if(result.rows.length < 1)		return callback(null, false, { message: 'Incorrect username or password.' });

            bcrypt.compare(password, result.rows[0].user_pass.toString(), (bErr, bRes) => {
                if (bErr)		return callback(null, false, { message: 'Incorrect username or password.', detailedmsg: bErr });
                if(!bRes)		return callback(null, false, { message: 'Incorrect username or password.' });
                                let newdate = moment(new Date()).format("L HH:mm A");
                                var sql = `INSERT INTO keppel.loginevents (userid,datetime,activity) VALUES (${result.rows[0].user_id},'${newdate}','logged in')`;
                                global.db.query(sql ,function(err, result) {
                                    if(err){
                                       console.log(err);
                                      }
                                      return callback(null, result.rows[0]);
                                    
                                  });

                                return callback(null, result.rows[0]);
                                
            })
        })
    }));

    passport.serializeUser((user, cb) => {
        cb(null, user.user_id);
    });

    passport.deserializeUser((id, cb) => {
        console.log(global.db);
        global.db.query(`SELECT 
                user_name,
                user_email,
                user_id,
                first_name,
                last_name
            FROM 
                keppel.users
            WHERE 
                user_id = $1::integer`, [id], (err, result) => {
            if (err) return cb(err);
            
            const data = result.rows[0];
            console.log("ID: " + id)
            console.log("Result: " + data)
            const userInfo = {
                employee_id: data.employee_id,
                id: data.user_id,
                name: data.first_name + " " + data.last_name,
                role_id: parseInt(data.role_id),
                role_name: data.role_name,
                allocated_plants: data.allocated_plants ? data.allocated_plants.map(plant => parseInt(plant)).sort() : [],
                email: data.user_email,
                username: data.user_name,
                first_name: data.first_name,
                last_name: data.last_name

            };
            // console.log(userInfo)
            cb(null, userInfo);
        })
    })
}