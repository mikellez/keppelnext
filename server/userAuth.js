
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
        global.db.query(`
            WITH RECURSIVE EmployeeHierarchy AS (
                SELECT 
                            ua.user_name,
                            ua.user_email,
                            ua.employee_id,
                            ua.user_id,
                            ua.first_name,
                            ua.last_name,
                            ua.role_id,
                            ua.role_name,
                            STRING_TO_ARRAY(ua.allocatedplantids, ', ') as allocated_plants,
                            aic.parent,
                            aic.child
                        FROM 
                            keppel.user_access ua
                        JOIN 
                            keppel.auth_assignment aa on aa.user_id = ua.user_id
                        JOIN 
                            keppel.auth_item_child aic on aic.parent = aa.item_name
                        WHERE
                            ua.user_id = $1 
                
                UNION ALL
                
                    SELECT 
                    ''::character varying(100) as user_name,
                    ''::character varying(100) as user_email,
                    ''::character varying(100) as employee_id,
                    0 as user_id,
                    ''::character varying(100) as first_name,
                    ''::character varying(100) as last_name,
                    0 as role_id,
                    ''::character varying(225) as role_name,
                    STRING_TO_ARRAY('[]', ', ') as allocated_plants,
                    aic.parent,
                    aic.child
                FROM
                    keppel.auth_item_child aic
                JOIN
                    EmployeeHierarchy eh on aic.parent = eh.child 
                        
            )
            SELECT * FROM EmployeeHierarchy; 
        `, [id], (err, result) => {
            if (err) return cb(err);
            
            const data = result.rows[0];
            
            // Need to add the parent itself to the permissions array
            let permissionsArray = result.rows.map(row => row.child)
            permissionsArray.unshift(data.parent);

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
                last_name: data.last_name,
                permissions: permissionsArray
            };

            cb(null, userInfo);
        })
    })
}