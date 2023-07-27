const cron = require("node-cron");

var task = cron.schedule(
  "* * * * *",
  async () => {
    // console.log("trigger task");

    // run workflow task - auto assign user
    await axios
      .get(`http://localhost:${process.env.PORT}/api/workflow/run/assign`)
      .catch((err) => {
        console.log(err.response);
        console.log("Unable to run workflow task - assign user");
      });

    // run workflow task - auto send email
    await axios
      .get(`http://localhost:${process.env.PORT}/api/workflow/run/email`)
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