const dbJSON = require("./db.config.json");
const knexJSON = require("./db.knexConfig.json");
const { Pool } = require("pg");

let dbPool = null;
let knexInstance = null;

const guestPaths = [
  "/api/request/types",
  "/api/fault/types",
  "/api/request/plant/",
  "/api/request/asset/",
  "/api/feedback/",
  "/api/user",
  "/api/plantLocation",
  "/api/workflow",
  "/api/feedback",
];

const checkIfGuestPath = (path) => {
  for (const p of guestPaths) {
    if (path == p || path.includes(p)) return true;
  }

  return false;
};

const fetchDBNames = async (req, res, next) => {
  return res.status(200).json(Object.keys(dbJSON));
};

const dbConnection = async (req, res, next) => {
  if ((!global.db || !global.knex) && (req.path === "/api/login" || checkIfGuestPath(req.path))) {
    const { database } = req.body;
    if (!database) await connectDB("cmms");
    else {
      //console.log("here");
      await connectDB(database);
    }
  }

  next();
};

const connectDB = async (dbName) => {
  //console.log('her')
   if (!dbPool) {
    const dbConfig = dbJSON[dbName];
    dbPool = new Pool(dbConfig);
  }

  if (!knexInstance) {
    knexInstance = await require('knex')(knexJSON[dbName]);
  }

  // Assign the pool and knex instance to global variables if needed
  global.db = dbPool;
  global.knex = knexInstance;

  //const dbConfig = dbJSON[dbName];
  //console.log(dbConfig);
  //const pool = new Pool(dbConfig);
  //global.db = pool;
  //const knexInstance = await require('knex')(knexJSON[dbName]);
  //console.log(knexInstance);
  //global.knex = knexInstance;
};

const dellocateGlobalDB = async () => {
  if (dbPool) {
    await dbPool.end();
    dbPool = null;
    global.db = null;
  }

  if (knexInstance) {
    await knexInstance.destroy();
    knexInstance = null;
    global.knex = null;
  }
  /*if (global.db || global.knex) {
    global.db.end();
    delete global.db;

    global.knex.destroy();
  }*/
};

module.exports = {
  fetchDBNames,
  dbConnection,
  connectDB,
  dellocateGlobalDB,
};
