const cron = require("node-cron");
const { knex } = require("knex");
const moment = require("moment");
const exp = require("constants");
const knexJSON = require("../db/db.knexConfig.json");

const connectDB = () => {
  const dbName = knexJSON["cmms"];
  const client = knex(dbName);
  return client;
};

const fetchNewlyOverdueRequests = async () => {
    const client = connectDB();
    const result = await client("keppel.request")
    .select()
    .where('created_date', '<=', client.raw('NOW() - INTERVAL \'7 days\'')) // Active Requests that are >= 7 days old
    .andWhere(builder =>{
      builder.where('status_id', 1).orWhere('status_id', 2); // Status of req is Assigned or Pending
    })
    .catch(error => {
      console.log("Unable to retrieve expired requests: " + error);
    })
    .finally(() => {
      client.destroy();
    })
    return result;
  };

const handleOverdueRequests = async (id) => {
    const client = connectDB();
    const result = await client("keppel.request")
    .where('request_id', id)
    .update({
      status_id: 7 
    }).catch(error => {
      console.log("Unable to update request status_id: " + error);
    })
    .finally(() => {
      client.destroy();
    });
    //console.log(result);
    return result;
  };
const main = async () => {
    try {
      const requests = await fetchNewlyOverdueRequests();
      //console.log(requests);
      for (let rq of requests) {
        //console.log(rq.request_id);
        await handleOverdueRequests(rq.request_id);
      }
      
    } catch (error) {
      console.log(error);
    }
  };
  
module.exports = cron.schedule("0 8 * * *", () => {
    main();
});


