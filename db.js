const { Pool, Client } = require("pg");

let conn;

if (!conn) {
  conn = new Pool({
    user: "postgres",
    host: "192.168.20.96",
    //host: 'localhost',
    database: "cmms_dev",
    password: "123Az!!!",
    // password: 'secret',
    port: 5432,
    //port: 3306,
    application_name: "Keppel CMMS (Next.js)",
  });
}

module.exports = conn;
