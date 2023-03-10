const passport = require("passport");
const controllers = require("./controllers");
const session = require("express-session");
const multer = require("multer");

const express = require('express');

const router = express.Router();

// checkIfLoggedInAPI   - auth failures send 401 requrest. use this for API routes
function checkIfLoggedInAPI(req, res, next) {
    if (req.user === undefined) return res.status(401).json("you are not logged in");
    next();
}

const upload = multer();

/**
 * @apiDefine SuccessCMMSUser
 * @apiSuccess {string} id User ID
 * @apiSuccess {string} name User's full name
 * @apiSuccess {string} role_id User's role ID
 * @apiSuccess {string} role_name User's role name
 */

/**
 * @apiDefine ErrorCMMSUnauthorised
 * @apiError (401) {string} errormsg Unauthorised
 */

/**
 * @api {post} /login Log In
 * @apiDescription Logs in user with credentials
 * @apiName Login
 * @apiGroup User
 * @apiBody {string} username User's username to login
 * @apiBody {string} password User's password to login
 * 
 * @apiUse SuccessCMMSUser
 */
router.post("/login", passport.authenticate("local", {}), (req, res) => {
    return res.status(200).json("success");
});

/**
 * @api {post} /logout Log out
 * @apiDescription Logs out currently logged in user.
 * This is the only route that can be accessed without any authentication
 * 
 * @apiName Logout
 * @apiGroup User
 * 
 * @apiSuccess {string} - "success"
 */
router.post("/logout", (req, res) => {
    if (req.user === undefined) return res.status(400).json({errormsg: "you are not logged in"});

    req.logout((err) => {
        if (err) return res.status(500).json({errormsg: err});
        return res.status(200).json("success");
    });
});

/**
 * @api {post} /user Get Current User
 * @apiDescription Gets information about the currently logged in user
 * @apiName User
 * @apiGroup User
 * 
 * @apiUse SuccessCMMSUser
 * 
 */
router.get("/user", checkIfLoggedInAPI, (req, res) => {
    res.status(200).json({
        id: req.user.id,
        name: req.user.name,
        role_id: req.user.role_id,
        role_name: req.user.role_name,
    });
});

/**
 * @api {get} /request Get All Requests
 * @apiDescription Gets all requests
 * @apiName GetAllRequests
 * @apiGroup Request
 * 
 * @apiSuccess {Object[]} - Array of all requests, sorted by creation date
 * @apiSuccess {number} -.request_id Request ID
 * @apiSuccess {string} -.fault_name Type of the fault request
 * @apiSuccess {string} -.plant_name Name of the request plant
 * @apiSuccess {number} -.plant_id ID of the request plant
 * @apiSuccess {string} -.request_type Type of request
 * @apiSuccess {string} -.role_name Name of the role name ??
 * @apiSuccess {string} -.status Current request status
 * @apiSuccess {string} -.fault_description Description of fault request
 * @apiSuccess {string|null} -.priority Priority of fault request
 * @apiSuccess {string} -.fullname Full name of request creator
 * @apiSuccess {string} -.created_date Date and time of request creation
 * @apiSuccess {string} -.asset_name Name of asset linked to the specified request
 * @apiSuccess {string|null} -.uploadfilemimetype MIME-Type of uploaded fault request file
 * @apiSuccess {string|null} -.complete_comments Completion comments of fault request
 * @apiSuccess {string|null} -.assigned_user_name User name assigned to fault request
 * @apiSuccess {string|null} -.associated_request_id Request ID of fault request for corrective requests
 * @apiSuccess {string} -.requesthistory Request history
 * @apiSuccess {string|null} -.rejection_comments Rejection comments of fault request
 */
router.get("/request/", checkIfLoggedInAPI, controllers.request.fetchRequests);

/**
 * @api {post} /request Create Request
 * @apiDescription Creates a request
 * @apiName CreateRequest
 * @apiGroup Request
 * 
 * @apiBody {number} requestTypeID ID of the request type
 * @apiBody {number} faultTypeID ID of the fault type
 * @apiBody {number} plantLocationID ID of the plant location
 * @apiBody {number} taggedAssetID ID of the asset that is being reported on
 * @apiBody {string} description Description of the created request
 * @apiBody {Object} [image] Image of the asset that is being reported on
 * 
 * @apiSuccess {string} - "success"
 */
router.post("/request/", checkIfLoggedInAPI, upload.single("image"), controllers.request.createRequest);

