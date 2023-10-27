require("dotenv").config();
const cron = require("node-cron");
const axios = require("axios");

var task = cron.schedule(
  "* * * * *",
  async () => {
    // console.log("trigger task");

    // run workflow task - auto assign user
    await axios
      .get(`${process.env.API_BASE_URL}/api/workflow/run/assign`)
      .catch((err) => {
        console.log(err.response);
        console.log("Unable to run workflow task - assign user");
      });

    // run workflow task - auto send email
    await axios
      .get(`${process.env.API_BASE_URL}/api/workflow/run/email`)
      .catch((err) => {
        console.log(err.response);
        console.log("Unable to run workflow task - send email");
      });
    //console.log(result.data)
  },
  {
    scheduled: true,
  }
);

module.exports = task;