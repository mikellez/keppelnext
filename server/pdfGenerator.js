// require dependencies
const PDFDocument = require('pdfkit-table');
const axios = require('axios');
const moment = require('moment');
const getStream = require('get-stream');
const SVGtoPDF = require('svg-to-pdfkit');

//import { Buffer } from 'buffer'

// axios.defaults.baseURL = 'http://localhost:3000';

const azSVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 7 7" shape-rendering="crispEdges">
<rect width="7" height="7" fill="#F15A23"/>
<g fill="white">
    <rect height="1" width="3" x="3" y="1"/>
    <rect height="1" width="4" x="2" y="3"/>
    <rect height="1" width="5" x="1" y="5"/>
</g>
</svg>`;

// Get the details of checklist
// async function fetchChecklist(userId, checklistId, checklistType) {
//     return axios.get(`http://localhost:3000/api/checklist/getChecklist/${userId}/${checklistId}/${checklistType}`)
//         .then(res => {
//             return res.data[0];
//         })
//         .catch(err => {
//             console.log(err)
//         })
// };

function placeTopInfo(doc, arr, marginX=50, distance=110) {
    arr.forEach((e) => {
        const y = doc.y
        if(!e)
            return doc.text("\n")

        doc.font("Times-Bold").text(e.title + ":", marginX, y, { lineGap: 5 })
        .font("Times-Roman").text(e.content, marginX + distance, y, { lineGap: 5, width: 150 })
    })
};

function placeFooter(doc, svg, marginX) {
    const svgY = doc.y
    doc.text("© 2023 Azendian Solutions Pte Ltd\n\n", { align: 'center' });
    SVGtoPDF(doc, svg, marginX + 197, svgY - 375, { width: 15 });
    doc.text("Powered By Azendain Solutions", doc.x + 20, doc.y, { align: 'center' });
};

// Generate a pdf file for the checklist
// async function generateChecklistPDF(userId, checklistId, checklistType) {
//     const cl = await fetchChecklist(userId, checklistId, checklistType);
//     if (!cl)
//         return null;

//     const marginX = 50;
//     const doc = new PDFDocument({ margin: marginX, autoFirstPage: false });

//     // The default header on every page
//     doc.on('pageAdded', () => {
//         doc.image('./public/images/keppellogo.png', { height: 20 })
//         .fontSize(10)
//         .font('Times-Roman')
//         const tmp = doc.y;
//         doc.fontSize(8).text("\n", marginX, 700)
//         placeFooter(doc, azSVG, marginX)
//         doc.text("\n", marginX, tmp)
//     });

//     // Add First Page
//     doc.addPage()

//     const headerObj = [
//         {title: "Checklist Name",   content: cl.chl_name},
//         {title: "Checklist ID",     content: cl.checklist_id},
//         {title: "Plant",            content: cl.plant_name},
//         {title: "Assigned To",      content: cl.assigneduser},
//         {title: "Created By",     content: cl.createdbyuser},
//         {title: "Created On",     content: moment(new Date(cl.created_date)).format("lll")}
//     ]
    
//     if (cl.chl_type === "Approved") {
//         const approvedDate = moment(new Date(cl.history.split(",").slice(-1)[0].split("_")[2].slice(0, 16))).format("lll");
//         const approvedUser =  cl.history.split(",").slice(-1)[0].split("_")[3];
//         headerObj.push({title: "Approved On", content: approvedDate});
//         headerObj.push({title: "Approved By", content: approvedUser});
//     }
    
//     placeTopInfo(doc, headerObj, marginX);
//     doc.text("\n", marginX);

//     // The checklist contents
//     Object.keys(cl.datajson).forEach(sect => {
//         // Page break
//         if (doc.y > 450) {
//             doc.addPage({ margin: 50 })
//         }
//         doc.font('Times-Bold').text(`${cl.datajson[sect].sectionName}`, {underline: true})
//         let count = 1;
//         Object.keys(cl.datajson[sect]).forEach(row => {
//             // Page break
//             if (doc.y > 590) {
//                 doc.addPage({ margin: 50 })
//             }

//             if (row != "sectionName" && cl.datajson[sect].sectionName != "Sign Off") {
//                 doc.font('Times-Roman').fontSize(8).text(count + ". " + cl.datajson[sect][row].rowDescription, {underline: true});
//                 count++;
//             } 

//             if (cl.datajson[sect][row].checks) {
                
