require("dotenv").config();
const PDFDocument = require("pdfkit-table");
const axios = require("axios");
const moment = require("moment");
const getStream = require("get-stream");
const SVGtoPDF = require("svg-to-pdfkit");

const azSVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 7 7" shape-rendering="crispEdges">
<rect width="7" height="7" fill="#F15A23"/>
<g fill="white">
    <rect height="1" width="3" x="3" y="1"/>
    <rect height="1" width="4" x="2" y="3"/>
    <rect height="1" width="5" x="1" y="5"/>
</g>
</svg>`;

async function fetchChecklist(checklistId) {
  return axios
    .get(
      `http://${process.env.SERVER}:${process.env.PORT}/api/checklist/record/${checklistId}`
    )
    .then((res) => {
      return res.data;
    })
    .catch((err) => {
      console.log(err);
    });
}

async function fetchMultipleChecklists(checklistIdTuple) {
  const checklistIdsString = checklistIdTuple.toString();
  
  return axios
    .get(
      `http://${process.env.SERVER}:${process.env.PORT}/api/checklist/record/compilation/${checklistIdsString}`
    )
    .then((res) => {
      return res.data;
    })
    .catch((err) => {
      console.log(err);
    });
}

function placeTopInfo(doc, arr, marginX = 50, distance = 110) {
  arr.forEach((e) => {
    const y = doc.y;
    if (!e) return doc.text("\n");

    doc
      .font("Times-Bold")
      .text(e.title + ":", marginX, y, { lineGap: 5 })
      .font("Times-Roman")
      .text(e.content, marginX + distance, y, { lineGap: 5, width: 150 });
  });
}

function placeFooter(doc, svg, marginX) {
  const svgY = doc.y;
  doc.text("© 2023 Azendian Solutions Pte Ltd\n\n", { align: "center" });
  SVGtoPDF(doc, svg, marginX + 197, svgY - 375, { width: 15 });
  doc.text("Powered By Azendain Solutions", doc.x + 20, doc.y, {
    align: "center",
  });
}

