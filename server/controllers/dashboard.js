const { checklist } = require(".");
const db = require("../../db");

// Dashboard path
function homepage(role_id) {
    switch (role_id) {
        case 1: 
        case 2:
            return "/Dashboard/Manager";
        case 3: 
            return "/Dashboard/Engineer";
        case 4:
            return "/Dashboard/Specialist";
    }
} 

const getDashboardPath = async (req, res, next) => {
    res.status(200).json({homepage: homepage(req.user.role_id)});
};

const getChecklist = async (req, res, next, plant = 0) => {

    const sql = req.params.plant != 0 ? `SELECT S.STATUS, CM.STATUS_ID, COUNT(CM.STATUS_ID) FROM KEPPEL.CHECKLIST_MASTER CM
    JOIN KEPPEL.STATUS_CM S ON S.STATUS_ID = CM.STATUS_ID
    WHERE CM.PLANT_ID = ${req.params.plant}
    GROUP BY(CM.STATUS_ID, S.STATUS)` : 
    `SELECT S.STATUS, CM.STATUS_ID, COUNT(CM.STATUS_ID) FROM KEPPEL.CHECKLIST_MASTER CM
    JOIN KEPPEL.STATUS_CM S ON S.STATUS_ID = CM.STATUS_ID
    GROUP BY(CM.STATUS_ID, S.STATUS)`;

    db.query(sql, (err, result) => {
        if (err) return res.status(500).send("Error in fetching request for dashboard");
        return res.status(200).send(result.rows);
    });
};

const getRequest = async (req, res, next, plant = 0) => {
    const sql = req.params.plant != 0 ? `SELECT S.STATUS, R.STATUS_ID, COUNT(R.STATUS_ID) FROM KEPPEL.REQUEST R
    JOIN KEPPEL.STATUS_CM S ON S.STATUS_ID = R.STATUS_ID
    WHERE R.PLANT_ID = ${req.params.plant}
    GROUP BY(R.STATUS_ID, S.STATUS)` : 
    `SELECT S.STATUS, R.STATUS_ID, COUNT(R.STATUS_ID) FROM KEPPEL.REQUEST R
    JOIN KEPPEL.STATUS_CM S ON S.STATUS_ID = R.STATUS_ID
    GROUP BY(R.STATUS_ID, S.STATUS)`;

    db.query(sql, (err, result) => {
        if (err) return res.status(500).send("Error in fetching request for dashboard");
        return res.status(200).send(result.rows);
    });
};

const getDashboardData = async (req, res, next) => {
    switch (req.params.type) {
        case "request":
            return await getRequest(req, res, next, req.params.type);
        case "checklist":
            return await getChecklist(req, res, next, req.params.type);
    };
};

module.exports = { 
    getDashboardPath, 
    homepage,
    getDashboardData
};