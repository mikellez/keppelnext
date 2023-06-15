const dbJSON = require('./db.config.json')
const { Pool } = require('pg');

const guestPaths = [
    "/api/request/types",
    "/api/fault/types",
    "/api/request/plant/",
    "/api/request/asset/",
    "/api/feedback/",
    "/api/workflow"
];

const checkIfGuestPath = (path) => {
    for (const p of guestPaths) {
        if (path == p || path.includes(p)) return true;
    }
    
    return false;
};

const fetchDBNames = async (req, res, next) => {
    return res.status(200).json(Object.keys(dbJSON))
};

const dbConnection = (req, res, next) => {
    if (req.path == '/api/login' || checkIfGuestPath(req.path)) {
        const { database } = req.body;
        if (!database) connectDB("cmms_dev")
        else connectDB(database);
    } 

    next();
};

const connectDB = (dbName) => {
    const dbConfig = dbJSON[dbName];
    const pool = new Pool(dbConfig);
    global.db = pool;
};

const dellocateGlobalDB = async () => {
    if (global.db) {
        global.db.end();
        delete global.db;
    }
};

module.exports = {
    fetchDBNames,
    dbConnection,
    dellocateGlobalDB,
};