// Generate a pdf file for the checklist
async function generateChecklistPDF(checklistId) {
  const cl = await fetchChecklist(checklistId);
  if (!cl) return null;

  const marginX = 50;
  const doc = new PDFDocument({ margin: marginX, autoFirstPage: false });
  const historyArr = [];
  cl.activity_log.forEach((row) => {
    // console.log(row);
    arr = [];
    arr.push(row.activity);
    arr.push(row.activity_type);
    arr.push(row.date);
    arr.push(row.name);
    historyArr.push(arr);
  });
  //   console.log(historyArr, 22);

  // The default header on every page
  doc.on("pageAdded", () => {
    doc
      .image("public/keppellogo.png", { height: 20 })
      .fontSize(10)
      .font("Times-Roman");
    const tmp = doc.y;
    doc.fontSize(8).text("\n", marginX, 700);
    placeFooter(doc, azSVG, marginX);
    doc.text("\n", marginX, tmp);
  });

  // Add First Page
  doc.addPage();

  const headerObj = [
    { title: "Checklist Name", content: cl.chl_name },
    { title: "Checklist ID", content: cl.checklist_id },
    { title: "Plant", content: cl.plant_name },
    { title: "Assigned To", content: cl.assigneduser.trim() || '-'},
    { title: "Created By", content: cl.createdbyuser.trim() },
    { title: "Signoff By", content: cl.signoffuser.trim() || '-'},
    {
      title: "Created On",
      content: moment(new Date(cl.created_date)).format("lll"),
    },
    { title: "Linked Assets", content: cl.linkedassets },
  ];

  placeTopInfo(doc, headerObj, marginX);
  doc.text("\n", marginX);
  (async function createTable() {
    // Table
    const table = {
      title: { label: "Checklist History", fontSize: 10, font: "Times-Roman" },
      headers: [
        { label: "Status", width: 50 },
        { label: "Activity", width: 148 },
        { label: "Date", width: 148 },
        { label: "Action By", width: 100 },
      ],
      rows: historyArr,
    };

    console.log("historyArr", historyArr);

    await doc.table(table, {
      prepareHeader: () => doc.font("Times-Bold").fontSize(10),
      prepareRow: (row, indexColumn, indexRow, rectRow, rectCell) => {
        doc.font("Times-Roman").fontSize(8);
      },
    });
  })();

  // The checklist contents
  cl.datajson.forEach((sect) => {
    // Page break
    if (doc.y > 450) {
      doc.addPage({ margin: 50 });
    }
    doc.font("Times-Bold").text(`${sect.description}`, { underline: true });
    let count = 1;
    sect.rows.forEach((row) => {
      // Page break
      if (doc.y > 590) {
        doc.addPage({ margin: 50 });
      }

      if (row.checks) {
        row.checks.forEach((check) => {
          // Page break
          if (doc.y > 600) {
            doc.addPage({ margin: 50 });
          }

          doc.font("Times-Roman").fontSize(8).text(check.question.trim());
          if (check.type === "SingleChoice") {
            check.choices.forEach((choice) => {
              if (check.value && choice === check.value) {
                doc
                  .rect(doc.x + 1, doc.y + 1, 4, 4)
                  .font("Times-Roman")
                  .fillOpacity(1.0)
                  .fillAndStroke("black", "black")
                  .fontSize(8)
                  .text(choice, marginX, doc.y, { indent: 7 });
              } else {
                doc
                  .rect(doc.x + 1, doc.y + 1, 4, 4)
                  .font("Times-Roman")
                  .stroke()
                  .fontSize(8)
                  .text(choice, marginX, doc.y, { indent: 7 });
              }
            });
          } else if (check.type === "FreeText") {
            // console.log("FreeText doc" + check.value);
            // console.log("Doc " + doc);
            if (check.value) {
              //   doc.font("Times-Roman").fontSize(8).text(check.question.trim());
              const startY = doc.y;
              doc
                .text("\n")
                .text(check.value, marginX + 7, doc.y, { width: "496" })
                .text("\n");
              const endY = doc.y;
              doc.rect(marginX, startY + 5, 507, endY - startY - 10).stroke();
            } else if (!check.value) {
              if (check.value.trim().length != 0) {
                // doc.font("Times-Roman").fontSize(8).text(check.question.trim());
                doc
                  .text()
                  .rect(marginX, doc.y, 507, 40)
                  .stroke()
                  .text("\n\n\n\n");
              }
            }
          } else if (check.type === "Signature") {
            if (check.value) {
              doc.image(check.value, marginX, doc.y, { width: 50, height: 50 });
            }
          } else if (check.type === "FileUpload") {
            if (check.value) {
              doc.image(check.value, marginX, doc.y, { height: 100 });
            }
          } else if (check.type === "MultiChoice") {
            check.choices.forEach((choice) => {
              if (check.value && check.value.split(", ").includes(choice)) {
                doc
                  .rect(doc.x + 1, doc.y + 1, 4, 4)
                  .font("Times-Roman")
                  .fillOpacity(1.0)
                  .fillAndStroke("black", "black")
                  .fontSize(8)
                  .text(choice, marginX, doc.y, { indent: 7 });
              } else {
                doc
                  .rect(doc.x + 1, doc.y + 1, 4, 4)
                  .font("Times-Roman")
                  .stroke()
                  .fontSize(8)
                  .text(choice, marginX, doc.y, { indent: 7 });
              }
            });
          }
          doc.text("\n", marginX);
        });
      }
    });
  });

  doc.end();
  let docData = await getStream.buffer(doc);
  return docData;
}

