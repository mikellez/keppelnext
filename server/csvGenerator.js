const fs = require("fs");
const MemoryStream = require("memorystream");
const getStream = require("get-stream");

async function generateCSV(data) {
  // if (!isArray(data) || data.length == 0) return;
  var memStream = new MemoryStream();

  const datajsonHeadings = [];
  const datajsonNewHeadings = [
    "Plant	Question 1",
    "Single Choice Response",
    "Multi Choice Response",
    "Free Text Response",
    "Question 2",
    "Single Choice Response",
    "Multi Choice Response",
    "Free Text Response",
    "File Upload",
    "Question 3",
    "Single Choice Response",
    "Multi Choice Response",
    "Free Text Response",
  ];
  const activityLogHeadings = ["", "name", "date"];
  const activityLogNewHeadings = [
    "",
    "Approved/Completed By",
    "Approved/Completed Date",
  ];

  const headerKeys = Object.keys(data[0]);
  let dataStr = Object.keys(data[0]).toString();
  // dataStr += datajsonNewHeadings.toString();
  dataStr += activityLogNewHeadings.toString();

  const headerMap = {
    checklist_id: "Checklist ID",
    chl_name: "Checklist Name",
    description: "Description",
    status_id: "Status",
    activity_log: "Activity Log",
    createdbyuser: "Created By User",
    assigneduser: "Assigned User",
    signoffuser: "Signoff User",
    plant_name: "Plant",
    plant_id: "Plant ID",
    completeremarks_req: "Complete Remarks Required",
    linkedassets: "Linked Assets",
    linkedassetids: "Linked Asset IDs",
    chl_type: "Checklist Type",
    created_date: "Created Date",
    history: "History",
    datajson: "Data JSON",
    signoff_user_id: "Signoff User ID",
    assigned_user_id: "Assigned User ID",
    status: "Status",
    overdue: "Overdue",
    overdue_status: "Overdue Status",
    updated_at: "Updated At",
    checklist_status: "Checklist Status",
    "Approved/Completed By": "Approved/Completed By",
    "Approved/Completed Date": "Approved/Completed Date",
  };

  function replaceHeaders(dataStr, headerMap) {
    // Split the dataStr into an array of headers
    const headers = dataStr.split(",");

    // Replace each header using the headerMap
    const replacedHeaders = headers.map(
      (header) => headerMap[header] || header
    );
    // Join the replaced headers back into a string
    const replacedDataStr = replacedHeaders.join(",");
    return replacedDataStr;
  }

  // Modify the dataStr by replacing the headers with the mapping
  dataStr = replaceHeaders(dataStr, headerMap);

  for (row in data) {
    const tmp = [];
    for (heading in data[row]) {
      tmp.push(JSON.stringify(data[row][heading] || "-").replaceAll(",", "^"));
    }

    for (const heading of activityLogHeadings) {
      tmp.push(JSON.stringify(data[row]["activity_log"][0][heading]));
      if (!headerKeys.includes(heading)) {
        headerKeys.push(heading);
      }
    }
    dataStr += "\n" + tmp.toString().replace(/\n/g, "");
  }
  memStream.write(dataStr);
  memStream.end(); // important -- you have to end the stream before storing it as a buffer
  const buffer = await getStream.buffer(memStream);
  return buffer;
}

// old generatveCSV function
// async function generateCSV(data) {
//   console.log("entered function")
//   // Debugging statements
//   console.log('Data length: ', data.length);
//   console.log('Data structure: ', data);
//   var memStream = new MemoryStream();
//   const dataStr = Object.keys(data[0]).toString();

//   // Create a mapping for the "activity_log" subheaders
//   const activityLogSubheaders = ["name", "date", "activity_type"];

//   // Create an array for all headers
//   const allHeaders = [...Object.keys(data[0]), ...activityLogSubheaders];

//   // Join all headers with tabs to form the header row
//   const headerRow = allHeaders.join("\t");
//   dataStr += "\n" + headerRow;
//   console.log("allHeaders: ",allHeaders)
//   console.log("headerRow", headerRow)
//   console.log('dataStr: ', dataStr)
//   console.log("data: ", data)
//   for (const row of data) {
//     const tmp = [];
//     console.log("enter each row")
//     console.log("row: ",row)
//     // Iterate through all headers
//     for (const header of allHeaders) {
//       if (header === "activity_log") {
//         console.log("enter activity log")
//         // Handle the "activity_log" subheaders
//         const activityLogValues = row.activity_log.map(activity => {
//           return activityLogSubheaders.map(subheader => activity[subheader]);
//         });
//         tmp.push(activityLogValues.join("\t"));
//       } else if (header in row) {
//         tmp.push(JSON.stringify(row[header]).replaceAll(",", "^^^^"));
//       } else {
//         tmp.push(""); // Fill empty cell if the header is not present in the row
//       }
//     }

//     dataStr += "\n" + tmp.join("\t");
//   }

//   memStream.write(dataStr);
//   memStream.end(); // Important: You have to end the stream before storing it as a buffer
//   const buffer = await getStream.buffer(memStream);
//   return buffer;
// }
// end of old generateCSV function

module.exports = { generateCSV };
