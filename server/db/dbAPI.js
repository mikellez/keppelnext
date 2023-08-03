const dbJSON = require("./db.config.json");
const knexJSON = require("./db.knexConfig.json");
const { Pool } = require("pg");

const guestPaths = [
  "/api/request/types",
  "/api/fault/types",
  "/api/request/plant/",
  "/api/request/asset/",
  "/api/feedback/",
  "/api/user",
  "/api/plantLocation",
  "/api/workflow",
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
  if (req.path === "/api/login" || checkIfGuestPath(req.path)) {
    const { database } = req.body;
    if (!database) await connectDB("cmms_dev");
    else await connectDB(database);
  }
  console.log("hello knexxx", global.knex)

  next();
};

const connectDB = async (dbName) => {
  console.log("Connecting to databases")
  const dbConfig = dbJSON[dbName];
  const pool = new Pool(dbConfig);
  global.db = pool;
  const knexInstance = await require('knex')(knexJSON["cmms_dev"]);
  global.knex = knexInstance;
  console.log("Finished")
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
  connectDB,
  dellocateGlobalDB,
};