async function generateCompiledChecklistsPDF(checklistIdList) {
  const doc = new PDFDocument({ margin: 50, autoFirstPage: false });

  // Specify the target checklist_id for filtering
  const targetChecklistIds = checklistIdList;

  // Filter the checklistIdList based on the target checklist_id
  const filteredChecklistIdList = checklistIdList.filter((checklistId) =>
    targetChecklistIds.includes(checklistId)
  );
 
  const checklist_ids_tuple = `(${filteredChecklistIdList.join(", ")})`;
  const cls = await fetchMultipleChecklists(checklist_ids_tuple);
  if (!cls) {
    return null;
  }

  const marginX = 50;
  // const doc = new PDFDocument({ margin: marginX, autoFirstPage: false });
  const historyArr = [];

  // The default header on every page
  doc.on("pageAdded", () => {
    doc
      .image("public/keppellogo.png", { height: 20 })
      .fontSize(10)
      .font("Times-Roman");
    const tmp = doc.y;
    doc.fontSize(8).text("\n", marginX, 700);
    placeFooter(doc, azSVG, marginX);
    doc.text("\n", marginX, tmp);
  });

  for (const cl of cls) {
    cl.activity_log.forEach((row) => {
      arr = [];
      arr.push(row.activity);
      arr.push(row.activity_type);
      arr.push(row.date);
      arr.push(row.name);
      historyArr.push(arr);
    });

    // Add First Page
    doc.addPage();
    
    const headerObj = [
      { title: "Checklist Name", content: cl.chl_name },
      { title: "Checklist ID", content: cl.checklist_id },
      { title: "Plant", content: cl.plant_name },
      { title: "Assigned To", content: cl.assigneduser.trim() || "-" },
      { title: "Created By", content: cl.createdbyuser.trim() },
      { title: "Signoff By", content: cl.signoffuser.trim() || "-" },
      {
        title: "Created On",
        content: moment(new Date(cl.created_date)).format("lll"),
      },
      { title: "Linked Assets", content: cl.linkedassets },
    ];

    placeTopInfo(doc, headerObj, marginX);

    doc.text("\n", marginX);
    (async function createTable() {
      // Table
      const table = {
        title: {
          label: "Checklist History",
          fontSize: 10,
          font: "Times-Roman",
        },
        headers: [
          { label: "Status", width: 50 },
          { label: "Activity", width: 148 },
          { label: "Date", width: 148 },
          { label: "Action By", width: 100 },
        ],
        rows: historyArr,
      };

      await doc.table(table, {
        prepareHeader: () => doc.font("Times-Bold").fontSize(10),
        prepareRow: (row, indexColumn, indexRow, rectRow, rectCell) => {
          doc.font("Times-Roman").fontSize(8);
        },
      });
    })();

    // The checklist contents
    cl.datajson.forEach((sect) => {
      // Page break
      if (doc.y > 450) {
        doc.addPage({ margin: 50 });
      }
      doc.font("Times-Bold").text(`${sect.description}`, { underline: true });
      let count = 1;
      sect.rows.forEach((row) => {
        // Page break
        if (doc.y > 590) {
          doc.addPage({ margin: 50 });
        }

        if (row.checks) {
          row.checks.forEach((check) => {
            // Page break
            if (doc.y > 600) {
              doc.addPage({ margin: 50 });
            }

            doc.font("Times-Roman").fontSize(8).text(check.question.trim());
            if (check.type === "SingleChoice") {
              check.choices.forEach((choice) => {
                if (check.value && choice === check.value) {
                  doc
                    .rect(doc.x + 1, doc.y + 1, 4, 4)
                    .font("Times-Roman")
                    .fillOpacity(1.0)
                    .fillAndStroke("black", "black")
                    .fontSize(8)
                    .text(choice, marginX, doc.y, { indent: 7 });
                } else {
                  doc
                    .rect(doc.x + 1, doc.y + 1, 4, 4)
                    .font("Times-Roman")
                    .stroke()
                    .fontSize(8)
                    .text(choice, marginX, doc.y, { indent: 7 });
                }
              });
            } else if (check.type === "FreeText") {
              if (check.value) {
                //   doc.font("Times-Roman").fontSize(8).text(check.question.trim());
                const startY = doc.y;
                doc
                  .text("\n")
                  .text(check.value, marginX + 7, doc.y, { width: "496" })
                  .text("\n");
                const endY = doc.y;
                doc.rect(marginX, startY + 5, 507, endY - startY - 10).stroke();
              } else if (!check.value) {
                if (check.value.trim().length != 0) {
                  // doc.font("Times-Roman").fontSize(8).text(check.question.trim());
                  doc
                    .text()
                    .rect(marginX, doc.y, 507, 40)
                    .stroke()
                    .text("\n\n\n\n");
                }
              }
            } else if (check.type === "Signature") {
              if (check.value) {
                doc.image(check.value, marginX, doc.y, {
                  width: 50,
                  height: 50,
                });
              }
            } else if (check.type === "FileUpload") {
              if (check.value) {
                doc.image(check.value, marginX, doc.y, { height: 100 });
              }
            } else if (check.type === "MultiChoice") {
              check.choices.forEach((choice) => {
                if (check.value && check.value.split(", ").includes(choice)) {
                  doc
                    .rect(doc.x + 1, doc.y + 1, 4, 4)
                    .font("Times-Roman")
                    .fillOpacity(1.0)
                    .fillAndStroke("black", "black")
                    .fontSize(8)
                    .text(choice, marginX, doc.y, { indent: 7 });
                } else {
                  doc
                    .rect(doc.x + 1, doc.y + 1, 4, 4)
                    .font("Times-Roman")
                    .stroke()
                    .fontSize(8)
                    .text(choice, marginX, doc.y, { indent: 7 });
                }
              });
            }
            doc.text("\n", marginX);
          });
        }
      });
    });
  }
  doc.end();
  let docData;
  try {
    docData = await getStream.buffer(doc);
    return docData;
  } catch (error) {
    console.error("Error:", error);
  }
  return docData;
}

