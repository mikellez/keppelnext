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

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

// const HOMEPAGE = "/Dashboard";

app.prepare().then(() => {
  const server = express();
  server.use(
    cors({
      origin: "http://localhost:3001",
      credentials: true,
    })
  );
  server.use(bodyParser.json({ limit: "50mb", extended: true }));
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
    if (req.user) {
      if (
        req.user.role_id == 3 &&
        (restrictEng.includes(req.path) || req.path.startsWith("/User/Edit"))
      ) {
        res.redirect("/403");
      } else if (
        req.user.role_id == 4 &&
        (restrictOps.includes(req.path) ||
          req.path.startsWith("/Schedule/Timeline") ||
          req.path.startsWith("/Asset/Edit") ||
          req.path.startsWith("/Request/Assign") ||
          req.path.startsWith("/Request/Manage") ||
          req.path.startsWith("/Checklist/Manage") ||
          req.path.startsWith("/User/Edit"))
      ) {
        res.redirect("/403");
      } else if ((req.user.role_id = 2 && restrictManager.includes(req.path))) {
        res.redirect("/403");
      }
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
  server.get("*", (req, res) => {
    return handle(req, res);
  });

  server.listen(process.env.PORT, () => {
    console.log(`Ready on Port ${process.env.PORT}`);
  });

  var task = cron.schedule(
    "* * * * *",
    async () => {
      // console.log("trigger task");

      // run workflow task - auto assign user
      await axios
        .get("http://localhost:3001/api/workflow/run/assign")
        .catch((err) => {
          console.log(err.response);
          console.log("Unable to run workflow task - assign user");
        });

      // run workflow task - auto send email
      await axios
        .get("http://localhost:3001/api/workflow/run/email")
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

  task.start();

  checklistGenerator.start();
});
