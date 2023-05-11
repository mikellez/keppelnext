const passport = require("passport");
const controllers = require("./controllers");
const session = require("express-session");
const multer = require("multer");

const express = require("express");

const router = express.Router();
const { sendRequestPDF, sendChecklistPDF } = require("./pdfGenerator");

// checkIfLoggedInAPI   - auth failures send 401 requrest. use this for API routes
function checkIfLoggedInAPI(req, res, next) {
  if (req.user === undefined)
    return res.status(401).json("you are not logged in");
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
  if (req.user === undefined)
    return res.status(400).json({ errormsg: "you are not logged in" });

  req.logout((err) => {
    if (err) return res.status(500).json({ errormsg: err });
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
    allocated_plants: req.user.allocated_plants,
    employee_id: req.user.employee_id,
    email: req.user.email,
    username: req.user.username,
    first_name: req.user.first_name,
    last_name: req.user.last_name,
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
router.get(
  "/request/pending",
  checkIfLoggedInAPI,
  controllers.request.fetchPendingRequests
);
router.get(
  "/request/assigned",
  checkIfLoggedInAPI,
  controllers.request.fetchAssignedRequests
);
router.get(
  "/request/review",
  checkIfLoggedInAPI,
  controllers.request.fetchReviewRequests
);
router.get(
  "/request/approved",
  checkIfLoggedInAPI,
  controllers.request.fetchApprovedRequests
);

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
router.post(
  "/request/",
  upload.single("image"),
  controllers.request.createRequest
);

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
router.get("/request/types", controllers.request.fetchRequestTypes);
// router.get("/request/status/:plant", checkIfLoggedInAPI, controllers.request.fetchRequestStatus);
router.get(
  "/request/priority",
  checkIfLoggedInAPI,
  controllers.request.fetchRequestPriority
);
router.get(
  "/request/csv",
  checkIfLoggedInAPI,
  controllers.request.createRequestCSV
);
router.get("/request/pdf/:request_id", checkIfLoggedInAPI, sendRequestPDF);
router.patch(
  "/request/complete/:request_id",
  checkIfLoggedInAPI,
  upload.single("completion_file"),
  controllers.request.completeRequest
);
router
  .route("/request/:request_id", checkIfLoggedInAPI)
  .get(controllers.request.fetchSpecificRequest)
  .patch(controllers.request.updateRequest);

router.patch(
  "/request/:request_id/:status_id",
  checkIfLoggedInAPI,
  controllers.request.approveRejectRequest
);
router.get(
  "/request/counts/:field/:plant/:datetype/:date",
  checkIfLoggedInAPI,
  controllers.request.fetchRequestCounts
);
router.get(
  "/request/filter/:status/:plant/:datetype/:date",
  checkIfLoggedInAPI,
  controllers.request.fetchFilteredRequests
);
router.get(
  "/request/filter/:status/:plant/:datetype/:date/:page",
  checkIfLoggedInAPI,
  controllers.request.fetchFilteredRequests
);

router.get(
  "/asset/systems",
  checkIfLoggedInAPI,
  controllers.asset.fetchSystems
);
router.get(
  "/asset/fetch_asset_types",
  checkIfLoggedInAPI,
  controllers.asset.fetch_asset_types
);
router.post(
  "/asset/addNewAsset",
  checkIfLoggedInAPI,
  controllers.asset.addNewAsset
);
router.post(
  "/asset/editAsset",
  checkIfLoggedInAPI,
  controllers.asset.editAsset
);
router.post(
  "/asset/deleteAsset",
  checkIfLoggedInAPI,
  controllers.asset.deleteAsset
);

router.get(
  "/asset/system/:system_id",
  checkIfLoggedInAPI,
  controllers.asset.fetchSystemAssets
);
router.get(
  "/asset/system/:plant_id/:system_id/:system_asset_id",
  checkIfLoggedInAPI,
  controllers.asset.fetchSystemAssetNames
);
router.get(
  "/asset/system/:plant_id/:system_id/:system_asset_id/:system_asset_name_id",
  checkIfLoggedInAPI,
  controllers.asset.fetchSubComponent1Names
);

router.get(
  "/asset/history/:psa_Id",
  checkIfLoggedInAPI,
  controllers.asset.fetchAssetHistory
);

router.get(
  "/asset/mobile/:plant_id",
  checkIfLoggedInAPI,
  controllers.asset.getSystemsFromPlant
);

router.get(
  "/asset/mobile/:plant_id/:system_id",
  checkIfLoggedInAPI,
  controllers.asset.getSystemAssetsFromPlant
);

router.get(
  "/asset/mobile/:plant_id/:system_id/:system_asset_id",
  checkIfLoggedInAPI,
  controllers.asset.getSystemAssetNamesFromPlant
);

router.get(
  "/asset/mobile/:plant_id/:system_id/:system_asset_id/:system_asset_name",
  checkIfLoggedInAPI,
  controllers.asset.getSubComponentsFromPlant
);

router
  .route("/checklist/template/:checklist_id?", checkIfLoggedInAPI)
  .get(controllers.checklist.fetchSpecificChecklistTemplate)
  .post(controllers.checklist.createNewChecklistTemplate)
  .delete(controllers.checklist.deleteChecklistTemplate);

router
  .route("/checklist/template/:checklist_id?", checkIfLoggedInAPI)
  .get(controllers.checklist.fetchSpecificChecklistTemplate)
  .post(controllers.checklist.createNewChecklistTemplate)
  .delete(controllers.checklist.deleteChecklistTemplate);

router
  .route("/checklist/template/:checklist_id?", checkIfLoggedInAPI)
  .get(controllers.checklist.fetchSpecificChecklistTemplate)
  .post(controllers.checklist.createNewChecklistTemplate);

router
  .route("/checklist/assigned", checkIfLoggedInAPI)
  .get(controllers.checklist.fetchAssignedChecklists);

router
  .route("/checklist/record/:checklist_id?", checkIfLoggedInAPI)
  .get(controllers.checklist.fetchChecklistRecords)
  .post(controllers.checklist.createNewChecklistRecord)
  .patch(controllers.checklist.editChecklistRecord);

router.get(
  "/checklist/approved",
  checkIfLoggedInAPI,
  controllers.checklist.fetchApprovedChecklists
);

router.get(
  "/checklist/pending",
  checkIfLoggedInAPI,
  controllers.checklist.fetchPendingChecklists
);

router.get(
  "/checklist/templateNames/:id?",
  checkIfLoggedInAPI,
  controllers.checklist.fetchChecklistTemplateNames
);

router.get(
  "/checklist/counts/:field/:plant/:datetype/:date",
  checkIfLoggedInAPI,
  controllers.checklist.fetchChecklistCounts
);

router.patch(
  "/checklist/complete/:checklist_id",
  checkIfLoggedInAPI,
  controllers.checklist.updateChecklist("complete")
);
router.get(
  "/checklist/filter/:status/:plant/:datetype/:date",
  checkIfLoggedInAPI,
  controllers.checklist.fetchFilteredChecklists
);
router.get(
  "/checklist/filter/:status/:plant/:datetype/:date/:page",
  checkIfLoggedInAPI,
  controllers.checklist.fetchFilteredChecklists
);

router.patch(
  "/checklist/approve/:checklist_id",
  checkIfLoggedInAPI,
  controllers.checklist.updateChecklist("approve")
);

router.patch(
  "/checklist/reject/:checklist_id",
  checkIfLoggedInAPI,
  controllers.checklist.updateChecklist("reject")
);

router.get(
  "/checklist/pdf/:checklist_id",
  checkIfLoggedInAPI,
  sendChecklistPDF
);

router.get(
  "/checklist/csv",
  checkIfLoggedInAPI,
  controllers.checklist.createChecklistCSV
);

/**
 * @api {post} /checklist/template Create Checklist Template
 * @apiDescription Create a new checklist template for later submission as record
 * @apiName CreateChecklistTemplate
 * @apiGroup Checklist
 *
 * @apiSuccess {string} - yeah
 */

router.post(
  "/checklist/template",
  checkIfLoggedInAPI,
  controllers.checklist.submitNewChecklistTemplate
);

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
router.get("/fault/types", controllers.fault.fetchFaultTypes);

router.get("/asset/:plant_id", controllers.asset.getAssetsFromPlant);
router.get("/assets", controllers.asset.getAllAssets);
router.get("/asset", controllers.asset.getAssetHierarchy);
router.get("/assetDetails/:psa_id", controllers.asset.getAssetDetails);
router.get(
  "/asset/history/:type/:id",
  checkIfLoggedInAPI,
  controllers.asset.getAssetHistory
);
router.get(
  "/asset/Details/:psa_id",
  checkIfLoggedInAPI,
  controllers.asset.getAssetDetails
);

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
router.get(
  "/master/new",
  checkIfLoggedInAPI,
  controllers.master.fetchMasterTypeEntry
);
router.post(
  "/master/new/add",
  checkIfLoggedInAPI,
  controllers.master.createMasterTypeEntry
);
router.get(
  "/master/:type",
  checkIfLoggedInAPI,
  controllers.master.fetchMasterInfo
);
router.get(
  "/master/:type/:id",
  checkIfLoggedInAPI,
  controllers.master.fetchMasterTypeSingle
);
router.post(
  "/master/:type/:id",
  checkIfLoggedInAPI,
  controllers.master.updateMasterTypeSingle
);
router.delete(
  "/master/:type/:id",
  checkIfLoggedInAPI,
  controllers.master.deleteMasterTypeSingle
);

router.get("/plants", controllers.schedule.getPlants);
router.get("/plant/:id", controllers.schedule.getPlantById);

router.get("/getPlants", checkIfLoggedInAPI, controllers.schedule.getPlants);
router.get(
  "/getUserPlants",
  checkIfLoggedInAPI,
  controllers.schedule.getUserPlants
);
router
  .route("/timeline/:id?", checkIfLoggedInAPI)
  .get(controllers.schedule.getTimeline)
  .post(controllers.schedule.createTimeline)
  .patch(controllers.schedule.editTimeline)
  .delete(controllers.schedule.deleteTimeline);
router
  .route("/timeline/schedules/:id")
  .get(controllers.schedule.getSchedulesTimeline);
router
  .route("/timeline/status/:status/:id?", checkIfLoggedInAPI)
  .get(controllers.schedule.getTimelineByStatus)
  .post(controllers.schedule.changeTimelineStatus);
router.get(
  "/getAssignedUsers/:plant_id",
  checkIfLoggedInAPI,
  controllers.schedule.getOpsAndEngineers
);
router.post(
  "/insertSchedule",
  checkIfLoggedInAPI,
  controllers.schedule.insertSchedule
);
router.patch(
  "/updateSchedule",
  checkIfLoggedInAPI,
  controllers.schedule.updateSchedule
);
router
  .route("/schedule/:id", checkIfLoggedInAPI)
  .delete(controllers.schedule.deleteSchedule)
  .get(controllers.schedule.getViewSchedules);

router
  .route("/event/:schedule_id?/:index?/", checkIfLoggedInAPI)
  .get(controllers.schedule.getPendingSingleEvents)
  .post(controllers.schedule.createSingleEvent)
  .patch(controllers.schedule.manageSingleEvent)
  .delete();

router.get(
  "/schedule/event/:id",
  checkIfLoggedInAPI,
  controllers.schedule.getScheduleById
);

router.get(
  "/activity/account_log",
  checkIfLoggedInAPI,
  controllers.activity.getEventtHistory
);
router.get(
  "/activity/csv",
  checkIfLoggedInAPI,
  controllers.activity.createActivityCSV
);
router.get(
  "/activity/account_log/:type/:date",
  checkIfLoggedInAPI,
  controllers.activity.getEventtHistoryDate
);

router
  .route("/logbook", checkIfLoggedInAPI)
  .get(controllers.logbook.getLogbook)
  .post(controllers.logbook.addEntryToLogbook);

router
  .route("/changeOfParts/:cop_id?", checkIfLoggedInAPI)
  .get(controllers.changeOfParts.fetchChangeOfParts)
  .post(controllers.changeOfParts.createNewChangeOfParts)
  .patch(controllers.changeOfParts.editChangeOfParts);

router
  .get("/user/getUsers", checkIfLoggedInAPI, controllers.user.getUsers)
  .get("/user/getUsersCSV", checkIfLoggedInAPI, controllers.user.getUsersCSV)
  .post("/user/addUser", checkIfLoggedInAPI, controllers.user.addUser);
router.delete(
  "/user/deleteUser/:id",
  checkIfLoggedInAPI,
  controllers.user.deleteUser
);

router
  .post("/setting/update", checkIfLoggedInAPI, controllers.setting.updateUser)
  .post(
    "/setting/updatePassword",
    checkIfLoggedInAPI,
    controllers.setting.updatePassword
  );

// router.get("/user/getUser/:id", checkIfLoggedInAPI, controllers.setting.getUser);

// NO API ROUTE
router.all("/*", (req, res) => {
  return res.status(404).send("no route");
});

module.exports = router;
