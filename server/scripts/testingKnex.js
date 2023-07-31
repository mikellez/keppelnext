const knexConfig = require('../db/knexConfig');
const knex = require('knex')(knexConfig.development); // Replace 'development' with the desired environment

test = async () => {
  const query = knex(knex.raw("keppel.checklist_master"))
  
  query.whereIn(
    "status_id", [1]
  )
  
  return query.select(["checklist_id", "chl_name"]);
}

async function connect() {
    try {
      const results = await test(); // A simple query to test the connection
      console.log(results);
      console.log('Connected to the database!');
    } catch (error) {
      console.error('Failed to connect to the database:', error.message);
    } finally {
        knex.destroy();
    }
}

connect();
  