// Fetch a specific request by id
async function fetchRequest(id) {
  return await axios
    .get(`http://${process.env.SERVER}:${process.env.PORT}/api/request/` + id)
    .then((res) => {
      return res.data;
    })
    .catch((err) => {
      console.log(err);
    });
}

// Generate a PDF file for request
async function generateRequestPDF(id) {
  const request = await fetchRequest(id);
  //   console.log("^&*^*(*(");
  //   console.log(Object.keys(request));

  if (!request) return null;

  const marginX = 50;
  const doc = new PDFDocument({ margin: marginX, autoFirstPage: false });

  const firstName = request.first_name ? request.first_name : "";
  const lastName = request.last_name ? request.last_name : "";
  const description = request.fault_description
    ? request.fault_description
    : "No Description";
  const assignedFName = request.assigned_first_name
    ? request.assigned_first_name
    : "";
  const assignedLName = request.assigned_last_name
    ? request.assigned_last_name
    : "";
  const assigned =
    assignedFName === "" && assignedLName === ""
      ? "Not Assigned"
      : assignedFName + " " + assignedLName;
  const priority = request.priority ? request.priority : "No Priority";
  const completionComments = request.complete_comments;
  const rejectionComments = request.rejection_comments;
  const history = request.activity_log;
  const faultImg = request.uploaded_file;
  const completedImg = request.completion_file;

  // Generating a 2D array for request table history
  const historyArr = [];
  // if (history) {
  //     history.split("!").forEach(row => {
  //         historyArr.push(row.split("_"))
  //     })
  // }
  if (history) {
    // console.log(typeof history, 1111);
    // console.log(history, 1111);
    history.forEach((row) => {
      arr = [];
      arr.push(row.activity_type);
      arr.push(row.activity);
      arr.push(row.date);
      arr.push(row.role);
      arr.push(row.name);
      historyArr.push(arr);
    });
    // console.log(historyArr, 22);
  }
  // {label: "Status", width: 50},
  //             {label: "Remarks", width: 148},
  //             {label: "Date", width: 148},
  //             {label: "Role", width: 50},
  //             {label: "Action By", width: 100},

  // The default header on every page
  doc.on("pageAdded", () => {
    doc
      .image("public/keppellogo.png", { height: 20 })
      .fontSize(10)
      .font("Times-Roman");
    const tmp = doc.y;
    doc.fontSize(8).text("\n", marginX, 700);
    placeFooter(doc, azSVG, marginX);
    doc.text("\n", marginX, tmp);
  });

  // First Page
  doc.addPage();

  const headerObj = [
    { title: "Request ID", content: request.request_id },
    { title: "Plant Name", content: request.plant_name },
    { title: "Status", content: request.status },
    { title: "Priority", content: priority },
    {
      title: "Created On",
      content: moment(new Date(request.created_date)).format("lll"),
    },
    { title: "Created By", content: firstName + " " + lastName },
    null,
    { title: "Asset", content: request.asset_name },
    { title: "Fault Type", content: request.fault_name },
    { title: "Assigned To", content: assigned || '-'},
  ];

  const bodyObj = [{ title: "Fault Description", content: description }];

  for (entry of historyArr) {
    if (entry[0] === "COMPLETED") {
      //   console.log(entry[2], new Date(entry[2]));
      headerObj.push({
        title: "Completed On",
        content: moment(new Date(entry[2].slice(0, -3))).format("lll"),
      });
      break;
    }
  }

  for (entry of historyArr) {
    if (entry[0] === "REJECTED") {
      headerObj.push({
        title: "Rejected On",
        content: moment(new Date(entry[2].slice(0, -3))).format("lll"),
      });
      break;
    }
  }

  if (
    historyArr.length != 0 &&
    historyArr[historyArr.length - 1][0] === "APPROVED"
  ) {
    headerObj.push({
      title: "Approved By",
      content: historyArr[historyArr.length - 1][4],
    });
    headerObj.push({
      title: "Approved On",
      content: moment(historyArr[historyArr.length - 1][2]).format("lll"),
    });
  }

  if (completionComments) {
    //headerObj.push({title: "Completed Date", content: moment(new Date(request.compl)).format("lll")})
    bodyObj.push({ title: "Completion Comments", content: completionComments });
  }

  if (rejectionComments)
    bodyObj.push({ title: "Rejection Comments", content: rejectionComments });

  const startY = doc.y;
  placeTopInfo(doc, headerObj);
  doc.text("\n");

  bodyObj.forEach((row) => {
    doc
      .font("Times-Bold")
      .text(row.title, marginX, doc.y, { lineGap: 3, width: 300 })
      .font("Times-Roman")
      .text(row.content, { lineGap: 3, width: 250 })
      .text("\n");
  });

  doc.text("\n");

  if (faultImg) {
    doc
      .font("Times-Bold")
      .text("Fault Image", marginX + 370, startY)
      .text("\n")
      .image(Buffer.from(faultImg.data), marginX + 300, startY + 10, {
        fit: [200, 200],
        align: "center",
      });
  }

  if (completedImg) {
    doc
      .font("Times-Bold")
      .text("Completed Image", marginX + 360, startY + 250)
      .text("\n")
      .image(Buffer.from(completedImg.data), marginX + 300, startY + 260, {
        fit: [200, 200],
        align: "center",
      });
  }
  doc.addPage();

  (async function createTable() {
    // Table
    const table = {
      title: { label: "Request History", fontSize: 10, font: "Times-Roman" },
      headers: [
        { label: "Status", width: 50 },
        { label: "Activity", width: 148 },
        { label: "Date", width: 148 },
        { label: "Role", width: 50 },
        { label: "Action By", width: 100 },
      ],
      rows: historyArr,
    };

    await doc.table(table, {
      prepareHeader: () => doc.font("Times-Bold").fontSize(10),
      prepareRow: (row, indexColumn, indexRow, rectRow, rectCell) => {
        doc.font("Times-Roman").fontSize(8);
      },
    });
  })();

  // EOF
  doc.end();
  let docData = await getStream.buffer(doc);
  console.log("docData: ", docData);
  return docData;
}