//                 cl.datajson[sect][row].checks.forEach(check => {
//                     // Page break
//                     if (doc.y > 600) {
//                         doc.addPage({ margin: 50 })
//                     }
//                     if (check.input_type === "radio") {
//                         doc.font('Times-Roman').fontSize(8).text(check.question.trim())
//                         check.values.forEach(option => {
//                             if (check.selected && option === check.selected) {
//                                 doc.rect(doc.x + 1, doc.y + 1, 4, 4).font('Times-Roman').fillOpacity(1.0).fillAndStroke("black", "black").fontSize(8).text(option, marginX, doc.y, {indent: 7})
//                             } 
//                             else {
//                                 doc.rect(doc.x + 1, doc.y + 1, 4, 4).font('Times-Roman').stroke().fontSize(8).text(option, marginX, doc.y, {indent: 7})
//                             }
//                         })
//                     } else if (check.input_type === "textarea" || check.input_type === "textarealong") {
//                         if (check.selected) {
//                             doc.font('Times-Roman').fontSize(8).text(check.question.trim())
//                             const startY = doc.y;
//                             doc.text("\n").text(check.selected, marginX + 7, doc.y, { width: "496" }).text("\n");
//                             const endY = doc.y;
//                             doc.rect(marginX, startY + 5, 507, endY - startY - 10).stroke();
//                         } else if (!check.selected) {
//                             if (check.selected.trim().length != 0) {
//                                 doc.font('Times-Roman').fontSize(8).text(check.question.trim())
//                                 doc.text().rect(marginX, doc.y, 507, 40).stroke().text("\n\n\n\n");
//                             }
//                         }
//                     } else if (check.input_type === "Signature") {
//                         doc.font('Times-Roman').fontSize(8).text(check.question.trim())
//                         if (check.selected) {
//                             doc.image(check.selected, marginX, doc.y, { width: 50, height: 50 })
//                         }
//                     } else if (check.input_type === "file") {
//                         if (check.selected) {
//                             doc.font('Times-Roman').fontSize(8).text(check.question.trim())
//                             doc.image(check.selected, marginX, doc.y, { height: 100 })
//                         }
//                     }
//                     doc.text("\n", marginX)  
//                 })
//             } 
//         })
//     })

//     doc.end();
//     let docData = await getStream.buffer(doc);
//     return docData;
// }

// Fetch a specific request by id
async function fetchRequest(id) {
    return await axios.get("http://localhost:3001/api/request/" + id)
        .then(res => {
            return res.data;
        })
        .catch(err => {
            console.log(err);
        });
};

// // Fetch fault image
// async function fetchFaultImg(id) {
//     return await axios.get("http://localhost:3000/api/request/file/" + id, {responseType: "arraybuffer"})
//         .then(res => {
//             if (res.status === 200) return res.data;
//         })
//         .catch(err => {
//             console.log(err);
//         });
// }

// // Fetch completed image
// async function fetchCompletedImg(id) {
//     return await axios.get("http://localhost:3000/api/request/completefile/" + id, {responseType: "arraybuffer"})
//         .then(res => {
//             if (res.status === 200) return res.data;
//         })
//         .catch(err => {
//             console.log(err);
//         });
// }

// async function fectchRequestHistory(id) {
//     return await axios.get("http://localhost:3000/api/request/getReqHistory/" + id)
//         .then(res => {
//             if (res.status === 200) return res.data.requesthistory;
//         })
//         .catch(err => {
//             console.log(err);
//         });
// }

