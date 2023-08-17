const cron = require("node-cron");
const { Client } = require("pg");
const moment = require("moment");
const dbJSON = require("../db/db.config.json");

const connectDB = () => {
  const dbName = dbJSON["cmms"];
  const client = new Client(dbName);
  client.connect();
  return client;
};

const createFeedbacks = async () => {
  const client = connectDB();
  await instance.get(`/api/feedback/file`).then(async (res) => { 
    // transform csv and send to api
    const form = new FormData();
    form.append("file", res.data, "feedback.csv");

    await instance.post(`/api/feedback`, form);
  });

}

const main = async () => {
  try {
    const client = connectDB();
    const feedbacks = await createFeedbacks();
    console.log("System Generated Feedbacks Created.");
    client.end();
  } catch (err) {
    console.log(err);
  }
};

const runMainManually = async () => {
  try {
    console.log("Manually triggering main...");
    await main();
    console.log("Manual execution of main completed.");
  } catch (err) {
    console.log(err);
  }
};

const start = async () => {
  module.exports = cron.schedule("0 0 7 * * *", () => {
    main();
  });
}

module.exports = { start };

// Check if the script is being run directly
if (require.main === module) {
  if (process.argv[2] === "manual") {
    runMainManually(); // Run the main function manually
  } else {
    // Schedule the cron job
    start();
  }
}
