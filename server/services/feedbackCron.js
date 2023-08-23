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
const { exec } = require("child_process");
const { stdout, stderr } = require("process");

const connectDB = () => {
  const dbName = dbJSON["cmms"];
  const client = new Client(dbName);
  client.connect();
  return client;
};

const createFeedbackRsync = async (callback) => {
  const {
    FOLDER_NAME,
    FEEDBACK_USERNAME,
    FEEDBACK_HOSTNAME,
    FEEDBACK_SERVER,
    FEEDBACK_SERVER_PORT,
    FEEDBACK_SERVER_HTTP,
  } = process.env;
  const yesterdayDate = moment().subtract(1, "days").format("YYYY-MM-DD");
  const fileDes = `./server/feedbackCSV2/${yesterdayDate}`;
  const fileSrc = `'${FEEDBACK_USERNAME}'@${FEEDBACK_HOSTNAME}:./${FOLDER_NAME}/server/feedbackCSV/${yesterdayDate}`;
  exec(`rsync -a ${fileSrc}/ ${fileDes}`, (err, stdout, stderr) => {
    if (err) {
      console.log(err);
      return;
    }
    if (stderr) {
      console.log(stderr);
      return;
    }
    console.log(stdout);
    callback();
  });
};

const createFeedbacks = async () => {
  const { FEEDBACK_SERVER, FEEDBACK_SERVER_PORT, FEEDBACK_SERVER_HTTP } =
    process.env;
  const client = connectDB();

  createFeedbackRsync(() => {
    const yesterdayDate = moment().subtract(1, "days").format("YYYY-MM-DD");
    const directoryPath = `./server/feedbackCSV2/${yesterdayDate}`; // Replace with the actual directory path
    fs.readdir(directoryPath, (err, files) => {
      if (err) {
        console.error("Error reading directory:", err);
        return;
      }

      const filteredFiles = files.filter((file) =>
        file.startsWith(yesterdayDate)
      );

      filteredFiles.forEach((file) => {
        const filePath = path.join(directoryPath, file);
        fs.readFile(filePath, "utf8", (err, data) => {
          if (err) {
            console.error("Error reading file:", err);
            return;
          }
          // Process data from the file
          let columnData = {};
          const lines = data.split("\n");

          lines.forEach((line, lineIndex) => {
            const columns = line.split(","); // Split line into columns based on comma (CSV)

            if (lineIndex === 0) {
              headers = columns.map((header) => header.trim());
            } else {
              columns.forEach((column, columnIndex) => {
                const header = headers[columnIndex];
                let value = column.trim();
                if (!columnData[header]) {
                  columnData[header] = "";
                }

                value = value.replaceAll("^", ",");

                columnData[header] = JSON.parse(value);
              });

              axios
                .post(
                  `${FEEDBACK_SERVER_HTTP}://${FEEDBACK_SERVER}:${FEEDBACK_SERVER_PORT}/api/feedback`,
                  columnData
                )
                .then((res) => {
                  console.log("Feedback created for " + filePath);
                })
                .catch((err) => {
                  //console.log(err.response);
                  console.log("Unable to create feedback");
                });

              return;
            }
          });
        });
      });

      console.log("Files with date format YYYY-MM-DD:", filteredFiles);
    });
  });
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