// Generate a PDF file for request
async function generateRequestPDF(id) {
    const request = await fetchRequest(id);

    if (!request)
        return null;

    const marginX = 50;
    const doc = new PDFDocument({ margin: marginX, autoFirstPage: false });

    const firstName = request.first_name ? request.first_name : "";
    const lastName = request.last_name ? request.last_name : "";
    const description = request.fault_description ? request.fault_description : "No Description";
    const assignedFName = request.assigned_first_name ? request.assigned_first_name : "";
    const assignedLName = request.assigned_last_name ? request.assigned_last_name : "";
    const assigned = assignedFName === "" && assignedLName === "" ? "Not Assigned" : assignedFName + " " + assignedLName;
    const priority = request.priority ? request.priority : "No Priority";
    const completionComments = request.complete_comments;
    const rejectionComments = request.rejection_comments;
    const history = request.requesthistory;
    const faultImg = request.uploaded_file
    const completedImg = request.completion_file;

    // Generating a 2D array for request table history
    const historyArr = [];
    if (history) {
        history.split("!").forEach(row => {
            historyArr.push(row.split("_"))
        })
    }

    // The default header on every page
    doc.on('pageAdded', () => {
        doc
        .image('public/keppellogo.png', { height: 20 })
        .fontSize(10)
        .font('Times-Roman')
        const tmp = doc.y;
        doc.fontSize(8).text("\n", marginX, 700)
        placeFooter(doc, azSVG, marginX)
        doc.text("\n", marginX, tmp)
    });

    // First Page
    doc.addPage()

    const headerObj = [
        {title: "Request ID", content: request.request_id},
        {title: "Plant Name", content: request.plant_name},
        {title: "Status", content: request.status},
        {title: "Priority", content: priority},
        {title: "Created On", content: moment(new Date(request.created_date)).format("lll")},
        {title: "Created By", content: firstName + " " + lastName},
        null,
        {title: "Asset", content: request.asset_name},
        {title: "Fault Type", content: request.fault_name},
        {title: "Assigned To", content: assigned},
    ];

    const bodyObj = [
        {title: "Fault Description", content: description},
    ];

    for(entry of historyArr.slice().reverse()) {
        if(entry[0] === "COMPLETED") {
            console.log(entry[2], new Date(entry[2]));
            headerObj.push({title: "Completed On", content: moment(new Date(entry[2].slice(0, -3))).format("lll")})
            break;
        }
    }

    for(entry of historyArr.slice().reverse()) {
        if(entry[0] === "REJECTED") {
            headerObj.push({title: "Rejected On", content: moment(new Date(entry[2].slice(0, -3))).format("lll")})
            break;
        }
    }

    if(historyArr.length != 0 && historyArr[historyArr.length-1][0] === "APPROVED") {
        headerObj.push({title: "Approved By", content: historyArr[historyArr.length-1][4]})
        headerObj.push({title: "Approved On", content: moment(new Date(historyArr[historyArr.length-1][2].slice(0, -3))).format("lll")})
    }

    if(completionComments) {
        //headerObj.push({title: "Completed Date", content: moment(new Date(request.compl)).format("lll")})
        bodyObj.push({title: "Completion Comments", content: completionComments});
    }
    
    if(rejectionComments)
        bodyObj.push({title: "Rejection Comments", content: rejectionComments})

    const startY = doc.y;
    placeTopInfo(doc, headerObj);
    doc.text("\n");

    bodyObj.forEach(row => {
        doc
        .font("Times-Bold").text(row.title, marginX, doc.y, { lineGap: 3, width: 300 })
        .font("Times-Roman").text(row.content, { lineGap: 3, width: 250 })
        .text("\n")
    });

    doc.text("\n");

    if (faultImg) {
        doc
            .font("Times-Bold").text("Fault Image", marginX + 370, startY)
            .text("\n")
            .image(Buffer.from(faultImg.data), marginX + 300, startY + 10, { fit: [200, 200], align: "center" })
    }

    if (completedImg) {
        doc
            .font("Times-Bold").text("Completed Image", marginX + 360, startY + 250)
            .text("\n")
            .image(Buffer.from(completedImg.data), marginX + 300, startY + 260, { fit: [200, 200], align: "center" })
    }

    // doc.text("\n\n\n", marginX)
    // doc.text("\n", marginX, startY + 450)
    // if (doc.y > 550) doc.addPage();
    doc.addPage();

    (async function createTable() {
        // Table
        const table = { 
            title: {label: 'Request History', fontSize: 10, font: 'Times-Roman'},
            headers: [
                {label: "Status", width: 50}, 
                {label: "Remarks", width: 148}, 
                {label: "Date", width: 148}, 
                {label: "Role", width: 50},  
                {label: "Action By", width: 100}, 
            ],
            rows: historyArr,
            };

        await doc.table(table, {
            prepareHeader: () => doc.font("Times-Bold").fontSize(10),
            prepareRow: (row, indexColumn, indexRow, rectRow, rectCell) => {
                doc.font("Times-Roman").fontSize(8);
                // indexColumn === 0 && doc.addBackground(rectRow, 'blue', 0.15);
            },
        });

    })();

    // EOF
    doc.end();
    let docData = await getStream.buffer(doc);
    return docData;
};

function sendRequestPDF(req, res, next) {
    generateRequestPDF(req.params.request_id).then((result) => {
        if(result === null)
                return res.status(400).send();

            res.set({
                'Content-Type': 'application/pdf',
                'Content-Length': result.len,
            })
            return res.status(200).send(result);
    }).catch(err => {
        console.log(err)
        return res.status(500).json("Error in generating PDF")
    })
}

// // Send a checklist pdf
// function sendChecklistPDF(req, res, next) {
//     generateChecklistPDF(req.params.userId, req.params.checklistId, req.params.cType).then(
//         result => {
//             if(result === null)
//                 return res.status(400).send();

//             res.set({
//                 'Content-Type': 'application/pdf',
//                 'Content-Length': result.len,
//             })
//             return res.status(200).send(result);
//         }
//     ).catch(err => {
//         return res.status(500).json("Error in generating PDF")
//     })
// }

module.exports = { 
    // generateChecklistPDF,
    // sendChecklistPDF,
    generateRequestPDF,
    sendRequestPDF
};
