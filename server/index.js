const express = require("express");
const next = require("next");
const bodyParser = require("body-parser");
const db = require("../db");
const passport = require("passport");
const session = require("express-session");

const userAuth = require("./userAuth");

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

const HOMEPAGE = "/QRCode";

app.prepare().then(() => {
  const server = express();
  server.use(bodyParser.json());
  userAuth(server);

  // ROUTES

  function checkIfLoggedIn(req, res, next) {
    console.log("check");
    if (req.user === undefined) return res.redirect("/Login");
    next();
  }

  server.post("/api/login", passport.authenticate("local", {}), (req, res) => {
    return res.status(200).send("success");
  });

  server.post("/api/logout", (req, res) => {
    if (req.user === undefined) return res.status(400).send("you are not logged in");

    req.logout((err) => {
      if (err) return res.status(500).send(err);
      return res.status(200).send();
    });
  });

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

  server.get("/Request*", checkIfLoggedIn, (req, res) => {
    return handle(req, res);
  });

  server.get("/Asset*", checkIfLoggedIn, (req, res) => {
    return handle(req, res);
  });

  server.get("/Schedule*", checkIfLoggedIn, (req, res) => {
    return handle(req, res);
  });

  server.get("/Checklist*", checkIfLoggedIn, (req, res) => {
    return handle(req, res);
  });

  server.get("/Logbook*", checkIfLoggedIn, (req, res) => {
    return handle(req, res);
  });

  server.get("/QRCode*", checkIfLoggedIn, (req, res) => {
    return handle(req, res);
  });

  server.get("/Workflow*", checkIfLoggedIn, (req, res) => {
    return handle(req, res);
  });

  server.get("/Master*", checkIfLoggedIn, (req, res) => {
    return handle(req, res);
  });

  server.get("*", (req, res) => {
    return handle(req, res);
  });

  server.listen(3001, () => {
    console.log("Ready on http://localhost:3001");
  });
});
