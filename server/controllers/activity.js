const db = require("../../db");
const { generateCSV } = require("../csvGenerator");

const getEventtHistory = async (req, res, next) => {
    db.query(`SELECT E.id, E.type, E.description, E.event_time, E.user_id, U.user_name, U.user_email, U.first_name, U.last_name 
            FROM keppel.events E INNER JOIN keppel.users U
            ON U.user_id = E.user_id
            ORDER BY id ASC
        `, (err, result) => {
        if (err) return res.status(400).json({ msg: err });
        if (result.rows.length == 0) return res.status(201).json({ msg: "No assets added" });
        return res.status(200).json(result.rows);
    });
};

const createActivityCSV = async (req, res, next) => {
    db.query(`SELECT keppel.events.user_id, description, event_time 
        FROM keppel.events, keppel.users 
        WHERE keppel.events.user_id = keppel.users.user_id
        `, (err, result) => {
        if (err) return res.status(400).json({ msg: err });
        if (result.rows.length == 0) return res.status(201).json({ msg: "No assets added" });
        
        generateCSV(result.rows).then(buffer => {
            res.set({
                'Content-Type': 'text/csv',
            })
            return res.status(200).send(buffer);
        })
        .catch(err => {
            return res.status(500).send("Error in generating csv file");
        })      
  });
}



module.exports = {
    getEventtHistory,
    createActivityCSV,
};
