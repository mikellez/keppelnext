const knexConfig = require('../db/knexConfig');
const knex = require('knex')(knexConfig.development); // Replace 'development' with the desired environment


async function connect() {
    try {
      const results = await knex("keppel.status_lm").select(); // A simple query to test the connection
      console.log(results);
      console.log('Connected to the database!');
    } catch (error) {
      console.error('Failed to connect to the database:', error.message);
    } finally {
        knex.destroy();
    }
  }
  connect();
  