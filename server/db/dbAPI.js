const dbJSON = require('./db.config.json')
const { Pool } = require('pg');

const fetchDBNames = async (req, res, next) => {
    return res.status(200).json(Object.keys(dbJSON))
};

const dbConnection = (req, res, next) => {
    if (req.path == '/api/login') {
        const { database } = req.body;
        connectDB(database);
    } 

    // if (global.db) {
    //     connectDB(global.db);
    // }

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
