/**
 * Feedback Cron:
 *
 * Guest Feedbacks will be saved under folder : feedbackCSV/{date}
 * These feedbacks in the folder will be stored in a external feedback server and will be
 * queried every morning at 0700 hrs into the internal server with the function :
 * - createFeedback
 *
 * 
 * External Server requires plant_location and plant_master data from the internal database. Hence, 
 * the external server needs to store these data locally in plant_location.json and plant_master.json.
 * At the same time interval as above, the data will be queried from the internal db to update the data
 * in these 2 files on the external server with the function
 * - updatePublicServerStore
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
  const { FEEDBACK_USERNAME, FEEDBACK_HOSTNAME, FEEDBACK_CSVPATH, API_BASE_URL } = process.env;
  const client = connectDB();

  const yesterdayDate = moment().subtract(1, "days").format("YYYY-MM-DD");
  const localDirectoryPath = "./server/feedbackCSV2/" + yesterdayDate + "/"; // Replace with the actual directory path
  const remoteDirectoryPath = `${FEEDBACK_USERNAME}@${FEEDBACK_HOSTNAME}:${FEEDBACK_CSVPATH}${yesterdayDate}/`; // // Replace with the actual directory path on public remote server

  // Constructing the rsync command - https://www.npmjs.com/package/rsync
  var rsync = new Rsync()
    .flags("a") // The -a flag copies the full directory not just a file
    .shell("ssh") // Uncomment when public remote server has been setup
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
            // Process data from the file
            let columnData = {};
            const lines = data.split('\n');

            lines.forEach((line, lineIndex) => {
              const columns = line.split(','); // Split line into columns based on comma (CSV)

              if (lineIndex === 0) {
                headers = columns.map(header => header.trim());
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
                // Create feedback for each feedback csv retrieved
                axios.post(`${API_BASE_URL}/api/feedback`, columnData).then((res) => {
                  console.log("Feedback created for " + filePath);
                  return res;
                }).catch((err) => {
                  console.log(err);
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
  } catch (err) {
    console.error("Error while fetching and saving files:", err);
  }
};
const updatePublicServerStore = async (client) => {
  const { FEEDBACK_SERVER_HTTP, FEEDBACK_SERVER, FEEDBACK_SERVER_PORT } = process.env;
  try{

    // Query for plant_location and plant_master data
    const plantLocationResult = await client.query(`SELECT loc_id as id, plant_id, concat(concat(loc_floor, ' Floor - '), loc_room) as location
    FROM keppel.plant_location`);
    const plantMasterResult = await client.query(`SELECT plant_id, plant_name, plant_description FROM keppel.plant_master
    ORDER BY plant_id ASC`);

    // Merge the 2 data jsons to craft the post body
    const postData = {
      plant_location: plantLocationResult.rows,
      plant_master: plantMasterResult.rows
    };
    console.log(postData);
    
    // Post request to the Public Feedback Server to update the store
    const res = await axios
              .post(`${FEEDBACK_SERVER_HTTP}://${FEEDBACK_SERVER}:${FEEDBACK_SERVER_PORT}/api/plantLocation/updateStore/`,JSON.stringify(postData)
              ,{
                headers: {
                  'Content-Type': 'application/json'
                }
              })
              .catch((err) => {
                console.log(err);
                console.log("Unable to send updated data");
              });
    return res;
    }catch(err){
      console.error("Error updating Public Server store:", err);
    }
}
const main = async () => {
  try {
    const client = connectDB();
    // Cron Job for retrieving feedback from the store
    const feedbacks = await createFeedbacks();
    if(feedbacks){
      console.log("System Generated Feedbacks Created.");
    }
    // Also update the public server store for plant_location and plant_master at the same time
    const updatePublicServer = await updatePublicServerStore(client);
    if(updatePublicServer){
      console.log("Public Store Updated. ");
    }
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
