const express = require("express");
const next = require("next");
const bodyParser = require("body-parser");
const multer = require("multer");
const passport = require("passport");
const session = require("express-session");

const userAuth = require("./userAuth");

const controllers = require("./controllers");
const { createTimeline } = require("./controllers/schedule");

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

const HOMEPAGE = "/QRCode";

app.prepare().then(() => {
    const server = express();
    const upload = multer();
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
        res.status(200).json({
            id: req.user.id,
            name: req.user.name,
            role_id: req.user.role_id,
            role_name: req.user.role_name,
        });
    });

    server.get("/api/request/", checkIfLoggedInAPI, controllers.request.fetchRequests);
    server.post(
        "/api/request/",
        checkIfLoggedInAPI,
        upload.single("image"),
        controllers.request.createRequest
    );
    server.get("/api/request/types", checkIfLoggedInAPI, controllers.request.fetchRequestTypes);

    server.get("/api/checklist/template", checkIfLoggedInAPI, controllers.checklist.fetchTemplateChecklists);
    server.get("/api/checklist/record", checkIfLoggedInAPI, controllers.checklist.fetchForReviewChecklists);
    server.get("/api/checklist/approved", checkIfLoggedInAPI, controllers.checklist.fetchApprovedChecklists);
    
    server.get(
        "/api/checklist/templateNames",
        checkIfLoggedInAPI,
        controllers.checklist.fetchChecklistTemplateNames
    );

    server.get("/api/fault/types", checkIfLoggedInAPI, controllers.fault.fetchFaultTypes);

    server.get("/api/asset/:plant_id", checkIfLoggedInAPI, controllers.asset.getAssetsFromPlant);
    server.get("/api/asset", checkIfLoggedInAPI, controllers.asset.getAssetHierarchy);
    server.get("/api/assetDetails/:psa_id", checkIfLoggedInAPI, controllers.asset.getAssetDetails);
    server.get("/api/asset/history/:type/:id", checkIfLoggedInAPI, controllers.asset.getAssetHistory);

    server.get("/api/master/new", checkIfLoggedInAPI, controllers.master.fetchMasterTypeEntry);
    server.post("/api/master/new", checkIfLoggedInAPI, controllers.master.createMasterTypeEntry);
    server.get("/api/master/:type", checkIfLoggedInAPI, controllers.master.fetchMasterInfo);
    server.get("/api/master/:type/:id", checkIfLoggedInAPI, controllers.master.fetchMasterTypeSingle);
    server.post("/api/master/:type/:id", checkIfLoggedInAPI, controllers.master.updateMasterTypeSingle);
    server.delete(
        "/api/master/:type/:id",
        checkIfLoggedInAPI,
        controllers.master.deleteMasterTypeSingle
    );

    server.get("/api/getPlants", checkIfLoggedInAPI, controllers.schedule.getPlants);
    server.get("/api/getUserPlants", checkIfLoggedInAPI, controllers.schedule.getUserPlants);
    server
        .route("/api/timeline/:id?", checkIfLoggedInAPI)
        .get(controllers.schedule.getTimeline)
        .post(controllers.schedule.createTimeline)
        .patch(controllers.schedule.editTimeline)
        .delete(controllers.schedule.deleteTimeline);
    server.route("/api/timeline/schedules/:id").get(controllers.schedule.getSchedulesTimeline);
    server
        .route("/api/timeline/status/:status/:id?", checkIfLoggedInAPI)
        .get(controllers.schedule.getTimelineByStatus)
        .post(controllers.schedule.changeTimelineStatus);
    server.get(
        "/api/getAssignedUsers/:plant_id",
        checkIfLoggedInAPI,
        controllers.schedule.getOpsAndEngineers
    );
    server.post("/api/insertSchedule", checkIfLoggedInAPI, controllers.schedule.insertSchedule);
    server
        .route("/api/schedule/:id", checkIfLoggedInAPI)
        .delete(controllers.schedule.deleteSchedule)
        .get(controllers.schedule.getViewSchedules);

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