/**
 * @api {get} /request/type Get Request Types
 * @apiDescription Gets request types
 * @apiName GetRequestTypes
 * @apiGroup Request
 * 
 * @apiSuccess {Object[]} - Array containing the different request types and their corresponding ID
 * @apiSuccess {number} -.req_id ID of the request type
 * @apiSuccess {string} -.request Name of the request type
 */
router.get("/request/types", checkIfLoggedInAPI, controllers.request.fetchRequestTypes);
router.get("/request/status/:plant", checkIfLoggedInAPI, controllers.request.fetchRequestStatus);

router.get("/checklist/template", checkIfLoggedInAPI, controllers.checklist.fetchTemplateChecklists);
router.get("/checklist/record", checkIfLoggedInAPI, controllers.checklist.fetchForReviewChecklists);
router.get("/checklist/approved", checkIfLoggedInAPI, controllers.checklist.fetchApprovedChecklists);

router.get(
    "/checklist/templateNames",
    checkIfLoggedInAPI,
    controllers.checklist.fetchChecklistTemplateNames
);

router.get("/checklist/status/:plant", checkIfLoggedInAPI, controllers.checklist.fetchChecklistStatus);

/**
 * @api {get} /fault/type Get Fault Types
 * @apiDescription Gets fault types
 * @apiName GetFaultTypes
 * @apiGroup Fault
 * 
 * @apiSuccess {Object[]} - Array containing the different fault types and their corresponding ID
 * @apiSuccess {number} -.fault_id ID of the fault type
 * @apiSuccess {string} -.fault_type Name of the fault type
 */
router.get("/fault/types", checkIfLoggedInAPI, controllers.fault.fetchFaultTypes);

router.get("/asset/:plant_id", checkIfLoggedInAPI, controllers.asset.getAssetsFromPlant);
router.get("/asset", checkIfLoggedInAPI, controllers.asset.getAssetHierarchy);
router.get("/assetDetails/:psa_id", checkIfLoggedInAPI, controllers.asset.getAssetDetails);
router.get("/asset/history/:type/:id", checkIfLoggedInAPI, controllers.asset.getAssetHistory);

/**
 * @api {get} /master/new Get Table Metadata
 * @apiDescription Gets table information/metadata. Mainly used for the creation of new entries in those tables
 * @apiName GetMasterTypeEntry
 * @apiGroup Master
 * 
 * @apiSuccess {Object[]}  Array containing the different request types and their corresponding ID
 * @apiSuccess {number} -.req_id ID of the request type
 * @apiSuccess {string} -.request Name of the request type
 */
router.get("/master/new", checkIfLoggedInAPI, controllers.master.fetchMasterTypeEntry);
router.post("/master/new", checkIfLoggedInAPI, controllers.master.createMasterTypeEntry);
router.get("/master/:type", checkIfLoggedInAPI, controllers.master.fetchMasterInfo);
router.get("/master/:type/:id", checkIfLoggedInAPI, controllers.master.fetchMasterTypeSingle);
router.post("/master/:type/:id", checkIfLoggedInAPI, controllers.master.updateMasterTypeSingle);
router.delete(
    "/master/:type/:id",
    checkIfLoggedInAPI,
    controllers.master.deleteMasterTypeSingle
);

router.get("/getPlants", checkIfLoggedInAPI, controllers.schedule.getPlants);
router.get("/getUserPlants", checkIfLoggedInAPI, controllers.schedule.getUserPlants);
router
    .route("/timeline/:id?", checkIfLoggedInAPI)
    .get(controllers.schedule.getTimeline)
    .post(controllers.schedule.createTimeline)
    .patch(controllers.schedule.editTimeline)
    .delete(controllers.schedule.deleteTimeline);
router.route("/timeline/schedules/:id").get(controllers.schedule.getSchedulesTimeline);
router
    .route("/timeline/status/:status/:id?", checkIfLoggedInAPI)
    .get(controllers.schedule.getTimelineByStatus)
    .post(controllers.schedule.changeTimelineStatus);
router.get(
    "/getAssignedUsers/:plant_id",
    checkIfLoggedInAPI,
    controllers.schedule.getOpsAndEngineers
);
router.post("/insertSchedule", checkIfLoggedInAPI, controllers.schedule.insertSchedule);
router
    .route("/schedule/:id", checkIfLoggedInAPI)
    .delete(controllers.schedule.deleteSchedule)
    .get(controllers.schedule.getViewSchedules);

// NO API ROUTE
router.all("/*", (req, res) => {
    return res.status(404).send("no route");
});

module.exports = router;