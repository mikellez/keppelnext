const express = require("express");
const next = require("next");
const bodyParser = require("body-parser");
const userAuth = require("./userAuth");
const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

const HOMEPAGE = "/QRCode";

app.prepare().then(() => {
    const server = express();
    server.use(bodyParser.json());
    server.use(bodyParser.urlencoded({ extended: false }));
    userAuth(server);

    // Prevent cache in browsers
    server.use(function (req, res, next) {
        res.set("Cache-control", "no-cache, no-store");
        next();
    });

    // ROUTES

    // checkIfLoggdeIn      - auth failures redirect to /Login page. use this for front facing page routes

    function checkIfLoggedIn(req, res, next) {
        console.log("check");
        if (req.user === undefined) return res.redirect("/Login");
        next();
    }

    // Server side access control
    const restrictEng = ["/Schedule/Manage"];
    const restrictOps = ["/Schedule/Create", "/Schedule/Manage"];
    function accessControl(req, res, next) {
        if (req.user) {
            if (req.user.role_id == 3 && restrictEng.includes(req.path)) {
                res.redirect("/404");
            } else if (
                req.user.role_id == 4 &&
                (restrictOps.includes(req.path) || req.path.startsWith("/Schedule/Timeline"))
            ) {
                res.redirect("/404");
            }
        }
        next();
    }

    // -----------------------------------

    server.use("/api", require("./routes"))

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

    // these two routes are to prevent static pages from being directly accessible
    // this is more of a bandaid solution but whatever >w<
    //--------------------------
    server.all("/_next/static/chunks/pages/(\\_app|Login|404|500)*", (req, res) => {
        return handle(req, res);
    });

    server.all("/_next/static/chunks/pages/*", (req, res) => {
        if (req.user === undefined) return res.redirect("/Login");
        return handle(req, res);
    });
    // --------------------------

    server.get("/Dashboard*", checkIfLoggedIn, accessControl, (req, res) => {
        return handle(req, res);
    });
    server.get("/Request*", checkIfLoggedIn, accessControl, (req, res) => {
        return handle(req, res);
    });
    server.get("/Asset*", checkIfLoggedIn, accessControl, (req, res) => {
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

    server.get("*", (req, res) => {
        return handle(req, res);
    });

    server.listen(3001, () => {
        console.log("Ready on http://localhost:3001");
    });
});
