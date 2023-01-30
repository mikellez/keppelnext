const express = require("express");
const next = require("next");
const bodyParser = require("body-parser");
const multer = require("multer");
const passport = require("passport");
const session = require("express-session");

const userAuth = require("./userAuth");

const controllers = require("./controllers");

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

const HOMEPAGE = "/QRCode";


app.prepare().then(() => {
  const server = express();
  const upload = multer();
  server.use(bodyParser.json());
  userAuth(server);

  // Prevent cache in browsers
  server.use(function (req, res, next) {
    res.set('Cache-control', 'no-cache, no-store');
    next();
  });
  

  // ROUTES

  // checkIfLoggdeIn      - auth failures redirect to /Login page. use this for front facing page routes
  // vs
  // checkIfLoggedInAPI   - auth failures send 401 requrest. use this for API routes

  function checkIfLoggedIn(req, res, next) {
    console.log("check");
    if (req.user === undefined) return res.redirect("/Login");
    next();
  }

  function checkIfLoggedInAPI(req, res, next) {
    if (req.user === undefined) return res.status(401).json("you are not logged in");
    next();
  }

  // -----------------------------------

  server.post("/api/login", passport.authenticate("local", {}), (req, res) => {
    return res.status(200).json("success");
  });

  server.post("/api/logout", (req, res) => {
    if (req.user === undefined) return res.status(400).json("you are not logged in");

    req.logout((err) => {
      if (err) return res.status(500).send(err);
      return res.status(200).send();
    });
  });

  server.get("/api/user", checkIfLoggedInAPI, (req, res) => {
    res.status(200).json(
      {
        id:req.user.id,
        name:req.user.name,
        role_id: req.user.role_id,
        role_name:req.user.role_name
      }
    );
  });

  server.get("/api/request/", checkIfLoggedInAPI, controllers.request.fetchRequests);
  server.post("/api/request/", checkIfLoggedInAPI, upload.single("image"), controllers.request.createRequest);
  server.get("/api/request/types", checkIfLoggedInAPI, controllers.request.fetchRequestTypes);

  server.get("/api/fault/types", checkIfLoggedInAPI, controllers.fault.fetchFaultTypes);

  server.get("/api/asset/:plant_id", checkIfLoggedInAPI, controllers.asset.getAssetsFromPlant);
  
  server.get("/api/schedule/:plant_id", checkIfLoggedInAPI, controllers.schedule.getViewSchedules);
  server.get("/api/getPlants", checkIfLoggedInAPI, controllers.schedule.getPlants);
  server.get("/api/getUserPlants", checkIfLoggedInAPI, controllers.schedule.getUserPlants);

  // NO API ROUTE
  server.all("/api/*", (req, res) => {
    return res.status(404).send("no route");
  });

  // HOME PAGE
  server.get("/", (req, res) => {
    if (req.user === undefined) return res.redirect("/Login");
    return res.redirect(HOMEPAGE);
  });

  // ---- NEXT JS ----

  server.get("/Login", (req, res) => {
    if (req.user !== undefined) return res.redirect(HOMEPAGE);
    return handle(req, res);
  });

  server.get("/Dashboard*", checkIfLoggedIn,  (req, res) => { return handle(req, res); });
  server.get("/Request*", checkIfLoggedIn,    (req, res) => { return handle(req, res); });
  server.get("/Asset*", checkIfLoggedIn,      (req, res) => { return handle(req, res); });
  server.get("/Schedule*", checkIfLoggedIn,   (req, res) => { return handle(req, res); });
  server.get("/Checklist*", checkIfLoggedIn,  (req, res) => { return handle(req, res); });
  server.get("/Logbook*", checkIfLoggedIn,    (req, res) => { return handle(req, res); });
  server.get("/QRCode*", checkIfLoggedIn,     (req, res) => { return handle(req, res); });
  server.get("/Workflow*", checkIfLoggedIn,   (req, res) => { return handle(req, res); });
  server.get("/Master*", checkIfLoggedIn,     (req, res) => { return handle(req, res); });

  server.get("*", (req, res) => {
    return handle(req, res);
  });

  server.listen(3001, () => {
    console.log("Ready on http://localhost:3001");
  });
});
