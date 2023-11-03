require("dotenv").config();
const express = require("express");
const cors = require("cors");
const next = require("next");
const bodyParser = require("body-parser");
const userAuth = require("./userAuth");
const cron = require("node-cron");
const axios = require("axios");
const { dbConnection } = require("./db/dbAPI");
const checklistGenerator = require("./services/checklistGenerator");
const controllers = require("./controllers");
const { apiLimiter, loginLimiter } = require("./rateLimiter");
const { access } = require("fs");
const morgan = require('morgan');
const helmet = require('helmet');
const licenseCron = require("./services/licenseCron");
const workflowCron = require("./services/workflowCron");
const feedbackCron = require("./services/feedbackCron");
const requestCron = require("./services/requestCron");
const checklistCron = require("./services/checklistCron");
const https = require('https');
const fs = require('fs');
const path = require('path');

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();



// const HOMEPAGE = "/Dashboard";

app.prepare().then(() => {
  const server = express();
  //server.use(helmet());
  server.use(
    cors({
      origin: `${process.env.API_BASE_URL}`,
      credentials: true,
    })
  );
  server.use(bodyParser.json({ limit: "50mb", extended: true }));
  // server.use(morgan('combined'));
  server.use(
    bodyParser.urlencoded({
      limit: "50mb",
      extended: true,
      parameterLimit: 50000,
    })
  );
  server.use(bodyParser.text({ limit: "200mb" }));
  server.use(dbConnection);
  userAuth(server);
  /*server.use(function(req, res, next) {
    res.set({ 'Content-Security-Policy': "script-src 'self' 'unsafe-eval'" });
    next();
  });*/
  server.use("/api/login", loginLimiter);
  server.use("/api/*", apiLimiter);

  // Prevent cache in browsers
  server.use(function (req, res, next) {
    res.set("Cache-control", "no-cache, no-store");
    next();
  });

  // ROUTES

  // checkIfLoggdeIn      - auth failures redirect to /Login page. use this for front facing page routes

  function checkIfLoggedIn(req, res, next) {
    if (req.user === undefined) return res.redirect("/Login");
    next();
  }

  const restrictEng = [
    "/Schedule/Manage",
    "/Dashboard/Manager",
    "/User/Management",
    "/User/Add",
  ];
  const restrictOps = [
    "/Schedule/Create",
    "/Schedule/Manage",
    "/Asset/New",
    "/Dashboard/Engineer",
    "/Dashboard/Manager",
    "/User/Management",
    "/User/Add",
  ];
  const restrictManager = ["/Dashboard/Engineer", "/Dashboard/Specialist"];

  function accessControl(req, res, next) {

    const paths = [
      // Request
      { path: "/Request/View", permission: "canViewRequestTicket" },
      { path: "/Request/New", permission: "canCreateRequestTicket" },
      { path: "/Request/Assign", permission: "canAssignRequestTicket" },
      { path: "/Request/Manage", permission: "canManageRequestTicket" },
      { path: "/Request/CorrectiveRequest", permission: "canCreateCorrectiveRequestTicket" },
      { path: "/Request/Complete", permission: "canCompleteRequestTicket" },
      // Checklist
      { path: "/Checklist/View", permission: "canViewChecklist" },
      { path: "/Checklist/Manage", permission: "canManageChecklist" },
      { path: "/Checklist/Form", permission: "canAssignChecklist" },
      { path: "/Checklist/Complete", permission: "canCompleteChecklist" },
      // Asset
      { path: "/Asset/New", permission: "canCreateAsset" },
      { path: "/Asset/Edit", permission: "canEditAsset" },
      { path: "/Asset/Details", permission: "canViewAsset" },
      //Logbook
      { path: "/Logbook", permission: "canViewLogbookEntry" },
      // Feedback
      { path: "/Feedback", permission: "canViewFeedback" },
      // License
      { path: "/License/New", permission: "canCreateLicense"},
      { path: "/License/Acquire", permission: "canAcquireLicense"},
      { path: "/License/Edit", permission: "canEditLicense"},
      { path: "/License/Renew", permission: "canRenewLicense"},
      { path: "/License/View", permission: "canViewLicense"},
      // Workflow
      { path: "/Workflow/New", permission: "canCreateWorkflow"},
      // Master
      { path: "/Master/New", permission: "canCreateMaster"},
      { path: "/Master/Edit", permission: "canEditMaster"},
      // User
      { path: "/User/Add", permission: "canCreateUserManagement"},
      { path: "/User/Edit", permission: "canEditUserManagement"},
      { path: "/User/Management", permission: "canViewUserManagement"},

    ];

    if (req.user) {
      for (const path of paths) {
        if (req.path.startsWith(path.path)) {
          if (!req.user.permissions.includes(path.permission)) {
            return res.redirect("/403");
          }
        }
      }
      /*if (
        req.user.role_id == 3 &&
        (restrictEng.includes(req.path) || req.path.startsWith("/User/Edit"))
      ) {
        res.redirect("/403");
      } else if (
        req.user.permissions.includes("specialist") &&
        (restrictOps.includes(req.path) ||
          req.path.startsWith("/Schedule/Timeline") ||
          req.path.startsWith("/Asset/Edit") ||
          req.path.startsWith("/Request/Assign") ||
          req.path.startsWith("/Request/Manage") ||
          req.path.startsWith("/Checklist/Manage") ||
          req.path.startsWith("/User/Edit"))
      ) {
        res.redirect("/403");
      } else if ((req.user.permissions.includes("manager") && restrictManager.includes(req.path))) {
        res.redirect("/403");
      }*/
    }
    next();
  }

  // -----------------------------------

  server.use("/api", require("./routes"));

  // HOME PAGE
  server.get("/", (req, res) => {
    if (req.user === undefined) return res.redirect("/Login");
    return res.redirect("/Dashboard");
  });

  // ---- NEXT JS ----

  server.get("/Login", (req, res) => {
    if (req.user !== undefined) return res.redirect("/Dashboard");
    return handle(req, res);
  });

  // these two routes are to prevent static pages from being directly accessible
  // this is more of a bandaid solution but whatever >w<
  //--------------------------
  server.all(
    "/_next/static/chunks/pages/(\\_app|Login|404|500|403|Guest)*",
    (req, res) => {
      return handle(req, res);
    }
  );

  server.all("/_next/static/chunks/pages/*", (req, res) => {
    if (req.user === undefined) return res.redirect("/Login");
    return handle(req, res);
  });
  // --------------------------

  server.get("/Dashboard*", checkIfLoggedIn, accessControl, (req, res) => {
    return handle(req, res);
  });

  server.get("/Activity*", checkIfLoggedIn, accessControl, (req, res) => {
    return handle(req, res);
  });
  server.get("/Request*", checkIfLoggedIn, accessControl, (req, res) => {
    return handle(req, res);
  });
  server.get("/Asset*", checkIfLoggedIn, accessControl, (req, res) => {
    return handle(req, res);
  });
  server.get("/ChangeOfParts*", checkIfLoggedIn, accessControl, (req, res) => {
    return handle(req, res);
  });
  server.get("/Schedule*", checkIfLoggedIn, accessControl, (req, res) => {
    return handle(req, res);
  });
  server.get("/Checklist*", checkIfLoggedIn, accessControl, (req, res) => {
    return handle(req, res);
  });
  server.get("/Logbook*", checkIfLoggedIn, accessControl, (req, res) => {
    return handle(req, res);
  });
  server.get("/QRCode*", checkIfLoggedIn, accessControl, (req, res) => {
    return handle(req, res);
  });
  server.get("/Workflow*", checkIfLoggedIn, accessControl, (req, res) => {
    return handle(req, res);
  });
  server.get("/Master*", checkIfLoggedIn, accessControl, (req, res) => {
    return handle(req, res);
  });
  server.get("/User*", checkIfLoggedIn, accessControl, (req, res) => {
    return handle(req, res);
  });
  server.get("/Guest*", (req, res) => {
    return handle(req, res);
  });
  server.get("/Feedback*", checkIfLoggedIn, accessControl, (req, res) => {
    return handle(req, res);
  });

  server.get("/License*", checkIfLoggedIn, accessControl, (req, res) => {
    return handle(req, res);
  });
  server.get("*", (req, res) => {
    return handle(req, res);
  });

  let s = server;

  if(!!process.env.ENABLE_HTTPS) {
    const privateKey = fs.readFileSync(path.join(__dirname,'/openssl/domain.key'));
    const certificate = fs.readFileSync(path.join(__dirname,'/openssl/domain.crt'));
    const credentials = { key: privateKey, cert: certificate };

    const httpsServer = https.createServer(credentials, server);
    s = httpsServer;
  }

  s.listen(process.env.PORT, () => {
    console.log(`Ready on Port ${process.env.PORT}`);
  });

  workflowCron.start();
  feedbackCron.start();
  licenseCron.start();
  requestCron.start();
  checklistCron.start();


  checklistGenerator.start();
});