function sendRequestPDF(req, res, next) {
  generateRequestPDF(req.params.request_id)
    .then((result) => {
      if (result === null) return res.status(400).send();

      res.set({
        "Content-Type": "application/pdf",
        "Content-Length": result.len,
      });
      return res.status(200).send(result);
    })
    .catch((err) => {
      //   console.log(err);
      return res.status(500).json("Error in generating PDF");
    });
}

// Send a checklist pdf
function sendChecklistPDF(req, res, next) {
  generateChecklistPDF(req.params.checklist_id)
    .then((result) => {
      if (result === null) return res.status(400).send("No checklist found");

      res.set({
        "Content-Type": "application/pdf",
        "Content-Length": result.len,
      });

      return res.status(200).send(result);
    })
    .catch((err) => {
      console.log(err);
      return res.status(500).json("Error in generating PDF");
    });
}

// Send a checklist pdf
function sendAllChecklistsPDF(req, res, next) {

  const checklistIdArray = req.params.checklistIds.split(",");
  generateCompiledChecklistsPDF(checklistIdArray)
    .then((result) => {
      if (result === null) return res.status(400).send("No checklist found");

      res.set({
        "Content-Type": "application/pdf",
        "Content-Length": result.len,
      });

      return res.status(200).send(result);
    })
    .catch((err) => {
      console.log(err);
      return res.status(500).json("Error in generating PDF");
    });
}

module.exports = {
  generateChecklistPDF,
  sendChecklistPDF,
  generateRequestPDF,
  sendRequestPDF,
  sendAllChecklistsPDF,
};
