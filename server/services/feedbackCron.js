/**
 * Feedback Cron:
 *
 * Guest Feedbacks will be saved under folder : feedbackCSV/{date}
 * These feedbacks in the folder will be stored in a external server and will be
 * queried every morning at 0700 hrs into the internal server with the function :
 * - createFeedback
 *
 */

require("dotenv").config();
const cron = require("node-cron");
const { Client } = require("pg");
const moment = require("moment");
const dbJSON = require("../db/db.config.json");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const Rsync = require("rsync");

const connectDB = () => {
  const dbName = dbJSON["cmms"];
  const client = new Client(dbName);
  client.connect();
  return client;
};

const createFeedbacks = async () => {
  const { FEEDBACK_SERVER, FEEDBACK_SERVER_PORT, FEEDBACK_SERVER_HTTP } =
    process.env;
  const client = connectDB();

  const yesterdayDate = moment().subtract(1, "days").format("YYYY-MM-DD");
  const localDirectoryPath = "./server/feedbackCSV2/" + yesterdayDate + "/"; // Replace with the actual directory path
  const remoteDirectoryPath = "./server/feedbackCSV/" + yesterdayDate + "/"; // // Replace with the actual directory path on public remote server

  // Constructing the rsync command - https://www.npmjs.com/package/rsync
  var rsync = new Rsync()
    .flags("az") // The -a flag copies the full directory not just a file
    //.shell("ssh") // Uncomment when public remote server has been setup
    // note - need to generate SSH key pair on internal server and pass public key to remote server:
    // https://www.digitalocean.com/community/tutorials/how-to-configure-ssh-key-based-authentication-on-a-linux-server
    .source(remoteDirectoryPath)
    .destination(localDirectoryPath);

  // CSV Files with the same date will be stored together
  if (!fs.existsSync(localDirectoryPath)) {
    fs.mkdirSync(localDirectoryPath, { recursive: true });
  }

  try {
    // Execute the rsync command
    rsync.execute(function (error, code, cmd) {
      if (error) {
        console.error("Error copying files:", error);
        return;
      }
      console.log("Command execution complete:", cmd);
      fs.readdir(localDirectoryPath, (err, files) => {
        if (err) {
          console.error("Error reading directory:", err);
          return;
        }

        // Getting the files with the required date and extracting their content
        const filteredFiles = files.filter((file) =>
          file.startsWith(yesterdayDate)
        );

        filteredFiles.forEach((file) => {
          const filePath = path.join(localDirectoryPath, file);
          fs.readFile(filePath, "utf8", (err, data) => {
            if (err) {
              console.error("Error reading file:", err);
              return;
            }
          });
        });
        console.log("Files with date format YYYY-MM-DD:", filteredFiles);
      });

      console.log("Files with date format YYYY-MM-DD:", filteredFiles);
    });
  } catch (err) {
    console.error("Error while fetching and saving files:", err);
  }
};

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
};

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
