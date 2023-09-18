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

const createFeedbacks = async (date) => {
  const { FEEDBACK_USERNAME, FEEDBACK_HOSTNAME, FEEDBACK_CSVPATH, API_BASE_URL } = process.env;
  const client = connectDB();

  let folderDate = moment().subtract(1, "days").format("YYYY-MM-DD"); // yesterdays date
  let lastSyncDate = folderDate;
  let syncDate = moment().format("YYYY-MM-DD"); // todays date

  // Check if date is specified for lastSyncDate
  const lastSyncDatefolderPath = `./server/feedbackCSV/`; // Change this to the path you want to check/create
  const lastSyncDatefileName = 'feedback_date_sync.txt';

  if(date !== ''){
    folderDate = moment(date).format('YYYY-MM-DD');
    // Define the file name and content
    syncDate = date;


    fs.readFile(lastSyncDatefolderPath + lastSyncDatefileName, 'utf8', (err, data) => {
      if (err) {
        console.error('Error reading the file:', err);
      } else {
        console.log('File contents:', data);
        lastSyncDate = data;
      }
    });

    // Check if the folder exists
    if (!fs.existsSync(lastSyncDatefolderPath)) {
      // If it doesn't exist, create it
      fs.mkdirSync(lastSyncDatefolderPath);
      console.log(`Folder '${lastSyncDatefolderPath}' created.`);

    } else {
      console.log(`Folder '${lastSyncDatefolderPath}' already exists.`);
    }

  }

  const localDirectoryPath = "./server/feedbackCSV2/" + folderDate + "/"; // Replace with the actual directory path
  const remoteDirectoryPath = `${FEEDBACK_USERNAME}@${FEEDBACK_HOSTNAME}:${FEEDBACK_CSVPATH}${folderDate}/`; // // Replace with the actual directory path on public remote server
  console.log(remoteDirectoryPath)

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
        const filteredFiles = files.filter((file) => {
          //file.startsWith(folderDate)
          // Split the file name into parts eg, sample: 2023-08-17_17-47-33-a87f188d52ff41a9d80f653d413d6366.csv
          const parts = file.split('_')

          // Extract date and time components
          const year = parts[0].split('-')[0];
          const month = parts[0].split('-')[1];
          const day = parts[0].split('-')[2]; // Extract the day and remove the trailing part

          const hours = parts[1].split("-")[0];
          const minutes = parts[1].split("-")[1];
          const seconds = parts[1].split("-")[2];

          // Create a Date object with the extracted components
          const fileDateStr = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

          const fileDate = new Date(fileDateStr);

          const startDate = new Date(lastSyncDate);
          const endDate = new Date(syncDate);

          // Check if the file's date is within the specified range
          console.log('startDate', startDate, 'endDate', endDate, fileDate >= startDate && fileDate <= endDate);

          // Check if the file's date is within the specified range
          return fileDate >= startDate && fileDate <= endDate;
        }); 
        // Create the file
        console.log(lastSyncDatefolderPath + lastSyncDatefileName, syncDate)
        fs.writeFile(lastSyncDatefolderPath + lastSyncDatefileName, syncDate, (err) => {
          if (err) {
            console.error('Error creating the file:', err);
          } else {
            console.log(`File "${lastSyncDatefileName}" has been created.`);
          }
        });

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
const main = async (date = '') => {
  try {
    const client = connectDB();
    // Cron Job for retrieving feedback from the store
    const feedbacks = await createFeedbacks(date);
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

const runMainManually = async (date) => {
  try {
    console.log("Manually triggering main...");
    await main(date);
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
    let date = '';
    if(process.argv[3] && typeof process.argv[3] !== 'undefined'){
      date = process.argv[3];
    }

    console.log(date)

    runMainManually(date); // Run the main function manually
  } else {
    // Schedule the cron job
    start();
  }
}
