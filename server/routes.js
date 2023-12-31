const passport = require("passport");
const controllers = require("./controllers");
const session = require("express-session");
const multer = require("multer");
const { fetchDBNames, dellocateGlobalDB } = require("./db/dbAPI");

const express = require("express");

const router = express.Router();
const { sendRequestPDF, sendChecklistPDF, sendAllChecklistsPDF } = require("./pdfGenerator");


// checkIfLoggedInAPI   - auth failures send 401 requrest. use this for API routes
function checkIfLoggedInAPI(req, res, next) {
  if (req.user === undefined)
    return res.status(401).json("you are not logged in");
  next();
}

function checkIfAdmin(req, res, next) {
  // If not admin, then reject
  if (req.user.role_id != 1) return res.status(401).json("you are not admin");
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
  dellocateGlobalDB();

  if (req.user === undefined)
    return res.status(400).json({ errormsg: "you are not logged in" });

  req.logout((err) => {
    if (err) return res.status(500).json({ errormsg: err });
    return res.status(200).json("success");
  });
});

router.post("/admin/impersonate/:user_id", checkIfAdmin, (req, res) => {
  const { user_id } = req.params;
  const sqlQuery = "SELECT * from keppel.users where user_id =" + user_id;
  global.db.query(sqlQuery, (err, result) => {
    if (err) return res.status(500).send(err);
    if (result.rows.length < 1) return res.status(404).send("User not found");
    const previousUserId = req.user.id;

    // Log in the user
    req.login(result.rows[0], (err) => {
      if (err) {
        return res.status(500).send(err);
      }
      // Save the current user ID in a session variable
      req.session.previousUserId = previousUserId;
      return res.status(200).json("success");
    });
  });
});

router.post("/admin/revert", (req, res) => {
  if (!req.session.previousUserId) {
    return res.status(400).send("Cannot revert");
  }

  // Query to find back the admin user
  const sqlQuery =
    "SELECT * from keppel.users where user_id =" + req.session.previousUserId;

  global.db.query(sqlQuery, (err, result) => {
    if (err) return res.status(500).send(err);
    if (result.rows.length < 1) return res.status(404).send("User not found");

    // Log in the user
    req.login(result.rows[0], (err) => {
      if (err) {
        return res.status(500).send(err);
      }
      // Clear the session variable after reverting
      delete req.session.previousUserId;
      return res.status(200).json("success");
    });
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
    permissions: req.user.permissions,
  });
});

/**
 * @api {get} /request/approved Get Approved Requests
 * @apiDescription Gets all requests with status of `APPROVED`.
 *
 * For operation specialists, only relevant approved requests will be returned.
 * @apiName GetApprovedRequests
 * @apiGroup Request
 *
 * @apiDefine RequestObject
 * @apiSuccess {Object[]} - Array of all requests, sorted by creation date
 * @apiSuccess {Number} request_id ID of request
 * @apiSuccess {Number} fault_id ID of fault type
 * @apiSuccess {String} fault_name Name of the fault
 * @apiSuccess {String} fault_description Description of fault request
 * @apiSuccess {Number} plant_id ID of associated plant
 * @apiSuccess {String} plant_name Name of associated plant
 * @apiSuccess {String} role_name Role of request creator
 * @apiSuccess {String} created_by Full name of request creator
 * @apiSuccess {Number} status_id Current Status ID
 * @apiSuccess {String} status Current request status
 * @apiSuccess {String} request_type Type of request
 * @apiSuccess {String|NULL} priority Priority of fault request
 * @apiSuccess {Number} psa_id ID of associated asset
 * @apiSuccess {String} asset_name Name of of associated asset
 * @apiSuccess {String} created_date Date and time of request creation
 * @apiSuccess {JSON} activity_log JSON to store the history
 * @apiSuccess {String|NULL} uploadfilemimetype MIME-Type of uploaded fault request file
 * @apiSuccess {Binary|NULL} uploaded_file Uploaded fault request file
 * @apiSuccess {String|NULL} completedfilemimetype MIME-Type of uploaded completion file
 * @apiSuccess {Binary|NULL} completion_file Uploaded completion file
 * @apiSuccess {String|NULL} assigned_user_name User name assigned to fault request
 * @apiSuccess {Number|NULL} associatedrequestid Request ID of fault request for corrective requests
 * @apiSuccess {String|NULL} rejection_comments Rejection comments of fault request
 * @apiSuccess {String|NULL} complete_comments Completion comments of fault request
 */

router.get(
  "/request/approved",
  checkIfLoggedInAPI,
  controllers.request.fetchApprovedRequests
);

/**
 * @api {get} /request/assigned Get Assigned Requests
 * @apiDescription Gets all requests with status of `ASSIGNED`.
 *
 * For operation specialists, only relevant assigned requests will be returned.
 *
 * Returns the same output schema as `/request/approved`
 * @apiName GetAssignedRequests
 * @apiGroup Request
 *
 */
router.get(
  "/request/assigned",
  checkIfLoggedInAPI,
  controllers.request.fetchAssignedRequests
);

/**
 * @api {get} /request/assigned Get Overdue Requests
 * @apiDescription Gets all requests with status of `OVERDUE`.
 *
 * For operation specialists, only relevant overdue requests will be returned.
 *
 * Returns the same output schema as `/request/overdue`
 * @apiName GetOverdueRequests
 * @apiGroup Request
 *
 */
router.get(
  "/request/overdue",
  checkIfLoggedInAPI,
  controllers.request.fetchOverdueRequests
);

/**
 * @api {get} /request/review Get For Review Requests
 * @apiDescription Gets all requests with status of `COMPLETED`, `REJECTED`, `CANCELLED`.
 *
 * For operation specialists, only relevant for review requests will be returned.
 *
 *
 * Returns the same output schema as `/request/approved`
 * @apiName GetForReviewRequests
 * @apiGroup Request
 *
 */
router.get(
  "/request/review",
  checkIfLoggedInAPI,
  controllers.request.fetchReviewRequests
);
/**
 * @api {get} /request/pending Get Pending Requests
 * @apiDescription Gets all requests with status of `PENDING`.
 *
 * For operation specialists, only relevant pending requests will be returned.
 *
 * Returns the same output schema as `/request/approved`
 * @apiName GetPendingRequests
 * @apiGroup Request
 *
 */

router.get(
  "/request/pending",
  checkIfLoggedInAPI,
  controllers.request.fetchPendingRequests
);

/**
 * @api {get} /request/type Get Request Types
 * @apiDescription Gets all request types.
 * @apiName GetRequestTypes
 * @apiGroup Request
 *
 * @apiSuccess {Object[]} - Array containing the different request types and their corresponding ID
 * @apiSuccess {Number} req_id ID of the request type
 * @apiSuccess {String} request Name of the request type
 *
 */
router.get("/request/types", controllers.request.fetchRequestTypes);

/**
 * @api {get} /request/priority Get Request Priorities
 * @apiDescription Gets all request priorities.
 * @apiName GetRequestPriorities
 * @apiGroup Request
 *
 * @apiSuccess {Number} p_id ID of priority
 * @apiSuccess {String} priority Name of priority
 * @apiSuccess {String} created_date Creation date of priority
 * @apiSuccess {JSON} activity_log JSON to store the history
 */
router.get(
  "/request/priority",
  checkIfLoggedInAPI,
  controllers.request.fetchRequestPriority
);

/**
 * @api {get} /request/csv Get Request CSV
 * @apiDescription Fetches the csv table of all the request in the form of a buffer.
 * @apiName GetRequestCSV
 * @apiGroup Request
 *
 * @apiSuccess {Buffer} - Buffer of csv
 */
router.get(
  "/request/csv",
  checkIfLoggedInAPI,
  controllers.request.createRequestCSV
);

/**
 * @api {get} /request/pdf/:request_id Get Request PDF
 * @apiDescription Fetches the pdf version of a request in the form of a buffer.
 * @apiName GetRequestPDF
 * @apiGroup Request
 *
 * @apiParam {Number} request_id Request ID
 *
 * @apiSuccess {Buffer} - Buffer of pdf
 */
router.get("/request/pdf/:request_id", checkIfLoggedInAPI, sendRequestPDF);

/**
 * @api {patch} /request/complete/:request_id Complete Request
 * @apiDescription Change the status of a request to `COMPLETED`.
 * @apiName CompleteRequest
 * @apiGroup Request
 *
 * @apiParam {Number} request_id Request ID
 *
 * @apiBody {String} complete_comments Comments on the completed checklist
 * @apiBody {File} completion_file Image of the completed task
 *
 */
router.patch(
  "/request/complete/:request_id",
  checkIfLoggedInAPI,
  upload.single("completion_file"),
  controllers.request.completeRequest
);

/**
 * @api {post} /request Create Request
 * @apiDescription Creates a new request which will have a status of `PENDING`.
 * @apiName CreateRequest
 * @apiGroup Request
 *
 * @apiBody {Number} requestTypeID ID of the request type
 * @apiBody {Number} faultTypeID ID of the fault type
 * @apiBody {Number} plantLocationID ID of the plant location
 * @apiBody {Number} taggedAssetID ID of the asset that is being reported on
 * @apiBody {String} description Description of the created request
 * @apiBody {Object} [image] Image of the asset that is being reported on
 *
 * @apiSuccess {String} message `'Request created successfully'`
 */

router.post(
  "/request/",
  upload.single("image"),
  controllers.request.createRequest
);

/**
 * @api {get} /request/:request_id Get Specific Request
 * @apiDescription Creates a new request which will have a status of `PENDING`.
 * @apiName GetSpecificRequest
 * @apiGroup Request
 *
 * @apiParam {Number} request_id Request ID
 *
 * @apiUse RequestObject
 */

/**
 * @api {patch} /request/:request_id Update Specific Request
 * @apiDescription Creates a new request which will have a status of `PENDING`.
 * @apiName UpdateSpecificRequest
 * @apiGroup Request
 *
 * @apiParam {Number} request_id Request ID
 *
 * @apiBody {Object[]} priority Priority object
 * @apiBody {Number} -.p_id Priority ID
 * @apiBody {String} -.priority Name of priority
 * @apiBody {Object[]} assignedUser Object for assigned user
 * @apiBody {Number} -.value ID of assigned user
 * @apiBody {String} -.label Name of assigned user
 *
 */

router
  .route("/request/:request_id", checkIfLoggedInAPI)
  .get(controllers.request.fetchSpecificRequest)
  .patch(controllers.request.updateRequest);

/**
 * @api {get} /request/:request_id/uploadedfile Get Uploaded File
 * @apiDescription Fetches the uploaded file in the form of a buffer.
 * @apiName GetUploadedFile
 * @apiGroup Request
 *
 * @apiParam {Number} request_id Request ID
 *
 * @apiSuccess {Buffer} - Uploaded file of the request
 */
router
  .route("/request/:request_id/uploadedfile")
  .get(controllers.request.fetchRequestUploadedFile);

/**
 * @api {patch} /request/:request_id/:status_id Approve/Reject Request
 * @apiDescription To change the status of a request to either `APPROVED` or `REJECTED`.
 * @apiName ApproveOrRejectRequest
 * @apiGroup Request
 *
 * @apiParam {Number} request_id Request ID
 * @apiParam {Number} status_id Status ID of request. Use 4 to approve and 5 to reject. Any other string params will default to reject.
 *
 * @apiBody {String} comments Comments from the manager
 */
router.patch(
  "/request/approve/:request_id",
  checkIfLoggedInAPI,
  controllers.request.approveRequest
);

router.patch(
  "/request/reject/:request_id",
  checkIfLoggedInAPI,
  controllers.request.rejectRequest
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
  "/request/pending/:plant/:datetype/:date",
  checkIfLoggedInAPI,
  controllers.request.fetchPendingRequests
);

router.get(
  "/request/outstanding/:plant/:datetype/:date",
  checkIfLoggedInAPI,
  controllers.request.fetchOutstandingRequests
);

router.get(
  "/request/completed/:plant/:datetype/:date",
  checkIfLoggedInAPI,
  controllers.request.fetchCompletedRequests
);

router.get(
  "/request/overdue/:plant/:datetype/:date",
  checkIfLoggedInAPI,
  controllers.request.fetchOverdueRequests
);
/**
 * @api {get} /request/plant/:plant_id Get Plant Details
 * @apiDescription Fetches the pd and name of a specific plant.
 * @apiName GetPlantDetails
 * @apiGroup Request
 *
 * @apiParam {Number} plant_id Plant ID
 *
 * @apiBody {Number} plant_id Plant ID
 * @apiBody {String} plant_name Plant name
 */
router.get("/request/plant/:plant_id", controllers.request.fetchPlantRequest);

/**
 * @api {get} /request/asset/:psa_id Get Asset Details
 * @apiDescription Fetches the id and name of a specific asset.
 * @apiName GetAssetDetails
 * @apiGroup Request
 *
 * @apiParam {Number} psa_id  Plant System Assets ID
 *
 * @apiBody {Number} psa_id  Plant System Assets ID
 * @apiBody {String} plant_asset_instrument Asset name
 */
router.get("/request/asset/:psa_id", controllers.request.fetchAssetRequest);

/**
 * @apiDefine ChecklistDataJSON
 * @apiSuccess {Object[]} -.datajson Checklist Data
 * @apiSuccess {Object[]} -.datajson.rows Checklist Section (Each Section contain rows)
 * @apiSuccess {String} -.datajson.description Checklist Section Description
 * @apiSuccess {Object[]} -.datajson.rows.checks Checklist Row (Each Row contains checks)
 * @apiSuccess {String} -.datajson.rows.description Checklist Row Description
 * @apiSuccess {String} -.datajson.rows.checks.type Check Type
 * @apiSuccess {String} -.datajson.rows.checks.question Check Question
 * @apiSuccess {Array} -.datajson.rows.checks.choices Check Choices for given Question
 * @apiSuccess {String} -.datajson.rows.checks.value Inputted Check Value
 */

/**
 * @apiDefine SubmitChecklistDataJSON
 *
 * @apiBody {Object[]} -.datajson Checklist Data
 * @apiBody {Object[]} -.datajson.rows Checklist Section (Each Section contain rows)
 * @apiBody {Object[]} -.datajson.rows.checks Checklist Row (Each Row contains checks)
 * @apiBody {String} -.datajson.rows.description Checklist Row Description
 * @apiBody {String} -.datajson.rows.checks.type Check Type
 * @apiBody {String} -.datajson.rows.checks.question Check Question
 * @apiBody {Array} -.datajson.rows.checks.choices Check Choices for given Question
 * @apiBody {String} -.datajson.rows.checks.value Inputted Check Value
 * @apiBody {String} -.datajson.description Checklist Section Description
 */

/**
 * @api {get} /notAnActualRoute ! Explaining Checklist
 * @apiDescription the /checklist handles 2 tables, namely checklist_templates and checklists_records
 * @apiDescription checklist_records are implemented versions of checklist_templates (multiple checklist_records can follow  the samechecklist_templates)
 * @apiName ChecklistExplanation
 * @apiGroup Checklist
 */

/**
 * @api {get} /notAnActualRoute Checklist DataJSON format
 * @apiDescription Checklist DataJSON format
 * @apiGroup Checklist
 *
 * @apiSuccess {Object[]} datajson Checklist Data
 * @apiSuccess {Object[]} datajson.rows Checklist Section (Each Section contain rows)
 * @apiSuccess {Object[]} datajson.rows.checks Checklist Row (Each Row contains checks)
 * @apiSuccess {String} datajson.rows.description Checklist Row Description
 * @apiSuccess {String} datajson.rows.checks.type Check Type
 * @apiSuccess {String} datajson.rows.checks.question Check Question
 * @apiSuccess {Array} datajson.rows.checks.choices Check Choices for given Question
 * @apiSuccess {String} datajson.rows.checks.value Inputted Check Value
 * @apiSuccess {String} datajson.description Checklist Section Description
 */

/**
 * @api {get} /checklist/template/:checklist_id Get Single Checklist Template
 * @apiDescription Gets a single checklist template based on given checklist_id
 * @apiName GetSingleChecklistTemplate
 * @apiGroup Checklist
 *
 * @apiParam {String} checklist_id Checklist Template unique ID
 *
 * @apiSuccess {Object} - Object containing the specified checklist template's details
 * @apiSuccess {String} -.chl_name Checklist Name
 * @apiSuccess {String} -.description Checklist Description
 * @apiSuccess {Number} -.plant_id Plant ID
 * @apiSuccess {Number} -.signoff_user_id Signoff User ID
 * @apiSuccess {Number} -.status_id Template Status (currently deprecated)
 * @apiUse ChecklistDataJSON
 *
 * @apiError (Error 500) {Object} InternalServerError "No checklist template found"
 */

/**
 * @api {post} /checklist/template Create Checklist Template
 * @apiDescription Create a new checklist template for later submission as record
 * @apiName CreateChecklistTemplate
 * @apiGroup Checklist
 *
 * @apiBody {Object} checklist Checklist Template
 * @apiBody {String} checklist.chl_name Checklist Template Name
 * @apiBody {String} checklist.description Checklist Description
 * @apiBody {Number} checklist.signoff_user_id Signoff User ID
 * @apiBody {Number} checklist.plant_id Plant ID of Checklist
 * @apiUse SubmitChecklistDataJSON
 *
 * @apiSuccess {String} Created "New checklist successfully created"
 *
 * @apiError (Error 500) {String} InternalServerError "Failure to create new checklist"
 */

/**
 * @api {delete} /checklist/template/:checklist_id Delete Checklist Template
 * @apiDescription Delete a Checklist Template based on given Checklist ID
 * @apiName DeleteChecklistTemplate
 * @apiGroup Checklist
 *
 * @apiParam {String} checklist_id Checklist Template unique ID
 *
 * @apiSuccess {String} Success "Template successfully deleted"
 *
 * @apiError (Error 500) {String} InternalServerError "Failure to delete template"
 */
router
  .route("/checklist/template/:checklist_id?", checkIfLoggedInAPI)
  .get(controllers.checklist.fetchSpecificChecklistTemplate)
  .post(controllers.checklist.createNewChecklistTemplate)
  .delete(controllers.checklist.deleteChecklistTemplate);

/**
 * @api {get} /checklist/assigned Get Assigned Checklists
 * @apiDescription Get all Assigned Checklists
 * @apiName GetAssignedChecklists
 * @apiGroup Checklist
 *
 * @apiQuery {String} page Page Number
 *
 * @apiSuccess {Object} - Object containing "Assigned" Checklists Array and side information
 * @apiSuccess {Object[]} -.rows Checklists Array
 * @apiSuccess {Number} -.rows.checklist_id Checklist ID
 * @apiSuccess {String} -.rows.chl_name Checklist Name
 * @apiSuccess {String} -.rows.description Checklist Description
 * @apiSuccess {Number} -.rows.status_id Checklist Status (2 for Assigned)
 * @apiSuccess {Object[]} -.rows.activity_log Checklist History
 * @apiSuccess {String} -.rows.createdbyuser User who created Checklist
 * @apiSuccess {String} -.rows.assigneduser Name of assigned user
 * @apiSuccess {String} -.rows.signoffuser Name of signoff user
 * @apiSuccess {String} -.rows.plant_name Plant Name of plant associated with Checklist
 * @apiSuccess {Number} -.rows.plant_id Plant ID of plant associated with Checklist
 * @apiSuccess {String} -.rows.completeremarks_req Completed Request Remarks
 * @apiSuccess {String} -.rows.linkedassets Assets associated with Checklist
 * @apiSuccess {String} -.rows.chl_type Checklist Type (Record / Template). Should be Record
 * @apiSuccess {String} -.rows.created_date Date at which Checklist was created
 * @apiSuccess {String} -.rows.history Deprecated. Use activity_log instead
 * @apiSuccess {Object[]} -.rows.datajson Refer to "Checklist DataJSON format"
 * @apiSuccess {Number} -.rows.signoff_user_id Signoff user ID
 * @apiSuccess {Number} -.rows.assigned_user_id Assigned user ID
 * @apiSuccess {String} -.rows.status Status (Should be "ASSIGNED")
 * @apiSuccess {Number} -.total Total Pages of "Assigned" Checklists
 *
 * @apiError (Error 204) {Object} NoContent {msg: "No checklist"}
 * @apiError (Error 500) {Object} InternalServerError {msg: ERRORMESSAGE}
 */
router
  .route("/checklist/assigned", checkIfLoggedInAPI)
  .get(controllers.checklist.fetchAssignedChecklists);

/**
 * @api {get} /checklist/record Get For Review Checklists
 * @apiDescription Get all For Review Checklists
 * @apiName GetForReviewChecklists
 * @apiGroup Checklist
 *
 * @apiQuery {String} page Page Number
 *
 * @apiSuccess {Object} - Object containing "For Review" Checklists Array and side information
 * @apiSuccess {Object[]} -.rows "For Review" Checklists Array
 * @apiSuccess {Number} -.rows.checklist_id Checklist ID
 * @apiSuccess {String} -.rows.chl_name Checklist Name
 * @apiSuccess {String} -.rows.description Checklist Description
 * @apiSuccess {Number} -.rows.status_id Checklist Status (4 for Work Done, 6 for Rejected) - Rejected is deprecated
 * @apiSuccess {Object[]} -.rows.activity_log Checklist History
 * @apiSuccess {String} -.rows.createdbyuser User who created Checklist
 * @apiSuccess {String} -.rows.assigneduser Name of assigned user
 * @apiSuccess {String} -.rows.signoffuser Name of signoff user
 * @apiSuccess {String} -.rows.plant_name Plant Name of plant associated with Checklist
 * @apiSuccess {Number} -.rows.plant_id Plant ID of plant associated with Checklist
 * @apiSuccess {String} -.rows.completeremarks_req Completed Request Remarks
 * @apiSuccess {String} -.rows.linkedassets Assets associated with Checklist
 * @apiSuccess {String} -.rows.chl_type Checklist Type (Record / Template). Should be Record
 * @apiSuccess {String} -.rows.created_date Date at which Checklist was created
 * @apiSuccess {String} -.rows.history Deprecated. Use activity_log instead
 * @apiSuccess {Object[]} -.rows.datajson Refer to "Checklist DataJSON format"
 * @apiSuccess {Number} -.rows.signoff_user_id Signoff user ID
 * @apiSuccess {Number} -.rows.assigned_user_id Assigned user ID
 * @apiSuccess {String} -.rows.status Status (Should be "WORK DONE / REJECTED") - REJECTED is deprecated
 * @apiSuccess {Number} -.total Total Pages of "For Review" Checklists
 *
 * @apiError (Error 204) {Object} NoContent {msg: "No checklist"}
 * @apiError (Error 500) {Object} InternalServerError {msg: ERRORMESSAGE}
 */

/**
 * @api {get} /checklist/record/:checklist_id Get Single Checklist Record
 * @apiDescription Gets a single checklist record based on the given checklist_id
 * @apiName GetSingleChecklistRecord
 * @apiGroup Checklist
 *
 * @apiParam {String} checklist_id Record unique ID
 *
 * @apiSuccess {Object} - Object containing the specified checklist record's details
 * @apiSuccess {Number} -.checklist_id Checklist(record) ID
 * @apiSuccess {Number} -.chl_name Checklist(record) Name
 *
 * @apiError (Error 500) {String} InternalServerError "No checklist template found"
 */

/**
 * @api {post} /checklist/record Create Checklist Record
 * @apiDescription Create a new Checklist Record
 * @apiName CreateChecklistRecord
 * @apiGroup Checklist
 *
 * @apiBody {Object} checklist Checklist Record
 * @apiBody {String} checklist.chl_name Checklist Template Name
 * @apiBody {String} checklist.description Checklist Description
 * @apiBody {String} [checklist.assigned_user_id] The user ID of assignee to the checklist
 * @apiBody {Number} checklist.signoff_user_id Signoff User ID
 * @apiBody {String} checklist.linkedassetids IDs of assets linked to the checklist
 * @apiBody {Number} checklist.plant_id Plant ID of Checklist
 * @apiUse SubmitChecklistDataJSON
 *
 * @apiSuccess {String} Created "New checklist successfully created"
 *
 * @apiError (Error 500) {String} InternalServerError "Failure to create new checklist"
 */

/**
 * @api {patch} /checklist/record/:checklist_id Edit a Pending / Assigned Checklist Record
 * @apiDescription Edit an existing Pending / Assigned Checklist Record
 * Responsible for updating Checklist Record from Pending to Assigned as well
 * @apiName EditPendingChecklistRecord
 * @apiGroup Checklist
 *
 * @apiParam {String} checklist_id The ID of the Pending Checklist Record
 *
 * @apiBody {Object} checklist Checklist Record
 * @apiBody {String} checklist.chl_name Checklist Template Name
 * @apiBody {String} checklist.description Checklist Description
 * @apiBody {Number} [checklist.assigned_user_id] The user ID of assignee to the checklist. If filled, Checklist Record is updated to Status of "ASSIGNED"
 * @apiBody {Number} checklist.signoff_user_id Signoff User ID
 * @apiBody {String} checklist.linkedassetids IDs of assets linked to the checklist
 * @apiBody {Number} checklist.plant_id Plant ID of Checklist
 *
 * @apiSuccess {String} Success "Checklist successfully assigned/updated"
 *
 * @apiError (Error 500) {String} InternalServerError "Failure to update checklist"
 */
router
  .route("/checklist/record/:checklist_id?", checkIfLoggedInAPI)
  .get(controllers.checklist.fetchChecklistRecords)
  .post(controllers.checklist.createNewChecklistRecord)
  .patch(controllers.checklist.editChecklistRecord);

router
  .route("/checklist/record/compilation/:checklist_ids", checkIfLoggedInAPI)
  .get(controllers.checklist.fetchMultipleChecklistRecords)
  .post(controllers.checklist.createNewChecklistRecord)
  .patch(controllers.checklist.editChecklistRecord);
/**
 * @api {get} /checklist/approved Get Approved Checklists
 * @apiDescription Get all Approved Checklists
 * @apiName GetApprovedChecklists
 * @apiGroup Checklist
 *
 * @apiQuery {String} page Page Number
 *
 * @apiSuccess {Object} - Object containing "Approved" Checklists Array and side information
 * @apiSuccess {Object[]} -.rows Checklists Array
 * @apiSuccess {Number} -.rows.checklist_id Checklist ID
 * @apiSuccess {String} -.rows.chl_name Checklist Name
 * @apiSuccess {String} -.rows.description Checklist Description
 * @apiSuccess {Number} -.rows.status_id Checklist Status (5 for Approved)
 * @apiSuccess {Object[]} -.rows.activity_log Checklist History
 * @apiSuccess {String} -.rows.createdbyuser User who created Checklist
 * @apiSuccess {String} -.rows.assigneduser Name of assigned user
 * @apiSuccess {String} -.rows.signoffuser Name of signoff user
 * @apiSuccess {String} -.rows.plant_name Plant Name of plant associated with Checklist
 * @apiSuccess {Number} -.rows.plant_id Plant ID of plant associated with Checklist
 * @apiSuccess {String} -.rows.completeremarks_req Completed Request Remarks
 * @apiSuccess {String} -.rows.linkedassets Assets associated with Checklist
 * @apiSuccess {String} -.rows.chl_type Checklist Type (Record / Template). Should be Record
 * @apiSuccess {String} -.rows.created_date Date at which Checklist was created
 * @apiSuccess {String} -.rows.history Deprecated. Use activity_log instead
 * @apiSuccess {Object[]} -.rows.datajson Refer to "Checklist DataJSON format"
 * @apiSuccess {Number} -.rows.signoff_user_id Signoff user ID
 * @apiSuccess {Number} -.rows.assigned_user_id Assigned user ID
 * @apiSuccess {String} -.rows.status Status (Should be "APPROVED")
 * @apiSuccess {Number} -.total Total Pages of "Approved" Checklists
 *
 * @apiError (Error 204) {Object} NoContent {msg: "No checklist"}
 * @apiError (Error 500) {Object} InternalServerError {msg: ERRORMESSAGE}
 */
router.get(
  "/checklist/approved",
  checkIfLoggedInAPI,
  controllers.checklist.fetchApprovedChecklists
);

/**
 * @api {get} /checklist/pending Get Pending Checklists
 * @apiDescription Get all Pending Checklists
 * @apiName GetPendingChecklists
 * @apiGroup Checklist
 *
 * @apiQuery {String} page Page Number
 *
 * @apiSuccess {Object} - Object containing "Pending" Checklists Array and side information
 * @apiSuccess {Object[]} -.rows Checklists Array
 * @apiSuccess {Number} -.rows.checklist_id Checklist ID
 * @apiSuccess {String} -.rows.chl_name Checklist Name
 * @apiSuccess {String} -.rows.description Checklist Description
 * @apiSuccess {Number} -.rows.status_id Checklist Status (1 for Pending)
 * @apiSuccess {Object[]} -.rows.activity_log Checklist History
 * @apiSuccess {String} -.rows.createdbyuser User who created Checklist
 * @apiSuccess {String} -.rows.assigneduser Name of assigned user
 * @apiSuccess {String} -.rows.signoffuser Name of signoff user
 * @apiSuccess {String} -.rows.plant_name Plant Name of plant associated with Checklist
 * @apiSuccess {Number} -.rows.plant_id Plant ID of plant associated with Checklist
 * @apiSuccess {String} -.rows.completeremarks_req Completed Request Remarks
 * @apiSuccess {String} -.rows.linkedassets Assets associated with Checklist
 * @apiSuccess {String} -.rows.chl_type Checklist Type (Record / Template). Should be Record
 * @apiSuccess {String} -.rows.created_date Date at which Checklist was created
 * @apiSuccess {String} -.rows.history Deprecated. Use activity_log instead
 * @apiSuccess {Object[]} -.rows.datajson Refer to "Checklist DataJSON format"
 * @apiSuccess {Number} -.rows.signoff_user_id Signoff user ID
 * @apiSuccess {Number} -.rows.assigned_user_id Assigned user ID
 * @apiSuccess {String} -.rows.status Status (Should be "PENDING")
 * @apiSuccess {Number} -.total Total Pages of "Pending" Checklists
 *
 * @apiError (Error 204) {Object} NoContent {msg: "No checklist"}
 * @apiError (Error 500) {Object} InternalServerError {msg: ERRORMESSAGE}
 */

router.get(
  "/checklist/pending",
  checkIfLoggedInAPI,
  controllers.checklist.fetchPendingChecklists
);

/**
 * @api {get} /checklist/templateNames/:id Get Template Names
 * @apiDescription Get all Template Names
 * @apiName GetTemplateNames
 * @apiGroup Checklist
 *
 * @apiParam {String} id Plant ID
 *
 * @apiSuccess  {Object[]} - Array of Template Objects
 * @apiSuccess {Number} -.checklist_id Checklist Template ID
 * @apiSuccess {String} -.chl_name Checklist Name
 * @apiSuccess {String} -.description Checklist Description
 * @apiSuccess {Number} -.assigned_user_id Assigned User ID if available
 * @apiSuccess {Number} -.signoff_user_id Signoff User ID
 * @apiSuccess {String} -.completeremarks_req Completed Template Remarks (Should be null)
 * @apiSuccess {String} -.linkedassetsids Linked Asset IDs
 * @apiSuccess {Object[]} -.datajson Refer to "Checklist DataJSON format"
 * @apiSuccess {String} -.rows.chl_type Checklist Type (Record / Template). Should be Template
 * @apiSuccess {Number} -.rows.plant_id Plant ID of plant associated with Checklist Template
 * @apiSuccess {String} -.rows.created_date Date at which Checklist Template was created
 * @apiSuccess {Number} -.rows.created_user_id User ID of user who created the Checklist Template
 * @apiSuccess {String} -.rows.history Deprecated.
 * @apiSuccess {Number} -.rows.status_id Deprecated.
 * @apiSuccess {String} -.rows.fromtemplateid Deprecated.
 *
 * @apiError (Error 500) {Object} InternalServerError {msg: ERRORMESSAGE}
 */
router.get(
  "/checklist/templateNames/:id?",
  checkIfLoggedInAPI,
  controllers.checklist.fetchChecklistTemplateNames
);

/**
 * @api {get} /checklist/counts/:field/:plant/:datetype/:date Get Checklist Records Counts
 * @apiDescription Get Checklist Records Counts organised by status
 * @apiName GetChecklistRecordsCount
 * @apiGroup Checklist
 *
 * @apiParam {String} field "status", else there will be error status of 404 thrown
 * @apiParam {String} plant Plant ID.
 * 0 for all Plants or respective plant IDs
 * @apiParam {String} datetype "date", "week", "month", "quarter" or "year"
 * @apiParam {String} date "all" or "YYYY-MM-DD"
 *
 * @apiSuccess {Object[]} - Array of Checklist Records Counts organised by status
 * @apiSuccess {String} -.name Checklist Record Status Name
 * @apiSuccess {Number} -.name Checklist Record Status ID
 * @apiSuccess {String} -.name Number of Checklist Records of given status
 *
 * @apiError (Error 404) {String} NotFound Invalid "Checklist Type of ${field}"
 * @apiError (Error 500) {String} InternalServerError "Error in fetching checklist status for dashboard"
 */
router.get(
  "/checklist/counts/:field/:plant/:datetype/:date",
  checkIfLoggedInAPI,
  controllers.checklist.fetchChecklistCounts
);

/**
 * @api {get} /checklist/pending/:plant/:datetype/:date Get Pending Checklist by Plant
 * @apiDescription Get Pending Checklists by Plant, Datetype and Date
 * @apiName GetPendingChecklistByPlant
 * @apiGroup Checklist
 * 
 * @apiParam {String} plant Plant ID
 * @apiParam {String} datetype "date", "week", "month", "quarter" or "year"
 * @apiParam {String} date "all" or "YYYY-MM-DD"
 * 
 * @apiSuccess {Object} - Object containing "Pending" Checklists Array and side information
 * @apiSuccess {Object[]} -.rows Checklists Array
 * @apiSuccess {Number} -.rows.checklist_id Checklist ID
 * @apiSuccess {String} -.rows.chl_name Checklist Name
 * @apiSuccess {String} -.rows.description Checklist Description
 * @apiSuccess {Number} -.rows.status_id Checklist Status (1 for Pending)
 * @apiSuccess {Object[]} -.rows.activity_log Checklist History
 * @apiSuccess {String} -.rows.createdbyuser User who created Checklist
 * @apiSuccess {String} -.rows.assigneduser Name of assigned user
 * @apiSuccess {String} -.rows.signoffuser Name of signoff user
 * @apiSuccess {String} -.rows.plant_name Plant Name of plant associated with Checklist
 * @apiSuccess {Number} -.rows.plant_id Plant ID of plant associated with Checklist
 * @apiSuccess {String} -.rows.completeremarks_req Completed Request Remarks
 * @apiSuccess {String} -.rows.linkedassetids Asset ID associated with Checklist
 * @apiSuccess {String} -.rows.linkedassets Assets associated with Checklist
 * @apiSuccess {String} -.rows.chl_type Checklist Type (Record / Template). Should be Record
 * @apiSuccess {String} -.rows.created_date Date at which Checklist was created
 * @apiSuccess {String} -.rows.history Deprecated. Use activity_log instead
 * @apiSuccess {Object[]} -.rows.datajson Refer to "Checklist DataJSON format"
 * @apiSuccess {Number} -.rows.signoff_user_id Signoff user ID
 * @apiSuccess {Number} -.rows.assigned_user_id Assigned user ID
 * @apiSuccess {String} -.rows.status Status (Should be "PENDING")
 * @apiSuccess {String} -.rows.overdue When the Checklist Becomes Overdue
 * @apiSuccess {Boolean} -.rows.overdue_status Represents if Checklist is Overdue or Valid
 * @apiSuccess {String} -.rows.updated_at Indicates when the Checklist was last updated
 * @apiSuccess {String} -.rows.checklist_status Indicates the current status and when it was updated to that status
 * @apiSuccess {String} -.rows.date Date of latest update
 * @apiSuccess {String} -.rows.item_name Role of User who created Checklist
 * @apiSuccess {Number} -.total Total Pages of "Pending" Checklists
 * 
 * @apiError (Error 500) {Object} InternalServerError {msg: ERRORMESSAGE}
 */
router.get(
  "/checklist/pending/:plant/:datetype/:date",
  checkIfLoggedInAPI,
  controllers.checklist.fetchPendingChecklists
);

/**
 * @api {get} /checklist/outstanding/:plant/:datetype/:date Get Outstanding Checklists
 * @apiDescription Get Outstanding Checklists 
 * @apiName GetOutstandingChecklist
 * @apiGroup Checklist
 * 
 * @apiParam {String} plant Plant ID
 * @apiParam {String} datetype "date", "week", "month", "quarter" or "year"
 * @apiParam {String} date "all" or "YYYY-MM-DD"
 * 
 * @apiSuccess {Object} - Object containing "Outstanding" Checklists Array and side information
 * @apiSuccess {Object[]} -.rows Checklists Array
 * @apiSuccess {Number} -.rows.checklist_id Checklist ID
 * @apiSuccess {String} -.rows.chl_name Checklist Name
 * @apiSuccess {String} -.rows.description Checklist Description
 * @apiSuccess {Number} -.rows.status_id Checklist Status (2 for Assigned, 6 for Rejected)
 * @apiSuccess {Object[]} -.rows.activity_log Checklist History
 * @apiSuccess {String} -.rows.createdbyuser User who created Checklist
 * @apiSuccess {String} -.rows.assigneduser Name of assigned user
 * @apiSuccess {String} -.rows.signoffuser Name of signoff user
 * @apiSuccess {String} -.rows.plant_name Plant Name of plant associated with Checklist
 * @apiSuccess {Number} -.rows.plant_id Plant ID of plant associated with Checklist
 * @apiSuccess {String} -.rows.completeremarks_req Completed Request Remarks
 * @apiSuccess {String} -.rows.linkedassetids Asset ID associated with Checklist
 * @apiSuccess {String} -.rows.linkedassets Assets associated with Checklist
 * @apiSuccess {String} -.rows.chl_type Checklist Type (Record / Template). Should be Record
 * @apiSuccess {String} -.rows.created_date Date at which Checklist was created
 * @apiSuccess {String} -.rows.history Deprecated. Use activity_log instead
 * @apiSuccess {Object[]} -.rows.datajson Refer to "Checklist DataJSON format"
 * @apiSuccess {Number} -.rows.signoff_user_id Signoff user ID
 * @apiSuccess {Number} -.rows.assigned_user_id Assigned user ID
 * @apiSuccess {String} -.rows.status Status (Should be "ASSIGNED" or "REJECTED")
 * @apiSuccess {String} -.rows.overdue When the Checklist Becomes Overdue
 * @apiSuccess {Boolean} -.rows.overdue_status Represents if Checklist is Overdue or Valid
 * @apiSuccess {String} -.rows.updated_at Indicates when the Checklist was last updated
 * @apiSuccess {String} -.rows.checklist_status Indicates the current status and when it was updated to that status
 * @apiSuccess {String} -.rows.date Date of latest update
 * @apiSuccess {String} -.rows.item_name Role of User who created Checklist
 * @apiSuccess {Number} -.total Total Pages of "Outstanding" Checklists
 * 
 * @apiError (Error 500) {Object} InternalServerError {msg: ERRORMESSAGE}
 */
router.get(
  "/checklist/outstanding/:plant/:datetype/:date",
  checkIfLoggedInAPI,
  controllers.checklist.fetchOutstandingChecklists
);

/**
 * @api {get} /checklist/completed/:plant/:datetype/:date Get Completed Checklists
 * @apiDescription Get Completed Checklists 
 * @apiName GetCompletedChecklist
 * @apiGroup Checklist
 * 
 * @apiParam {String} plant Plant ID
 * @apiParam {String} datetype "date", "week", "month", "quarter" or "year"
 * @apiParam {String} date "all" or "YYYY-MM-DD"
 * 
 * @apiSuccess {Object} - Object containing "Completed" Checklists Array and side information
 * @apiSuccess {Object[]} -.rows Checklists Array
 * @apiSuccess {Number} -.rows.checklist_id Checklist ID
 * @apiSuccess {String} -.rows.chl_name Checklist Name
 * @apiSuccess {String} -.rows.description Checklist Description
 * @apiSuccess {Number} -.rows.status_id Checklist Status (4 for Work Done)
 * @apiSuccess {Object[]} -.rows.activity_log Checklist History
 * @apiSuccess {String} -.rows.createdbyuser User who created Checklist
 * @apiSuccess {String} -.rows.assigneduser Name of assigned user
 * @apiSuccess {String} -.rows.signoffuser Name of signoff user
 * @apiSuccess {String} -.rows.plant_name Plant Name of plant associated with Checklist
 * @apiSuccess {Number} -.rows.plant_id Plant ID of plant associated with Checklist
 * @apiSuccess {String} -.rows.completeremarks_req Completed Request Remarks
 * @apiSuccess {String} -.rows.linkedassetids Asset ID associated with Checklist
 * @apiSuccess {String} -.rows.linkedassets Assets associated with Checklist
 * @apiSuccess {String} -.rows.chl_type Checklist Type (Record / Template). Should be Record
 * @apiSuccess {String} -.rows.created_date Date at which Checklist was created
 * @apiSuccess {String} -.rows.history Deprecated. Use activity_log instead
 * @apiSuccess {Object[]} -.rows.datajson Refer to "Checklist DataJSON format"
 * @apiSuccess {Number} -.rows.signoff_user_id Signoff user ID
 * @apiSuccess {Number} -.rows.assigned_user_id Assigned user ID
 * @apiSuccess {String} -.rows.status Status (Should be "WORK DONE")
 * @apiSuccess {String} -.rows.overdue When the Checklist Becomes Overdue
 * @apiSuccess {Boolean} -.rows.overdue_status Represents if Checklist is Overdue or Valid
 * @apiSuccess {String} -.rows.updated_at Indicates when the Checklist was last updated
 * @apiSuccess {String} -.rows.checklist_status Indicates the current status and when it was updated to that status
 * @apiSuccess {String} -.rows.date Date of latest update
 * @apiSuccess {String} -.rows.item_name Role of User who created Checklist
 * @apiSuccess {Number} -.total Total Pages of "Completed" Checklists
 * 
 * @apiError (Error 500) {Object} InternalServerError {msg: ERRORMESSAGE}
 */
router.get(
  "/checklist/completed/:plant/:datetype/:date",
  checkIfLoggedInAPI,
  controllers.checklist.fetchCompletedChecklists
);

/**
 * @api {get} /checklist/overdue/:plant/:datetype/:date Get Overdue Checklists
 * @apiDescription Get Overdue Checklists 
 * @apiName GetOverdueChecklist
 * @apiGroup Checklist
 * 
 * @apiParam {String} plant Plant ID
 * @apiParam {String} datetype "date", "week", "month", "quarter" or "year"
 * @apiParam {String} date "all" or "YYYY-MM-DD"
 * 
 * @apiSuccess {Object} - Object containing "Overdue" Checklists Array and side information
 * @apiSuccess {Object[]} -.rows Checklists Array
 * @apiSuccess {Number} -.rows.checklist_id Checklist ID
 * @apiSuccess {String} -.rows.chl_name Checklist Name
 * @apiSuccess {String} -.rows.description Checklist Description
 * @apiSuccess {Number} -.rows.status_id Checklist Status
 * @apiSuccess {Object[]} -.rows.activity_log Checklist History
 * @apiSuccess {String} -.rows.createdbyuser User who created Checklist
 * @apiSuccess {String} -.rows.assigneduser Name of assigned user
 * @apiSuccess {String} -.rows.signoffuser Name of signoff user
 * @apiSuccess {String} -.rows.plant_name Plant Name of plant associated with Checklist
 * @apiSuccess {Number} -.rows.plant_id Plant ID of plant associated with Checklist
 * @apiSuccess {String} -.rows.completeremarks_req Completed Request Remarks
 * @apiSuccess {String} -.rows.linkedassetids Asset ID associated with Checklist
 * @apiSuccess {String} -.rows.linkedassets Assets associated with Checklist
 * @apiSuccess {String} -.rows.chl_type Checklist Type (Record / Template). Should be Record
 * @apiSuccess {String} -.rows.created_date Date at which Checklist was created
 * @apiSuccess {String} -.rows.history Deprecated. Use activity_log instead
 * @apiSuccess {Object[]} -.rows.datajson Refer to "Checklist DataJSON format"
 * @apiSuccess {Number} -.rows.signoff_user_id Signoff user ID
 * @apiSuccess {Number} -.rows.assigned_user_id Assigned user ID
 * @apiSuccess {String} -.rows.status Status
 * @apiSuccess {String} -.rows.overdue When the Checklist Becomes Overdue
 * @apiSuccess {Boolean} -.rows.overdue_status Represents if Checklist is Overdue or Valid
 * @apiSuccess {String} -.rows.updated_at Indicates when the Checklist was last updated
 * @apiSuccess {String} -.rows.checklist_status Indicates the current status and when it was updated to that status
 * @apiSuccess {String} -.rows.date Date of latest update
 * @apiSuccess {String} -.rows.item_name Role of User who created Checklist
 * @apiSuccess {Number} -.total Total Pages of "Overdue" Checklists
 * 
 * @apiError (Error 500) {Object} InternalServerError {msg: ERRORMESSAGE}
 */
router.get(
  "/checklist/overdue/:plant/:datetype/:date",
  checkIfLoggedInAPI,
  controllers.checklist.fetchOverdueChecklists
);

/**
 * @api {patch} /checklist/complete/:checklist_id Complete an existing checklist
 * @apiDescription Complete an existing checklist
 * Checklist will go into "For Review" if successful
 * @apiName CompleteChecklist
 * @apiGroup Checklist
 *
 * @apiParam {String} checklist_id The ID of the "Assigned" checklist record
 *
 * @apiUse SubmitChecklistDataJSON
 *
 * @apiSuccess {String} Success "Checklist successfully completed"
 *
 * @apiError (Error 500) {String} InternalServerError "Failure to update checklist completion"
 */
router.patch(
  "/checklist/complete/:checklist_id",
  checkIfLoggedInAPI,
  controllers.checklist.updateChecklist("complete")
);

/**
 * @api {patch} /checklist/draft/:checklist_id Save an existing checklist
 * @apiDescription Save an existing checklist
 * Checklist will remain with same status but progress for checklist will be saved
 * @apiName SaveChecklist
 * @apiGroup Checklist
 *
 * @apiParam {String} checklist_id The ID of the "Assigned" checklist record
 *
 * @apiUse SubmitChecklistDataJSON
 *
 * @apiSuccess {String} Success "Checklist successfully saved"
 *
 * @apiError (Error 500) {String} InternalServerError "Failure to update checklist saving"
 */
router.patch(
  "/checklist/draft/:checklist_id",
  checkIfLoggedInAPI,
  controllers.checklist.updateChecklist("save")
);
/**
 * @api {get} /checklist/filter/:status/:plant/:datetype/:date Get Filtered Checklist Records
 * @apiDescription  Get Filtered Checklist Records
 * @apiName GetFilteredChecklistsRecords
 * @apiGroup Checklist
 *
 * @apiParam {String} status Single or multiple statuses
 * If multiple statuses, put in the following format eg. .../3, 4, 5, 6/...
 * @apiParam {String} plant Plant ID.
 * 0 for all Plants or respective plant IDs
 * @apiParam {String} datetype "date", "week", "month", "quarter" or "year"
 * @apiParam {String} date "all" or "YYYY-MM-DD"
 *
 * @apiSuccess {Object} - Object containing filtered Checklists Array and side information
 * @apiSuccess {Object[]} -.rows Checklists Array
 * @apiSuccess {Number} -.rows.checklist_id Checklist ID
 * @apiSuccess {String} -.rows.chl_name Checklist Name
 * @apiSuccess {String} -.rows.description Checklist Description
 * @apiSuccess {Number} -.rows.status_id Checklist Status
 * @apiSuccess {Object[]} -.rows.activity_log Checklist History
 * @apiSuccess {String} -.rows.createdbyuser User who created Checklist
 * @apiSuccess {String} -.rows.assigneduser Name of assigned user
 * @apiSuccess {String} -.rows.signoffuser Name of signoff user
 * @apiSuccess {String} -.rows.plant_name Plant Name of plant associated with Checklist
 * @apiSuccess {Number} -.rows.plant_id Plant ID of plant associated with Checklist
 * @apiSuccess {String} -.rows.completeremarks_req Completed Request Remarks
 * @apiSuccess {String} -.rows.linkedassets Assets associated with Checklist
 * @apiSuccess {String} -.rows.chl_type Checklist Type (Record / Template). Should be Record
 * @apiSuccess {String} -.rows.created_date Date at which Checklist was created
 * @apiSuccess {String} -.rows.history Deprecated. Use activity_log instead
 * @apiSuccess {Object[]} -.rows.datajson Refer to "Checklist DataJSON format"
 * @apiSuccess {Number} -.rows.signoff_user_id Signoff user ID
 * @apiSuccess {Number} -.rows.assigned_user_id Assigned user ID
 * @apiSuccess {String} -.rows.status Status Name
 * @apiSuccess {Number} -.total Total Pages of filtered Checklists
 *
 * @apiError (Error 500) {Object} InternalServerError {msg: ERRORMESSAGE}
 * @apiError (Error 204) {Object} NoContent {msg: "No checklist"}
 */
router.get(
  "/checklist/filter/:status/:plant/:datetype/:date",
  checkIfLoggedInAPI,
  controllers.checklist.fetchFilteredChecklists
);

/**
 * @api {get} /checklist/filter/:status/:plant/:datetype/:date/:page Get Filtered Checklist Records by page
 * @apiDescription  Get Filtered Checklist Records by Page
 * @apiName GetFilteredChecklistsRecordsByPage
 * @apiGroup Checklist
 *
 * @apiParam {String} status Single or multiple statuses
 * If multiple statuses, put in the following format eg. .../3, 4, 5, 6/...
 * @apiParam {String} plant Plant ID.
 * 0 for all Plants or respective plant IDs
 * @apiParam {String} datetype "date", "week", "month", "quarter" or "year"
 * @apiParam {String} date "all" or "YYYY-MM-DD"
 * @apiParam {String} page Page Number
 *
 * @apiSuccess {Object} - Object containing filtered Checklists Array and side information
 * @apiSuccess {Object[]} -.rows Checklists Array
 * @apiSuccess {Number} -.rows.checklist_id Checklist ID
 * @apiSuccess {String} -.rows.chl_name Checklist Name
 * @apiSuccess {String} -.rows.description Checklist Description
 * @apiSuccess {Number} -.rows.status_id Checklist Status
 * @apiSuccess {Object[]} -.rows.activity_log Checklist History
 * @apiSuccess {String} -.rows.createdbyuser User who created Checklist
 * @apiSuccess {String} -.rows.assigneduser Name of assigned user
 * @apiSuccess {String} -.rows.signoffuser Name of signoff user
 * @apiSuccess {String} -.rows.plant_name Plant Name of plant associated with Checklist
 * @apiSuccess {Number} -.rows.plant_id Plant ID of plant associated with Checklist
 * @apiSuccess {String} -.rows.completeremarks_req Completed Request Remarks
 * @apiSuccess {String} -.rows.linkedassets Assets associated with Checklist
 * @apiSuccess {String} -.rows.chl_type Checklist Type (Record / Template). Should be Record
 * @apiSuccess {String} -.rows.created_date Date at which Checklist was created
 * @apiSuccess {String} -.rows.history Deprecated. Use activity_log instead
 * @apiSuccess {Object[]} -.rows.datajson Refer to "Checklist DataJSON format"
 * @apiSuccess {Number} -.rows.signoff_user_id Signoff user ID
 * @apiSuccess {Number} -.rows.assigned_user_id Assigned user ID
 * @apiSuccess {String} -.rows.status Status Name
 * @apiSuccess {Number} -.total Total Pages of filtered Checklists
 *
 * @apiError (Error 500) {Object} InternalServerError {msg: ERRORMESSAGE}
 * @apiError (Error 204) {Object} NoContent {msg: "No checklist"}
 */
router.get(
  "/checklist/filter/:status/:plant/:datetype/:date/:page",
  checkIfLoggedInAPI,
  controllers.checklist.fetchFilteredChecklists
);

/**
 * @api {patch} /checklist/approve/:checklist_id Approve Existing Checklist
 * @apiDescription Approve an existing checklist
 * Checklist will go into "Approved" if successful
 * @apiName ApproveChecklist
 * @apiGroup Checklist
 *
 * @apiParam {String} checklist_id The ID of the "Work Done" checklist record
 *
 * @apiBody {String} remarks Approval Remarks
 *
 * @apiSuccess {String} Success "Checklist successfully approved"
 *
 * @apiError (Error 500) {String} InternalServerError "Failure to update checklist approval"
 */
router.patch(
  "/checklist/approve/:checklist_id",
  checkIfLoggedInAPI,
  controllers.checklist.updateChecklist("approve")
);

/**
 * @api {patch} /checklist/reject/:checklist_id Reject Existing Checklist
 * @apiDescription Reject an existing checklist
 * Checklist will go into "Rejected" if successful
 * @apiName RejectChecklist
 * @apiGroup Checklist
 *
 * @apiParam {String} checklist_id The ID of the "Work Done" checklist record
 *
 * @apiBody {String} remarks Rejection Remarks
 *
 * @apiSuccess {String} Success "Checklist successfully rejected"
 *
 * @apiError (Error 500) {String} InternalServerError "Failure to update checklist rejection"
 */
router.patch(
  "/checklist/reject/:checklist_id",
  checkIfLoggedInAPI,
  controllers.checklist.updateChecklist("reject")
);

/**
 * @api {patch} /checklist/cancel/:checklist_id Cancel Checklist
 * @apiDescription Cancel an existing checklist
 * Checklist will go into "Cancelled" if successful
 * @apiName CancelChecklist
 * @apiGroup Checklist
 *
 * @apiParam {String} checklist_id The ID of the checklist record
 *
 * @apiBody {String} remarks Cancel Remarks
 *
 * @apiSuccess {String} Success "Checklist successfully cancelled"
 *
 * @apiError (Error 500) {String} InternalServerError "Failure to update checklist cancellation"
 */
router.patch(
  "/checklist/cancel/:checklist_id",
  checkIfLoggedInAPI,
  controllers.checklist.updateChecklist("cancel")
);

/**
 * @api {patch} /checklist/reassignReq/:checklist_id Request Checklist Reassignment
 * @apiDescription Request Reassignment for an existing checklist
 * Checklist will go into "Reassignment Request" if successful
 * @apiName ReassignReqChecklist
 * @apiGroup Checklist
 *
 * @apiParam {String} checklist_id The ID of the "Assigned" checklist record
 *
 * @apiBody {String} remarks Request Reassignment Remarks
 *
 * @apiSuccess {String} Success "Reassignment Request for Checklist ID Successfully Created"
 *
 * @apiError (Error 403) {String} ForbiddenError "Invalid Input IDs"
 * @apiError (Error 404) {String} ErrorNotFound "Checklist does not exist"
 * @apiError (Error 500) {String} InternalServerError "Failure to update checklist reassignment request"
 */
router.patch(
  "/checklist/reassignReq/:checklist_id",
  checkIfLoggedInAPI,
  controllers.checklist.updateChecklist("requestReassign")
);

/**
 * @api {patch} /checklist/reassignApprove/:checklist_id Approve Checklist Reassignment
 * @apiDescription Approve Reassignment for an existing checklist
 * Checklist will go into "Reassigned" if successful
 * @apiName ApproveReassignChecklist
 * @apiGroup Checklist
 *
 * @apiParam {String} checklist_id The ID of the "Reassignment Request" checklist record
 *
 * @apiBody {String} remarks Approve Reassignment Remarks
 *
 * @apiSuccess {String} Success "Checklist successfully approved for reassignment request"
 *
 * @apiError (Error 403) {String} ForbiddenError "Invalid Input IDs"
 * @apiError (Error 404) {String} ErrorNotFound "Checklist does not exist"
 * @apiError (Error 500) {String} InternalServerError "Failure to update checklist approval of reassignment request"
 */
router.patch(
  "/checklist/reassignApprove/:checklist_id",
  checkIfLoggedInAPI,
  controllers.checklist.updateChecklist("approveReassign")
);

/**
 * @api {patch} /checklist/reassignReject/:checklist_id Reject Checklist Reassignment
 * @apiDescription Reject Reassignment for an existing checklist
 * Checklist will go into "Assigned" if successful
 * @apiName RejectReassignChecklist
 * @apiGroup Checklist
 *
 * @apiParam {String} checklist_id The ID of the "Reassignment Request" checklist record
 *
 * @apiBody {String} remarks Reject Reassignment Remarks
 *
 * @apiSuccess {String} Success "Checklist successfully reject for reassignment request"
 *
 * @apiError (Error 403) {String} ForbiddenError "Invalid Input IDs"
 * @apiError (Error 404) {String} ErrorNotFound "Checklist does not exist"
 * @apiError (Error 500) {String} InternalServerError "Failure to update checklist rejection of reassignment request"
 */
router.patch(
  "/checklist/reassignReject/:checklist_id",
  checkIfLoggedInAPI,
  controllers.checklist.updateChecklist("rejectReassign")
);

/**
 * @api {patch} /checklist/requestCancel/:checklist_id Request Checklist Cancellation
 * @apiDescription request to cancel an existing checklist
 * Checklist will go into "request cancellation" if successful
 * @apiName RequestCancel
 * @apiGroup Checklist
 *
 * @apiParam {String} checklist_id The ID of the checklist record
 *
 * @apiBody {String} remarks request cancellation Remarks
 *
 * @apiSuccess {String} Success "Checklist successfullyr request cancellation"
 *
 * @apiError (Error 500) {String} InternalServerError "Failure to update checklist request cancellation"
 */
router.patch(
  "/checklist/requestCancel/:checklist_id",
  checkIfLoggedInAPI,
  controllers.checklist.updateChecklist("requestCancel")
);
/**
 * @api {patch} /checklist/approveCancel/:checklist_id Approve Checklist Cancellation
 * @apiDescription approve cancellation for an existing checklist
 * Checklist will go into "approve cancellation" if successful
 * @apiName RequestCancel
 * @apiGroup Checklist
 *
 * @apiParam {String} checklist_id The ID of the checklist record
 *
 * @apiBody {String} remarks approve cancellation Remarks
 *
 * @apiSuccess {String} Success "Checklist successfully approve cancellation"
 *
 * @apiError (Error 500) {String} InternalServerError "Failure to update checklist approve cancellation"
 */
router.patch(
  "/checklist/approveCancel/:checklist_id",
  checkIfLoggedInAPI,
  controllers.checklist.updateChecklist("approveCancel")
);

/**
 * @api {patch} /checklist/rejectCancel/:checklist_id Reject Checklist Cancellation
 * @apiDescription reject cancellation for an existing checklist
 * Checklist will go into "reject cancellation" if successful
 * @apiName RequestCancel
 * @apiGroup Checklist
 *
 * @apiParam {String} checklist_id The ID of the checklist record
 *
 * @apiBody {String} remarks recject cancellation Remarks
 *
 * @apiSuccess {String} Success "Checklist successfully reject cancellation"
 *
 * @apiError (Error 500) {String} InternalServerError "Failure to update checklist reject cancellation"
 */
router.patch(
  "/checklist/rejectCancel/:checklist_id",
  checkIfLoggedInAPI,
  controllers.checklist.updateChecklist("rejectCancel")
);
/**
 * @api {get} /checklist/pdf/:checklist_id Get a specific Checklist Record PDF
 * @apiDescription Get Checklist Record PDF
 * @apiName getChecklistRecordPDF
 * @apiGroup Checklist
 *
 * @apiParam {String} checklist_id The ID of the Checklist Record
 *
 * @apiSuccess {ArrayBuffer} - Checklist PDF in ArrayBuffer format
 *
 * @apiError (Error 400) {String} BadRequest "No checklist found"
 * @apiError (Error 500) {String} InternalServerError "Error in generating PDF"
 */
router.get(
  "/checklist/pdf/:checklist_id",
  checkIfLoggedInAPI,
  sendChecklistPDF
);

router.get(
  "/checklist/pdf/compile/:checklistIds",
  checkIfLoggedInAPI,
  sendAllChecklistsPDF
);

/**
 * @api {get} /checklist/csv Get CSV file of Checklist Records
 * @apiDescription Get CSV file of Checklist Records of a specific status/statuses
 * @apiName GetCSVChecklistRecords
 * @apiGroup Checklist
 *
 * @apiQuery {String} activeTab
 *
 * @apiSuccess {ArrayBuffer} - Checklist CSV in ArrayBuffer format
 * @apiError (Error 400) {String} BadRequest "No checklist found"
 * @apiError (Error 500) {String} InternalServerError "Error in generating csv file"
 */
router.get(
  "/checklist/csv",
  checkIfLoggedInAPI,
  controllers.checklist.createChecklistCSV
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

/**
 * @api {get} /asset Get Asset Table
 * @apiDescription Gets table information/structure for all assets
 * @apiName getAssetHierarchy
 * @apiGroup Asset
 *
 * @apiSuccess {string} -.plant_name Plant name of the asset
 * @apiSuccess {string} -.system_name System name of the asset
 * @apiSuccess {string} -.system_asset System Asset of the asset
 * @apiSuccess {string} -.parent_asset Parent Asset of the asset
 * @apiSuccess {string} -.asset_type Asset Type of the asset
 * @apiSuccess {number} -.system_asset_lvl5 System_asset_lvl5 of the asset
 * @apiSuccess {number} -.system_asset_lvl6 System_asset_lvl6 of the asset
 * @apiSuccess {number} -.system_asset_lvl7 System_asset_lvl7 of the asset
 * @apiSuccess {string} -.plant_asset_instrument Asset Name of the asset
 * @apiSuccess {string} -.asset_description Description of the asset
 * @apiSuccess {string} -.asset_location location of the asset
 * @apiSuccess {string} -.brand Brand of the asset
 * @apiSuccess {string} -.model_number Model Number of the asset
 * @apiSuccess {string} -.technical_specs Technical_specs of the asset
 * @apiSuccess {string} -.manufacture_country Manufacture_country of the asset
 * @apiSuccess {string} -.warranty Warranty of the asset
 * @apiSuccess {string} -.remarks Remarks for the asset
 * @apiSuccess {number} -.psa_id Psa ID of the asset
 */
router.get("/asset/:plant_id", controllers.asset.getAssetsFromPlant);

router.get("/assets", controllers.asset.getAllAssets);

router.get("/asset", controllers.asset.getAssetHierarchy);

/**
 * @api {get} /assetDetails/:psa_id Get Asset Details 
 * @apiDescription Gets Asset details for a single asset for details page
 * @apiName getAssetDetails
 * @apiGroup Asset
 *
 * @apiParam {String} psa_id Plant System Asset ID
 * @apiSuccess {String} -.plant_name Plant name of the asset
 * @apiSuccess {String} -.system_name System name of the asset
 * @apiSuccess {String} -.system_asset System Asset of the asset
 * @apiSuccess {String} -.parent_asset Parent Asset of the asset
 * @apiSuccess {String} -.plant_asset_instrument Asset Name of the asset
 * @apiSuccess {String} -.asset_type Asset Type of the asset
 * @apiSuccess {String} -.asset_description Description of the asset
 * @apiSuccess {String} -.asset_location location of the asset
 * @apiSuccess {String} -.brand Brand of the asset
 * @apiSuccess {String} -.model_number Model Number of the asset
 * @apiSuccess {String} -.technical_specs Technical_specs of the asset
 * @apiSuccess {String} -.manufacture_country Manufacture_country of the asset
 * @apiSuccess {String} -.warranty Warranty of the asset
 * @apiSuccess {String} -.remarks Remarks for the asset
 * @apiSuccess {String} -.uploaded_image Image of the asset
 * @apiSuccess {Jsonb} -.uploaded_files Files pertaining to the asset
 * @apiSuccess {String} -.plant_id Plant ID of the asset
 * @apiSuccess {String} -.system_id System ID of the asset
 * @apiSuccess {String} -.system_asset_id System Asset ID of the asset
 * @apiSuccess {Number} -.psa_id Psa ID of the asset
 * @apiSuccess {Number} -.system_asset_lvl5 System_asset_lvl5 of the asset
 * @apiSuccess {Number} -.system_asset_lvl6 System_asset_lvl6 of the asset
 * @apiSuccess {Number} -.system_asset_lvl7 System_asset_lvl7 of the asset

 */
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
 * @api {post} /addNewAsset Add New Asset
 * @apiDescription Adds a new asset
 * @apiName addNewAsset
 * @apiGroup Asset
 * @apiSuccess {number} -.system_id_lvl3 System id lvl3(System Asset) of the asset
 * @apiSuccess {number} -.system_asset_id_lvl4 System id lvl4(System Asset Name) of the asset
 * @apiSuccess {string} -.parent_asset Parent Asset of the asset
 * @apiSuccess {string} -.asset_type Asset Type of the asset
 * @apiSuccess {string} -.asset_description Description of the asset
 * @apiSuccess {string} -.asset_location location of the asset
 * @apiSuccess {string} -.brand Brand of the asset
 * @apiSuccess {string} -.plant_asset_instrument Asset Name of the asset
 * @apiSuccess {string} -.model_number Model Number of the asset
 * @apiSuccess {string} -.technical_specs Technical specs of the asset
 * @apiSuccess {string} -.manufacture_country Manufacture country of the asset
 * @apiSuccess {string} -.warranty Warranty of the asset
 * @apiSuccess {string} -.remarks Remarks for the asset
 * @apiSuccess {number} -.system_asset_lvl5 System_asset_lvl5 of the asset
 * @apiSuccess {number} -.system_asset_lvl6 System_asset_lvl6 of the asset
 * @apiSuccess {number} -.system_asset_lvl7 System_asset_lvl7 of the asset
 * @apiSuccess {string} -.uploaded_image Image of the asset
 * @apiSuccess {jsonb} -.uploaded_files Files pertaining to the asset
 * @apiSuccess {string} -.plant_id Plant ID of the asset
 *
 *
 */
router.post(
  "/asset/addNewAsset",
  checkIfLoggedInAPI,
  controllers.asset.addNewAsset
);

/**
 * @api {post} /editAsset Edit Asset
 * @apiDescription Edit an asset. Not allowed to edit hierarchy of the asset.
 * @apiGroup Asset

 * @apiSuccess {string} -.asset_description Description of the asset
 * @apiSuccess {string} -.asset_location location of the asset
 * @apiSuccess {string} -.brand Brand of the asset
 * @apiSuccess {string} -.plant_asset_instrument Asset Name of the asset
 * @apiSuccess {string} -.model_number Model Number of the asset
 * @apiSuccess {string} -.technical_specs Technical specs of the asset
 * @apiSuccess {string} -.manufacture_country Manufacture country of the asset
 * @apiSuccess {string} -.warranty Warranty of the asset
 * @apiSuccess {string} -.remarks Remarks for the asset
 * @apiSuccess {string} -.uploaded_image Image of the asset
 * @apiSuccess {jsonb} -.uploaded_files Files pertaining to the asset
 * 
 *
 */
router.post(
  "/asset/editAsset",
  checkIfLoggedInAPI,
  controllers.asset.editAsset
);

/**
 * @api {post} /deleteAsset Delete Asset
 * @apiDescription Delete an asset.
 * @apiGroup Asset
 * @apiSuccess {number} -.psa_id Psa ID of the asset
 *
 */
router.post(
  "/asset/deleteAsset",
  checkIfLoggedInAPI,
  controllers.asset.deleteAsset
);

/**
 * @api {post} /deactivateAsset Deactivate Asset
 * @apiDescription Deactivate an asset.
 * @apiGroup Asset
 * @apiSuccess {number} -.psa_id Psa ID of the asset
 *
 */
router.post(
  "/asset/deactivateAsset",
  checkIfLoggedInAPI,
  controllers.asset.deactivateAsset
);

/**
 * @api {get} /fetchSystemAsset Gets all system assets(lvl 5) for the asset table
 * @apiDescription Gets all the system assets to display on the asset table
 * @apiName fetchSystemAsset
 * @apiGroup Asset
 * @apiSuccess {string} -.system_asset System Assets
 * @apiSuccess {nukber} -.system_asset_id System Asset IDs
 *
 */
router.get(
  "/asset/system/:system_id",
  checkIfLoggedInAPI,
  controllers.asset.fetchSystemAssets
);

/**
 * @api {get} /fetchSystemAssetNames Gets all system asset names(lvl 6) for the asset table
 * @apiDescription Gets all the system asset names to display on the asset table
 * 
 * @apiName fetchSystemAssetName
 * @apiGroup Asset
 * @apiSuccess {string} -.system_asset_lvl6 System Asset Names
 *
 */
router.get(
  "/asset/system/:plant_id/:system_id/:system_asset_id",
  checkIfLoggedInAPI,
  controllers.asset.fetchSystemAssetNames
);
/**
 * @api {get} /fetchSubComponent1Names Gets all Sub-Component-1 Names(lvl 7) for the asset table
 * @apiDescription Gets all the Component names to display on the asset table
 * @apiName fetchSubComponent1Names
 * @apiGroup Asset
 * @apiSuccess {string} -.system_asset_lvl7 Component Names
 *
 */
router.get(
  "/asset/system/:plant_id/:system_id/:system_asset_id/:system_asset_name_id",
  checkIfLoggedInAPI,
  controllers.asset.fetchSubComponent1Names
);
/**
 * @api {get} /fetchAssetHistory Gets History of the asset 
 * @apiDescription Retrieves Asset History when viewing the asset details page
 * @apiName fetchAssetHistory
 * @apiGroup Asset
 * @apiSuccess {string} -.history_id History ID of the asset
 * @apiSuccess {string} -.action What was changed of the asset
 * @apiSuccess {string} -.name User who changed the Asset
 * @apiSuccess {string} -.date Date of the change
 * @apiSuccess {string} -.fields Which particular fields that were changed

 *
 */
router.get(
  "/asset/history/:psa_Id",
  checkIfLoggedInAPI,
  controllers.asset.fetchAssetHistory
);

/**
 * @api {GET} /asset/mobile/:plant_id Get Systems
 * @apiDescription Gets all the systems in a specific plant
 * @apiName GetSystemsFromPlant
 * @apiGroup Assets Mobile
 *
 * @apiParam {Number} plant_id The ID of the Plant
 *
 * @apiSuccess {Object[]} - Containing all the system objects
 * @apiSuccess {string} -.system_name System Name
 * @apiSuccess {integer} -.system_id System ID
 *
 */

router.get(
  "/asset/mobile/:plant_id",
  checkIfLoggedInAPI,
  controllers.asset.getSystemsFromPlant
);

/**
 * @api {GET} /asset/mobile/:plant_id/:system_id Get System Assets
 * @apiDescription Gets all the systems assets of a specific plant and system
 * @apiName GetSystemsAssetsFromPlant
 * @apiGroup Assets Mobile
 *
 * @apiParam {Number} plant_id The ID of the Plant
 * @apiParam {Number} system_id The ID of the System
 *
 * @apiSuccess {Object[]} - Containing all the system asset objects
 * @apiSuccess {string} -.system_asset_lvl5 System Asset
 *
 */

router.get(
  "/asset/mobile/:plant_id/:system_id",
  checkIfLoggedInAPI,
  controllers.asset.getSystemAssetsFromPlant
);

/**
 * @api {GET} /asset/mobile/:psa_id/uploadedFile/:index Get Uploaded File
 * @apiDescription Gets a file from an array of files uploaded for an asset
 * @apiName GetUploadedFile
 * @apiGroup Assets Mobile
 *
 * @apiParam {Number} psa_id The ID of the Plant Sytem Asset
 * @apiParam {Number} index The index of the file in the array of uploaded files
 *
 * @apiSuccess {Buffer[]} - Contains file in buffer array format
 *
 */

router.get(
  "/asset/mobile/:psa_id/uploadedFile/:index",
  controllers.asset.getUploadedFile
);

/**
 * @api {GET} /asset/mobile/:plant_id/:system_id/:system_asset_id Get System Asset Names
 * @apiDescription Gets all the systems asset names of an asset with a specific plant, system and system asset
 * @apiName GetSystemsAssetNamesFromPlant
 * @apiGroup Assets Mobile
 *
 * @apiParam {Number} plant_id The ID of the Plant
 * @apiParam {Number} system_id The ID of the System
 * @apiParam {String} system_asset_id The name of the System Asset
 *
 * @apiSuccess {Object} -
 * @apiSuccess {Object} -.dict An object containing all the assets whose parent asset is NOT THE SAME as their asset types with the key being the asset's asset type
 * @apiSuccess {Object[]} -.dict.assetType Contains all the assets with the same asset types
 * @apiSuccess {String} -.dict.assetTypes.pai Plant Asset Instrument
 * @apiSuccess {Number} -.dict.assetTypes.psa_id Plant Asset ID
 * @apiSuccess {Object[]} -.pai All the assets whose parent asset is the SAME as their asset types
 * @apiSuccess {String} -.pai.pai Plant Asset Instrument
 * @apiSuccess {String} -.pai.prev_level Previous level of the asset
 * @apiSuccess {String} -.pai.psa_id Plant Asset ID
 *
 */

router.get(
  "/asset/mobile/:plant_id/:system_id/:system_asset_id",
  checkIfLoggedInAPI,
  controllers.asset.getSystemAssetNamesFromPlant
);

/**
 * @api {GET} /asset/mobile/:plant_id/:system_id/:system_asset_id/:system_asset_name Get Sub Components
 * @apiDescription Gets all the subcomponents of an asset with the provided parameters
 * @apiName GetSubComponentsFromPlant
 * @apiGroup Assets Mobile
 *
 * @apiParam {Number} plant_id The ID of the Plant
 * @apiParam {Number} system_id The ID of the System
 * @apiParam {String} system_asset_id The name of the System Asset
 * @apiParam {String} system_asset_name The name of the System Asset Name
 *
 * @apiSuccess {Object} -
 * @apiSuccess {Object} -.dict An object containing all the assets whose parent asset is NOT THE SAME as their asset types with the key being the asset's asset type
 * @apiSuccess {Object[]} -.dict.assetType Contains all the assets with the same asset types
 * @apiSuccess {String} -.dict.assetTypes.pai Plant Asset Instrument
 * @apiSuccess {Number} -.dict.assetTypes.psa_id Plant Asset ID
 * @apiSuccess {Object[]} -.pai All the assets whose parent asset is the SAME as their asset types
 * @apiSuccess {String} -.pai.pai Plant Asset Instrument
 * @apiSuccess {String} -.pai.prev_level Previous level of the asset
 * @apiSuccess {String} -.pai.psa_id Plant Asset ID
 * @apiSuccess {Object[]} -.subComponents Contains all the assets that have a sub component 2 level
 * @apiSuccess {String} -.subComponents.system_asset_lvl7 Sub Component 2
 *
 */

router.get(
  "/asset/mobile/:plant_id/:system_id/:system_asset_id/:system_asset_name",
  checkIfLoggedInAPI,
  controllers.asset.getSubComponentsFromPlant
);

/**
 * @api {get} /master/new Get Table Metadata
 * @apiDescription Gets table information/metadata. Mainly used for the creation of new entries in those tables
 * @apiExample 1
 * "plant": {
		"internalName": "plant_master",
		"name": "Plant",
		"id": "plant_id",
		"fields": [{
			"column_label": "Name",
			"column_name": "plant_name"
		},{
			"column_label": "Description",
			"column_name": "plant_description"
		}]
	}
 * @apiExample 2
 *"system_assets": {
		"internalName": "system_assets",
		"name": "System Assets",
		"id": "plant_id",
		"fields": [{
			"column_label": "System",
			"column_name": "system_id",
			"type" : "dropdown",
			"url" : "/api/asset/systems",
			"value" : "system_id",
			"options" : "system_name"
		},{
			"column_label": "System Asset",
			"column_name": "system_asset"
		}]
	}
 * @apiName FetchMasterTypeEntry
 * @apiGroup Master
 *
 * @apiSuccess {Object}  -.data Object which contains multiple objects with the key being the table name and the value being the table metadata
 * @apiSuccess {String} -.data.key Table name
 * @apiSuccess {Object} -.data.value Object which has table metadata
 * @apiSuccess {String} -.data.value.internalName Internal name of the table
 * @apiSuccess {String} -.data.value.name Name of the table
 * @apiSuccess {String} -.data.value.id unique ID of the rows in the table
 * @apiSuccess {Object[]} -.data.value.fields Array of objects which contains the column name and column label of the table
 * @apiSuccess {String} -.data.value.fields.column_label Column label of the table
 * @apiSuccess {String} -.data.value.fields.column_name Column name of the table
 * @apiSuccess {String} [-.data.value.fields.type] Type of the column (Eg. dropdown, boolean_dropdown) 
 * @apiSuccess {String} [-.data.value.fields.url] URL to fetch dropdown options for dropdown type only (Example 2)
 * @apiSuccess {String} [-.data.value.fields.value] Value of the dropdown option for dropdown type only (Example 2)
 * @apiSuccess {String} [-.data.value.fields.options] Options of the dropdown option for dropdown type only (Example 2)
 * 
 */
router.get(
  "/master/new",
  checkIfLoggedInAPI,
  controllers.master.fetchMasterTypeEntry
);

/**
 * @api {post} /master/new/add Add Table Metadata
 * @apiDescription Adds table information/metadata. Mainly used for the creation of new entries in those tables
 * @apiName CreateMasterTypeEntry
 * @apiGroup Master
 *
 *
 * @apiSuccess {Object} -.data Object which contains multiple objects with the key being the table name and the value being the table metadata
 * @apiSuccess {String} -.data.key Table name
 * @apiSuccess {Object} -.data.value Object which has table metadata
 * @apiSuccess {String} -.data.value.internalName Internal name of the table
 * @apiSuccess {String} -.data.value.name Name of the table
 * @apiSuccess {String} -.data.value.id unique ID of the rows in the table
 * @apiSuccess {Object[]} -.data.value.fields Array of objects which contains the column name and column label of the table
 * @apiSuccess {String} -.data.value.fields.column_label Column label of the table
 * @apiSuccess {String} -.data.value.fields.column_name Column name of the table
 * @apiSuccess {String} [-.data.value.fields.type] Type of the column (Eg. dropdown, boolean_dropdown)
 * @apiSuccess {String} [-.data.value.fields.url] URL to fetch dropdown options for dropdown type only (Example 2)
 * @apiSuccess {String} [-.data.value.fields.value] Value of the dropdown option for dropdown type only (Example 2)
 * @apiSuccess {String} [-.data.value.fields.options] Options of the dropdown option for dropdown type only (Example 2)
 *
 */
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

/**
 * @api {get} /timeline/:id Get Timeline Details
 * @apiDescription Get Timeline Details based on given timeline ID
 * @apiName getTimeline
 * @apiGroup Schedule
 *
 * @apiParam {String} id timeline ID
 *
 * @apiSuccess {Object} - Object containing the specified schedule detail
 * @apiSuccess {Number} -.id Timeline ID
 * @apiSuccess {String} -.name Timeline Name
 * @apiSuccess {String} -.description Timeline Description
 * @apiSuccess {Number} -.status Schedule Status
 * @apiSuccess {Number} -.plantId Plant ID of Plant assocaited with timeline
 * @apiSuccess {String} -.plantName Plant Name of Plant associated with timeline
 *
 * @apiError (Error 404) {Object} NotFound {message: "No timeline found"}
 */

/**
 * @api {post} /timeline Create new Timeline
 * @apiDescription Create new Timeline
 * @apiName CreateNewTimeline
 * @apiGroup Schedule
 *
 * @apiBody {Object} data New Timeline Data
 * @apiBody {String} data.name Timeline Name
 * @apiBody {String} data.description Timeline Description
 * @apiBody {Number} data.plantId Plant ID of Plant associated with timeline
 *
 * @apiSuccess {Number} - Timeline ID of new timeline
 *
 */

/**
 * @api {patch} /timeline/:id Edit specific schedule
 * @apiDescription Edit specific timeline based on given timeline ID
 * @apiName EditTimeline
 * @apiGroup Schedule
 *
 * @apiParam {String} id Timeline ID
 *
 * @apiBody {Object} data New Timeline Data
 * @apiBody {String} data.name Timeline Name
 * @apiBody {String} data.description Timeline Description
 *
 * @apiSuccess {Number} - Timeline ID of updated timeline
 */

/**
 * @api {delete} /timeline/:id Delete specific timeline
 * @apiDescription Delete specific timeline based on given timeline ID
 * @apiName DeleteTimeline
 * @apiGroup Schedule
 *
 * @apiParam {String} id Timeline ID
 *
 * @apiSuccess {String} - "success"
 */
router
  .route("/timeline/:id?", checkIfLoggedInAPI)
  .get(controllers.schedule.getTimeline)
  .post(controllers.schedule.createTimeline)
  .patch(controllers.schedule.editTimeline)
  .delete(controllers.schedule.deleteTimeline);

/**
 * @api {get} /timeline/schedules/:id Get Schedules of a Timeline
 * @apiDescription Get all Schedules of a given Timeline
 * @apiName GetSchedulesofTimeline
 * @apiGroup Schedule
 *
 * @apiParam {String} id Timeline ID
 *
 * @apiSuccess {Object[]} - Schedule Array
 * @apiSuccess {Number} -.schedule_id Schedule ID
 * @apiSuccess {Number} -.timeline_id Timeline ID
 * @apiSuccess {String} -.checklist_name Schedule Name (Schedule is a form of checklist)
 * @apiSuccess {String} -.plant Plant Name of plant associated with Timeline
 * @apiSuccess {Number} -.plantId Plant ID of plant associated with Timeline
 * @apiSuccess {String} -.start_date Start Date of Schedule
 * @apiSuccess {String} -.end_date End Date of Schedule
 * @apiSuccess {Number} -.period Recurrence Period of Schedule
 * @apiSuccess {String[]} -.calendar_dates Array of Calendar Dates
 * @apiSuccess {Number} -.checklist_id Checklist Template ID
 * @apiSuccess {Number[]} -.assigned_ids IDs of assigned users of Schedule Checklist
 * @apiSuccess {String[]} -.assigned_usernames Usernames of assigned users of Schedule Checklist
 * @apiSuccess {String[]} -.assigned_fnames First Names of assigned users of Schedule Checklist
 * @apiSuccess {String[]} -.assigned_lnames Last Names of assigned users of Schedule Checklist
 * @apiSuccess {String[]} -.assigned_roles Roles of assigned users of Schedule Checklist
 * @apiSuccess {String[]} -.assigned_emails Emails of assigned users of Schedule Checklist
 * @apiSuccess {String} -.remarks Remarks of Schedule Checklist
 * @apiSuccess {Number[]} -.exclusionList a list of dates to be excluded due to a possible change of date
 * @apiSuccess {Boolean} -.isSingle Represents whether this is the only schedule in the timeline
 * @apiSuccess {Number} -.index Index of Schedule
 * @apiSuccess {Number} -.prev_schedule_id Previous Schedule ID
 * @apiSuccess {Number} -.status Schedule Checklist Status
 */
router
  .route("/timeline/schedules/:id")
  .get(controllers.schedule.getSchedulesTimeline);

/**
 * @api {get} /timeline/status/:status/:id Get Timelines by Status
 * @apiDescription Get Timelines by Status and User Created (optional)
 * @apiName GetTimelinesByStatus
 * @apiGroup Schedule
 *
 * @apiParam {String} status Status to filter Timelines
 * @apiParam {String} [id] User ID of the creator of timeline
 *
 * @apiSuccess {Object[]} - Filtered Timeline Array
 * @apiSuccess {Number} -.id Timeline ID
 * @apiSuccess {String} -.name Timeline Name
 * @apiSuccess {String} -.description Timeline Description
 * @apiSuccess {Number} -.plant_id ID of the plant associated with timeline
 * @apiSuccess {String} -.plant_name Name of the plant associated with timeline
 * @apiSuccess {Number} -.status Status of Timeline
 *
 * @apiError (Error 404) {Object} NotFound {message: "No timeline found"}
 */

/**
 * @api {patch} /timeline/status/:status/:id Update Timeline Status
 * @apiDescription Update Timeline Status
 * @apiName UpdateTimeline
 * @apiGroup Schedule
 *
 * @apiParam {String} status Status to filter Timelines
 * @apiParam {String} id Timeline ID
 *
 * @apiBody {String} test "random"
 *
 * @apiSuccess {Number} - Timeline ID
 */
router
  .route("/timeline/status/:status/:id?", checkIfLoggedInAPI)
  .get(controllers.schedule.getTimelineByStatus)
  .patch(controllers.schedule.changeTimelineStatus);

/**
 * @api {get} /timeline_drafts Get Timeline Drafts
 * @apiDescription Get Timeline Drafts
 * @apiName GetTimelineDrafts
 * @apiGroup Schedule
 * 
 * @apiSuccess {Object} - Object containing Timeline Drafts Array and side information
 * @apiSuccess {Object[]} -.rows Timeline Drafts Array
 * @apiSuccess {Number} -.rows.id Timeline ID
 * @apiSuccess {String} -.rows.name Timeline Name
 * @apiSuccess {String} -.rows.description Timeline Description
 * @apiSuccess {Number} -.rows.plantId Plant ID
 * @apiSuccess {String} -.rows.plantName Plant Name
 * @apiSuccess {String} -.rows.status Timeline Status (Should be "DRAFT")
 * @apiSuccess {String} -.rows.created_date Timeline Creation Date and Time
 * @apiSuccess {String} -.rows.remarks Remarks
 * @apiSuccess {Number} -.totalPages Total Pages
 * 
 * @apiError (Error 500) {String} InternalServerError
 */
router.get(
  "/timeline_drafts",
  checkIfLoggedInAPI,
  controllers.schedule.getScheduleDrafts
);

/**
 * @api {get} /timeline_pending Get Pending Timelines
 * @apiDescription Get Timelines that are Pending or Pending Cancellation
 * @apiName GetPendingTimelines
 * @apiGroup Schedule
 * 
 * @apiSuccess {Object} - Object containing Timeline Array and side information
 * @apiSuccess {Object[]} -.rows Timeline Array
 * @apiSuccess {Number} -.rows.id Timeline ID
 * @apiSuccess {String} -.rows.name Timeline Name
 * @apiSuccess {String} -.rows.description Timeline Description
 * @apiSuccess {Number} -.rows.plantId Plant ID
 * @apiSuccess {String} -.rows.plantName Plant Name
 * @apiSuccess {String} -.rows.status Timeline Status (Should be "PENDING" or "PENDING CANCELLED")
 * @apiSuccess {String} -.rows.created_date Timeline Creation Date and Time
 * @apiSuccess {Object[]} -.rows.activity_log Activity Log of Timeline
 * @apiSuccess {String} -.rows.remarks Remarks
 * @apiSuccess {Number} -.totalPages Total Pages
 * 
 * @apiError (Error 500) {String} InternalServerError
 */
router.get(
  "/timeline_pending",
  checkIfLoggedInAPI,
  controllers.schedule.getPendingTimelines
);

/**
 * @api {get} /timeline_approved Get Approved Timelines
 * @apiDescription Get Approved Timelines
 * @apiName GetAppovedTimelines
 * @apiGroup Schedule
 * 
 * @apiSuccess {Object} - Object containing Timeline Array and side information
 * @apiSuccess {Object[]} -.rows Timeline Array
 * @apiSuccess {Number} -.rows.id Timeline ID
 * @apiSuccess {String} -.rows.name Timeline Name
 * @apiSuccess {String} -.rows.description Timeline Description
 * @apiSuccess {Number} -.rows.plantId Plant ID
 * @apiSuccess {String} -.rows.plantName Plant Name
 * @apiSuccess {String} -.rows.status Timeline Status (Should be "APPROVED" or "CANCELLED" or "REJECTED CANCELLED")
 * @apiSuccess {String} -.rows.created_date Timeline Creation Date and Time
 * @apiSuccess {String} -.rows.remarks Remarks
 * @apiSuccess {Object[]} -.rows.activity_log Activity Log of Timeline
 * @apiSuccess {Number} -.totalPages Total Pages
 * 
 * @apiError (Error 500) {String} InternalServerError
 */
router.get(
  "/timeline_approved",
  checkIfLoggedInAPI,
  controllers.schedule.getApprovedTimelines
);

/**
 * @api {get} /timeline_completed Get Completed Timelines
 * @apiDescription Get Timelines that are Completed
 * @apiName GetCompletedTimelines
 * @apiGroup Schedule
 * 
 * @apiSuccess {Object} - Object containing Timeline Array and side information
 * @apiSuccess {Object[]} -.rows Timeline Array
 * @apiSuccess {Number} -.rows.id Timeline ID
 * @apiSuccess {String} -.rows.name Timeline Name
 * @apiSuccess {String} -.rows.description Timeline Description
 * @apiSuccess {Number} -.rows.plantId Plant ID
 * @apiSuccess {String} -.rows.plantName Plant Name
 * @apiSuccess {String} -.rows.status Timeline Status (Should be "COMPLETED")
 * @apiSuccess {String} -.rows.created_date Timeline Creation Date and Time
 * @apiSuccess {String} -.rows.remarks Remarks
 * @apiSuccess {Number} -.totalPages Total Pages
 * 
 * @apiError (Error 500) {String} InternalServerError
 */
router.get(
  "/timeline_completed",
  checkIfLoggedInAPI,
  controllers.schedule.getCompletedTimelines
);

/**
 * @api {get} /getAssignedUsers/:plant_id Get Assigned Users by Plant ID
 * @apiDescription Get Assigned Users by Plant ID
 * @apiName GetAssignedUsersByPlantID
 * @apiGroup Schedule
 * 
 * @apiParam {Number} plant_id Plant ID
 * 
 * @apiSuccess {Object[]} - Object Array containing Assigned Users
 * @apiSuccess {Number} -.id User's ID
 * @apiSuccess {Number} -.role_id User Role ID
 * @apiSuccess {String} -.role_name User's Role Name
 * @apiSuccess {String} -.email User Email
 * @apiSuccess {String} -.fname User's First Name
 * @apiSuccess {String} -.lname User's Last Name 
 * @apiSuccess {String} -.username User's username
 * 
 * @apiError (Error 201) {String} EmptyList "No Operators Added"
 */
router.get(
  "/getAssignedUsers/:plant_id",
  checkIfLoggedInAPI,
  controllers.schedule.getOpsAndEngineers
);

/**
 * @api {post} /insertSchedule Insert new Schedule Checklist
 * @apiDescription Insert New Schedule Checklist
 * @apiName InsertNewSchedule
 * @apiGroup Schedule
 *
 * @apiBody {Object} schedule Schedule
 * @apiBody {Number} schedule.checklistId Checklist ID of Schedule
 * @apiBody {String} schedule.remarks Schedule Remarks
 * @apiBody {Number} schedule.recurringPeriod Schedule Recurrence Period
 * @apiBody {Number} schedule.reminderRecurrence Schedule Reminder Recurrence
 * @apiBody {String} schedule.assignedIds IDs of assigned users of Schedule Checklist
 * @apiBody {Number} schedule.plantId Plant ID of plant associated with Timeline
 * @apiBody {Number} schedule.timelindId Timeline ID of Schedule Checklist
 * @apiBody {Number} [schedule.prevId] prev ID of Schedule
 * @apiBody {Number} [schedule.status] Status of Schedule Checklist
 * @apiBody {Number} [schedule.index] Schedule Checklist Index
 *
 * @apiSuccess {String} - "success"
 */
router.post(
  "/insertSchedule",
  checkIfLoggedInAPI,
  controllers.schedule.insertSchedule
);

/**
 * @api {patch} /updateSchedule Update existing Schedule Checklist
 * @apiDescription Update existing Schedule Checklist
 * @apiName UpdateExistingSchedule
 * @apiGroup Schedule
 *
 * @apiBody {Object} schedule Schedule
 * @apiBody {Number} schedule.checklistId Checklist ID of Schedule
 * @apiBody {String} schedule.remarks Schedule Remarks
 * @apiBody {Number} schedule.recurringPeriod Schedule Recurrence Period
 * @apiBody {Number} schedule.reminderRecurrence Schedule Reminder Recurrence
 * @apiBody {String} schedule.assignedIds IDs of assigned users of Schedule Checklist
 * @apiBody {Number} schedule.timelindId Timeline ID of Schedule Checklist
 * @apiBody {Number} schedule.plantId Plant ID of plant associated with Timeline
 * @apiBody {Number} [schedule.prevId] prev ID of Schedule
 * @apiBody {number} schedule.scheduleId Schedule ID
 *
 * @apiSuccess {String} Success "Schedule successfully updated"
 * @apiError (Error 500) {String} InternalServerError "unable to update schedule"
 */
router.patch(
  "/updateSchedule",
  checkIfLoggedInAPI,
  controllers.schedule.updateSchedule
);

/**
 * @api {delete} /schedule/:id Delete a Schedule
 * @apiDescription Delete a Schedule given a Schedule ID
 * @apiName DeleteSchedule
 * @apiGroup Schedule
 *
 * @apiParam {String} id Schedule ID
 *
 * @apiSuccess {String} Success "Schedule successfully deleted"
 */

/**
 * @api {get} /schedule/:id Get All Schedules or Plant Specific Schedules
 * @apiDescription Get All Schedules or Plant Specific Schedules
 * @apiName GetPlantSpecificSchedules
 * @apiGroup Schedule
 *
 * @apiParam {String} id Plant ID (0 for All Schedules)
 *
 * @apiSuccess {Object[]} - Schedule Array
 * @apiSuccess {Number} -.schedule_id Schedule ID
 * @apiSuccess {Number} -.timeline_id Timeline ID
 * @apiSuccess {String} -.checklist_name Schedule Name (Schedule is a form of checklist)
 * @apiSuccess {String} -.plant Plant Name of plant associated with Timeline
 * @apiSuccess {Number} -.plantId Plant ID of plant associated with Timeline
 * @apiSuccess {String} -.start_date Start Date of Schedule
 * @apiSuccess {String} -.end_date End Date of Schedule
 * @apiSuccess {Number} -.period Recurrence Period of Schedule
 * @apiSuccess {String[]} -.calendar_dates Array of Calendar Dates
 * @apiSuccess {Number} -.checklist_id Checklist Template ID
 * @apiSuccess {String} -.assigned_ids IDs of assigned users of Schedule Checklist
 * @apiSuccess {String[]} -.assigned_usernames Usernames of assigned users of Schedule Checklist
 * @apiSuccess {String[]} -.assigned_fnames First Names of assigned users of Schedule Checklist
 * @apiSuccess {String[]} -.assigned_lnames Last Names of assigned users of Schedule Checklist
 * @apiSuccess {String[]} -.assigned_roles Roles of assigned users of Schedule Checklist
 * @apiSuccess {String[]} -.assigned_emails Emails of assigned users of Schedule Checklist
 * @apiSuccess {String} -.remarks Remarks of Schedule Checklist
 * @apiSuccess {String} -.exclusionList a list of dates to be excluded due to a possible change of date
 * @apiSuccess {Boolean} -.isSingle Represents whether this is the only schedule in the timeline
 * @apiSuccess {Number} -.index Index of Schedule
 * @apiSuccess {Number} -.prev_schedule_id Previous Schedule ID
 * @apiSuccess {Number} -.status Schedule Checklist Status
 */

router
  .route("/schedule/:id", checkIfLoggedInAPI)
  .delete(controllers.schedule.deleteSchedule)
  .get(controllers.schedule.getViewSchedules);

/**
 * @api {get} /event Get all Pending Schedule Checklists
 * @apiDescription Get all Pending Schedule Checklists
 * @apiName GetPendingSchedule
 * @apiGroup Schedule
 *
 * @apiSuccess {Object[]} - Array of Pending Schedule Checklists
 * @apiSuccess {Number} -.id Schedule Checklist ID
 * @apiSuccess {String} -.name Schedule Checklist Name
 * @apiSuccess {Number} -.plantId ID of plant associated with Schedule Checklist
 * @apiSuccess {String} -.description Schedule Checklist Description
 * @apiSuccess {Number} -. Schedule Timeline ID
 * @apiSuccess {String} -.checklistName Schedule Checklist TEMPLATE Name
 *
 * @apiError (Error 404) {String} NotFound "No pending schedules"
 */

router
  .route("/event/:schedule_id?/:index?/", checkIfLoggedInAPI)
  .get(controllers.schedule.getPendingSingleEvents)
  // .post(controllers.schedule.createSingleEvent)
  .patch(controllers.schedule.manageSingleEvent)
  .delete();

/**
 * @api {get} /schedule/event/:id Get Schedule by ID
 * @apiDescription Get schedule by ID
 * @apiName getScheduleByID
 * @apiGroup Schedule
 *
 * @apiParam {number} id Schedule Id
 *
 * @apiSuccess {Object} schedule Schedule
 * @apiSuccess {Number} schedule.schedule_id ID of Schedule
 * @apiSuccess {String} schedule.start_date Date and time of start Date
 * @apiSuccess {String} schedule.end_date Date and time of end date
 * @apiSuccess {String} schedule.recurrence_period Date and Time of recurrance period
 *
 */

router.get(
  "/schedule/event/:id",
  checkIfLoggedInAPI,
  controllers.schedule.getScheduleById
);

/**
 * @api {post} /feedback/ Create Feedback
 * @apiDescription Create new Feedback
 * @apiName CreateFeedback
 * @apiGroup Feedback
 *
 * @apiBody {Object} - Feedback Object
 * @apiBody {String} -.name Name of user who gave the feedback
 * @apiBody {String} -.comments Feedback Comments by the user
 * @apiBody {Number} -.taggedLocID Location ID
 * @apiBody {String} -.image base64 encoded string of image
 * @apiBody {Number} -.plantID Plant ID
 * @apiBody {String} -.email Email of user who created the feedback
 * @apiBody {Object} -.contact Contact Information
 * @apiBody {String} -.contact.number Contact Number, will be empty if not provided or user is Internal User
 * @apiBody {Number} -.contact.whatsapp Contact Method of Whatsapp, 0 if No, 1 if Yes
 * @apiBody {Number} -.contact.telegram Contact Method of Telegram, 0 if No, 1 if Yes
 *
 * @apiSuccess {String} Success "New feedback created successfully"
 *
 * @apiError (Error 500) {String} InternalServerError "Failure to create feedback"
 */
router.post("/feedback", controllers.feedbackKnex.createFeedback);

/**
 * @api {get} /feedback/pending Get Pending Feedback
 * @apiDescription Get Pending Feedback
 * @apiName GetPendingFeedback
 * @apiGroup Feedback
 *
 * @apiSuccess {Object} - Data Object
 * @apiSuccess {Object[]} -.rows Array of Pending Feedback
 * @apiSuccess {Number} -.rows.id Feedback ID
 * @apiSuccess {Number} -.rows.plant_loc_id Plant Location ID
 * @apiSuccess {Number} -.rows.plant_id Plant ID
 * @apiSuccess {String} -.rows.description Feedback Description
 * @apiSuccess {Object} -.contact Contact Information
 * @apiSuccess {String} -.rows.contact.number Contact Number, will be empty if not provided or user is Internal User
 * @apiSuccess {Number} -.rows.contact.whatsapp Contact Method of Whatsapp, 0 if No, 1 if Yes
 * @apiSuccess {Number} -.rows.contact.telegram Contact Method of Telegram, 0 if No, 1 if Yes
 * @apiSuccess {String} -.rows.image base64 eoncded string of image
 * @apiSuccess {String} -.rows.status_id Status ID (1 for Pending)
 * @apiSuccess {String} -.rows.status Status of Feedback ("PENDING")
 * @apiSuccess {String} -.rows.activity_log Activity Log of Feedback
 * @apiSuccess {String} -.rows.createdByUser Name of user who created feedback ("Guest" if external)
 * @apiSuccess {String} -.rows.assigned_user_name Name of assignee
 * @apiSuccess {Number} -.rows.assigned_user_id ID of assignee
 * @apiSuccess {String} -.rows.loc_room Location Room
 * @apiSuccess {String} -.rows.loc_floor Location Floor
 * @apiSuccess {String} -.rows.plant_name
 * @apiSuccess {String} -.rows.created_date Date of Feedback Creation
 * @apiSuccess {Number} -.total Total Pages
 *
 * @apiError (Status Code 204) {Object} Empty {msg: "No Feedback"}
 * @apiError (Error 500) {Object} InternalServerError {msg: error}
 *
 */
router.get(
  "/feedback/pending",
  checkIfLoggedInAPI,
  controllers.feedbackKnex.fetchPendingFeedback
);

router.get(
  "/feedback/pending/:plant/:datetype/:date",
  checkIfLoggedInAPI,
  controllers.feedbackKnex.fetchPendingFeedback
);

/**
 * @api {get} /feedback/assigned Get Assigned Feedback
 * @apiDescription Get Assigned Feedback
 * @apiName GetAssignedFeedback
 * @apiGroup Feedback
 *
 * @apiSuccess {Object} - Data Object
 * @apiSuccess {Object[]} -.rows Array of Assigned Feedback
 * @apiSuccess {Number} -.rows.id Feedback ID
 * @apiSuccess {Number} -.rows.plant_loc_id Plant Location ID
 * @apiSuccess {Number} -.rows.plant_id Plant ID
 * @apiSuccess {String} -.rows.description Feedback Description
 * @apiSuccess {Object} -.contact Contact Information
 * @apiSuccess {String} -.rows.contact.number Contact Number, will be empty if not provided or user is Internal User
 * @apiSuccess {Number} -.rows.contact.whatsapp Contact Method of Whatsapp, 0 if No, 1 if Yes
 * @apiSuccess {Number} -.rows.contact.telegram Contact Method of Telegram, 0 if No, 1 if Yes
 * @apiSuccess {String} -.rows.image base64 eoncded string of image
 * @apiSuccess {String} -.rows.status_id Status ID (2 for ASSIGNED, 3 for REASSIGNED)
 * @apiSuccess {String} -.rows.status Status of Feedback ("ASSIGNED" or "REASSIGNED")
 * @apiSuccess {String} -.rows.activity_log Activity Log of Feedback
 * @apiSuccess {String} -.rows.createdByUser Name of user who created feedback ("Guest" if external)
 * @apiSuccess {String} -.rows.assigned_user_name Name of assignee
 * @apiSuccess {Number} -.rows.assigned_user_id ID of assignee
 * @apiSuccess {String} -.rows.loc_room Location Room
 * @apiSuccess {String} -.rows.loc_floor Location Floor
 * @apiSuccess {String} -.rows.plant_name
 * @apiSuccess {String} -.rows.created_date Date of Feedback Creation
 * @apiSuccess {Number} -.total Total Pages
 *
 * @apiError (Status Code 204) {Object} Empty {msg: "No Feedback"}
 * @apiError (Error 500) {Object} InternalServerError {msg: error}
 *
 */
router.get(
  "/feedback/assigned",
  checkIfLoggedInAPI,
  controllers.feedbackKnex.fetchAssignedFeedback
);

router.get(
  "/feedback/assigned/:plant/:datetype/:date",
  checkIfLoggedInAPI,
  controllers.feedbackKnex.fetchAssignedFeedback
);

/**
 * @api {get} /feedback/outstanding Get Outstanding Feedback
 * @apiDescription Get Outstanding Feedback
 * @apiName GetOutstandingFeedback
 * @apiGroup Feedback
 *
 * @apiSuccess {Object} - Data Object
 * @apiSuccess {Object[]} -.rows Array of Assigned Feedback
 * @apiSuccess {Number} -.rows.id Feedback ID
 * @apiSuccess {Number} -.rows.plant_loc_id Plant Location ID
 * @apiSuccess {Number} -.rows.plant_id Plant ID
 * @apiSuccess {String} -.rows.description Feedback Description
 * @apiSuccess {Object} -.contact Contact Information
 * @apiSuccess {String} -.rows.contact.number Contact Number, will be empty if not provided or user is Internal User
 * @apiSuccess {Number} -.rows.contact.whatsapp Contact Method of Whatsapp, 0 if No, 1 if Yes
 * @apiSuccess {Number} -.rows.contact.telegram Contact Method of Telegram, 0 if No, 1 if Yes
 * @apiSuccess {String} -.rows.image base64 eoncded string of image
 * @apiSuccess {String} -.rows.status_id Status ID (2 for ASSIGNED, 3 for REASSIGNED)
 * @apiSuccess {String} -.rows.status Status of Feedback ("ASSIGNED" or "REASSIGNED")
 * @apiSuccess {String} -.rows.activity_log Activity Log of Feedback
 * @apiSuccess {String} -.rows.createdByUser Name of user who created feedback ("Guest" if external)
 * @apiSuccess {String} -.rows.assigned_user_name Name of assignee
 * @apiSuccess {Number} -.rows.assigned_user_id ID of assignee
 * @apiSuccess {String} -.rows.loc_room Location Room
 * @apiSuccess {String} -.rows.loc_floor Location Floor
 * @apiSuccess {String} -.rows.plant_name
 * @apiSuccess {String} -.rows.created_date Date of Feedback Creation
 * @apiSuccess {Number} -.total Total Pages
 *
 * @apiError (Status Code 204) {Object} Empty {msg: "No Feedback"}
 * @apiError (Error 500) {Object} InternalServerError {msg: error}
 *
 */
router.get(
  "/feedback/outstanding",
  checkIfLoggedInAPI,
  controllers.feedbackKnex.fetchOutstandingFeedback
);

router.get(
  "/feedback/outstanding/:plant/:datetype/:date",
  checkIfLoggedInAPI,
  controllers.feedbackKnex.fetchOutstandingFeedback
);

/**
 * @api {get} /feedback/completed Get Completed Feedback
 * @apiDescription Get Completed Feedback
 * @apiName GetCompletedFeedback
 * @apiGroup Feedback
 *
 * @apiSuccess {Object} - Data Object
 * @apiSuccess {Object[]} -.rows Array of Completed Feedback
 * @apiSuccess {Number} -.rows.id Feedback ID
 * @apiSuccess {Number} -.rows.plant_loc_id Plant Location ID
 * @apiSuccess {Number} -.rows.plant_id Plant ID
 * @apiSuccess {String} -.rows.description Feedback Description
 * @apiSuccess {Object} -.contact Contact Information
 * @apiSuccess {String} -.rows.contact.number Contact Number, will be empty if not provided or user is Internal User
 * @apiSuccess {Number} -.rows.contact.whatsapp Contact Method of Whatsapp, 0 if No, 1 if Yes
 * @apiSuccess {Number} -.rows.contact.telegram Contact Method of Telegram, 0 if No, 1 if Yes
 * @apiSuccess {String} -.rows.image base64 eoncded string of image
 * @apiSuccess {String} -.rows.status_id Status ID (4 for Completed)
 * @apiSuccess {String} -.rows.status Status of Feedback ("COMPLETED")
 * @apiSuccess {String} -.rows.activity_log Activity Log of Feedback
 * @apiSuccess {String} -.rows.createdByUser Name of user who created feedback ("Guest" if external)
 * @apiSuccess {String} -.rows.assigned_user_name Name of assignee
 * @apiSuccess {Number} -.rows.assigned_user_id ID of assignee
 * @apiSuccess {String} -.rows.loc_room Location Room
 * @apiSuccess {String} -.rows.loc_floor Location Floor
 * @apiSuccess {String} -.rows.plant_name
 * @apiSuccess {String} -.rows.created_date Date of Feedback Creation
 * @apiSuccess {Number} -.total Total Pages
 *
 * @apiError (Status Code 204) {Object} Empty {msg: "No Feedback"}
 * @apiError (Error 500) {Object} InternalServerError {msg: error}
 *
 */
router.get(
  "/feedback/completed",
  checkIfLoggedInAPI,
  controllers.feedbackKnex.fetchCompletedFeedback
);

router.get(
  "/feedback/completed/:plant/:datetype/:date",
  checkIfLoggedInAPI,
  controllers.feedbackKnex.fetchCompletedFeedback
);

/**
 * @api {get} /feedback/filter/:status/:plant Get Filtered Feedback
 * @apiDescription Get Filtered Feedback
 * @apiName GetFilteredFeedback
 * @apiGroup Feedback
 *
 * @apiParam {String} status Status of Feedback (Can be stringed together, eg. /filter/1,2/)
 * @apiParam {String} plant Plant ID
 * @apiQuery {String} page Page Number
 *
 * @apiSuccess {Object} - Data Object
 * @apiSuccess {Object[]} -.rows Array of Filtered Feedback
 * @apiSuccess {Number} -.rows.id Feedback ID
 * @apiSuccess {Number} -.rows.plant_loc_id Plant Location ID
 * @apiSuccess {Number} -.rows.plant_id Plant ID
 * @apiSuccess {String} -.rows.description Feedback Description
 * @apiSuccess {Object} -.contact Contact Information
 * @apiSuccess {String} -.rows.contact.number Contact Number, will be empty if not provided or user is Internal User
 * @apiSuccess {Number} -.rows.contact.whatsapp Contact Method of Whatsapp, 0 if No, 1 if Yes
 * @apiSuccess {Number} -.rows.contact.telegram Contact Method of Telegram, 0 if No, 1 if Yes
 * @apiSuccess {String} -.rows.image base64 eoncded string of image
 * @apiSuccess {String} -.rows.status_id Status ID
 * @apiSuccess {String} -.rows.status Status of Feedback
 * @apiSuccess {String} -.rows.activity_log Activity Log of Feedback
 * @apiSuccess {String} -.rows.createdByUser Name of user who created feedback ("Guest" if external)
 * @apiSuccess {String} -.rows.assigned_user_name Name of assignee
 * @apiSuccess {Number} -.rows.assigned_user_id ID of assignee
 * @apiSuccess {String} -.rows.loc_room Location Room
 * @apiSuccess {String} -.rows.loc_floor Location Floor
 * @apiSuccess {String} -.rows.plant_name
 * @apiSuccess {String} -.rows.created_date Date of Feedback Creation
 * @apiSuccess {Number} -.total Total Pages
 *
 * @apiError (Status Code 204) {Object} Empty {msg: "No Feedback"}
 * @apiError (Error 500) {Object} InternalServerError {msg: error}
 * */
router.get(
  "/feedback/filter/:status/:plant",
  checkIfLoggedInAPI,
  controllers.feedback.fetchFilteredFeedback
);

/**
 * @api {get} /feedback/:id Get A Single Feedback
 * @apiDescription Get a Single Feedback
 * @apiName GetSingleFeedback
 * @apiGroup Feedback
 *
 * @apiParam {String} id Feedback ID
 *
 * @apiSuccess {Object} - Data Object
 * @apiSuccess {Object[]} -.rows Array of Completed Feedback
 * @apiSuccess {Number} -.rows.id Feedback ID
 * @apiSuccess {Number} -.rows.plant_loc_id Plant Location ID
 * @apiSuccess {Number} -.rows.plant_id Plant ID
 * @apiSuccess {String} -.rows.description Feedback Description
 * @apiSuccess {Object} -.contact Contact Information
 * @apiSuccess {String} -.rows.contact.number Contact Number, will be empty if not provided or user is Internal User
 * @apiSuccess {Number} -.rows.contact.whatsapp Contact Method of Whatsapp, 0 if No, 1 if Yes
 * @apiSuccess {Number} -.rows.contact.telegram Contact Method of Telegram, 0 if No, 1 if Yes
 * @apiSuccess {String} -.rows.image base64 eoncded string of image
 * @apiSuccess {String} -.rows.status_id Status ID (1 for Pending)
 * @apiSuccess {String} -.rows.status Status of Feedback ("PENDING")
 * @apiSuccess {String} -.rows.activity_log Activity Log of Feedback
 * @apiSuccess {String} -.rows.createdByUser Name of user who created feedback ("Guest" if external)
 * @apiSuccess {String} -.rows.assigned_user_name Name of assignee
 * @apiSuccess {Number} -.rows.assigned_user_id ID of assignee
 * @apiSuccess {String} -.rows.loc_room Location Room
 * @apiSuccess {String} -.rows.loc_floor Location Floor
 * @apiSuccess {String} -.rows.plant_name
 * @apiSuccess {String} -.rows.created_date Date of Feedback Creation
 * @apiSuccess {Number} -.total Total Pages
 *
 * @apiError (Code 204) {Object} Empty {msg: "No Feedback"}
 * @apiError (Error 500) {Object} InternalServerError {msg: error}
 *
 */
router.get(
  "/feedback/:id",
  checkIfLoggedInAPI,
  controllers.feedbackKnex.fetchSingleFeedback
);

/**
 * @api {patch} /feedback/assign/:id Assign Feedback
 * @apiDescription Assign Feedback
 * @apiName AssignFeedback
 * @apiGroup Feedback
 *
 * @apiParam {String} id Feedback ID
 *
 * @apiBody {Object} - Object
 * @apiBody {String} -.assigned_user_id Assigned User ID
 *
 * @apiSuccess {String} Success "Feedback successfully assigned"
 *
 * @apiError (Error 500) {String} Internal Server Error "Failure to assign feedback"
 */
router.patch(
  "/feedback/assign/:id",
  checkIfLoggedInAPI,
  controllers.feedbackKnex.assignFeedback
);

/**
 * @api {patch} /feedback/complete/:id Complete Feedback
 * @apiDescription Complete Feedback
 * @apiName CompleteFeedback
 * @apiGroup Feedback
 *
 * @apiParam {String} id Feedback ID
 *
 * @apiBody {Object} - Object
 * @apiBody {String} -.assigned_user_id Assigned User ID
 *
 * @apiSuccess {String} Success "Feedback successfully assigned"
 * @apiError (Error 500) {String} Internal Server Error "Failure to assign feedback"
 */
router.patch(
  "/feedback/complete/:id",
  checkIfLoggedInAPI,
  controllers.feedbackKnex.completeFeedback
);

/**
 * @api {post} /feedback/csv/
 * @apiDescription Create Feedback and store on External Server
 * @apiName createFeedbackCSV
 * @apiGroup Feedback
 *
 * @apiBody {Object} - Feedback Object
 * @apiBody {String} -.name Name of user who gave the feedback
 * @apiBody {String} -.comments Feedback Comments by the user
 * @apiBody {Number} -.taggedLocID Location ID
 * @apiBody {String} -.image base64 encoded string of image
 * @apiBody {Number} -.plantID Plant ID
 * @apiBody {String} -.email Email of user who created the feedback
 * @apiBody {Object} -.contact Contact Information
 * @apiBody {String} -.contact.number Contact Number, will be empty if not provided or user is Internal User
 * @apiBody {Number} -.contact.whatsapp Contact Method of Whatsapp, 0 if No, 1 if Yes
 * @apiBody {Number} -.contact.telegram Contact Method of Telegram, 0 if No, 1 if Yes
 *
 *
 * @apiSuccess {String} staus 200 ""
 * @apiError (Error 500) {String} Error file not Created
 */

router.post("/feedback/csv", controllers.feedbackKnex.createFeedbackCSV);

router.post("/feedback/sync", checkIfLoggedInAPI, controllers.feedbackKnex.triggerSyncAndCreateFeedback);

/**
 * @api {get} /activity/account_log Get Account Log
 * @apiDescription Get Account Activity Log
 * @apiName GetAccountLog
 * @apiGroup ActivityLog
 * 
 * @apiSuccess {Object} - Object containing Activity Log Array and side information
 * @apiSuccess {Object[]} -.logs Activity Log Array
 * @apiSuccess {String} -.logs.user_name User's Username
 * @apiSuccess {String} -.logs.type Event type
 * @apiSuccess {String} -.logs.event_time Date and Time of Event
 * @apiSuccess {String} -.logs.description Description of Event
 * 
 * @apiError (Error 500) {String} InternalServerError {msg: ERRORMESSAGE}
 */
router.get(
  "/activity/account_log",
  checkIfLoggedInAPI,
  controllers.activity.getEventtHistory
);
router.post(
  "/activity/csv",
  checkIfLoggedInAPI,
  controllers.activity.createActivityCSV
);

/**
 * @api {get} /activity/account_log/:type/:date Get Account Log By Date
 * @apiDescription Get Account Activity Log By Date
 * @apiName GetAccountLogByDate
 * @apiGroup ActivityLog
 * 
 * @apiParam {String} type "day", "month" or "year"
 * @apiParam {String} date "YYYY-MM-DD"
 * 
 * @apiSuccess {Object} - Object containing Activity Log Array and side information
 * @apiSuccess {Object[]} -.logs Activity Log Array
 * @apiSuccess {String} -.logs.user_name User's Username
 * @apiSuccess {String} -.logs.type Event type
 * @apiSuccess {String} -.logs.event_time Date and Time of Event
 * @apiSuccess {String} -.logs.description Description of Event
 * 
 * @apiError (Error 500) {String} InternalServerError {msg: ERRORMESSAGE}
 */
router.get(
  "/activity/account_log/:type/:date",
  checkIfLoggedInAPI,
  controllers.activity.getEventtHistoryDate
);

/**
 * @api {get} /logbook/:plant_id? Get Logbook Entry by Plant
 * @apiDescription Get Logbook Entry by Plant ID
 * @apiName getLogbookEntry
 * @apiGroup Logbook
 *
 * @apiParam {String} plant_id Plant ID
 *
 * @apiSuccess {Object} rows A list of logbook entry records
 * @apiSuccess {Object} total The total number of pages of records
 * 
 * @apiSuccessExample {json} Success Response:
 * HTTP/1.1 200 OK
{
    "rows": [
        {
            "staff1": "engineer jj",
            "staff2": "Engineer one",
            "date": "2023-10-20T07:10:56.000Z",
            "label": "",
            "entry": "sdf",
            "name": "Others",
            "description": null,
            "custom_description": "sdf"
        },
        {
            "staff1": "engineer jj",
            "staff2": "Engineer one",
            "date": "2023-10-20T07:10:49.000Z",
            "label": "",
            "entry": "bcs",
            "name": "Others",
            "description": null,
            "custom_description": ""
        },
        {
            "staff1": "engineer jj",
            "staff2": "Engineer one",
            "date": "2023-10-20T07:10:45.000Z",
            "label": "Others",
            "entry": "ssd",
            "name": "Others",
            "description": null,
            "custom_description": "sss"
        }
    ],
    "total": 1
}
 */

/**
 * @api {post} /logbook/:plant_id? Create New Logbook Entry
 * @apiDescription Create New Logbook Entry
 * @apiName CreateLogbookEntry
 * @apiGroup Logbook
 *
 * @apiParam {Number} plant_id ID of Plant
 * 
 * @apiBody (Request Body) {String} label Label of Logbook Entry (Don't use this, use label_id instead)
 * @apiBody (Request Body) {String} entry Description of the Logbook Entry
 * @apiBody (Request Body) {Object} staff Staff Object that contains 2 users
 * @apiBody (Request Body) {Number} staff.first user_id of the First User
 * @apiBody (Request Body) {Number} staff.second user_id of the Second User
 * @apiBody (Request Body) {Number} label_id ID of Label (related to logbook_labels label_id)
 * @apiBody (Request Body) {String} [custom_description] Custom Description for the Label
 *
 * @apiSuccess {Object} Entry The Logbook Entry Record created
 * @apiSuccess {Number} staff1 User ID of Staff1
 * @apiSuccess {Number} staff2 User ID of Staff2
 * 
 *
 */
router
  .route("/logbook/:plant_id?", checkIfLoggedInAPI)
  .get(controllers.logbook.getLogbook)
  .post(controllers.logbook.addEntryToLogbook);

/**
 * @api {get} /logbook_labels/ Get All Logbook Labels  
 * @apiDescription Get All Logbook Labels
 * @apiName getAllLogbookLabels
 * @apiGroup Logbook
 *
 * @apiSuccess {Object[]} logbook_labels list of logbook_label objects
 * @apiSuccess {Object} logbook_label logbook_label object
 * @apiSuccess {Number} logbook_label.label_id ID of the Label
 * @apiSuccess {String} logbook_label.name Name of the Label
 * @apiSuccess {String} logbook_label.description Description of the Label
 * @apiSuccess {Object} logbook_label.activity_log Activity Log object of the Label
 * @apiSuccess {Date} logbook_label.created_date Date which Label was created
 * @apiSuccess {Boolean} logbook_label.allow_custom Whether the label can have a customised description for the logbook entry
 * 
 * @apiSuccessExample {json} Success Response:
 * HTTP/1.1 200 OK
[
    {
        "label_id": 3,
        "name": "Others",
        "description": null,
        "activity_log": null,
        "created_date": null,
        "allow_custom": true
    },
    {
        "label_id": 2,
        "name": "2nd test change",
        "description": "change test description for label change",
        "activity_log": null,
        "created_date": null,
        "allow_custom": false
    },
    {
        "label_id": 1,
        "name": "test 1",
        "description": "test description for label 1",
        "activity_log": null,
        "created_date": null,
        "allow_custom": false
    }
  ]
 */
router
  .route("/logbook_labels", checkIfLoggedInAPI)
  .get(controllers.logbook.getAllLogbookLabels);

router
  .route("/changeOfParts/all/:cop_id?", checkIfLoggedInAPI)
  .get(controllers.changeOfParts.fetchChangeOfParts)
  .post(controllers.changeOfParts.createNewChangeOfParts)
  .patch(controllers.changeOfParts.editChangeOfParts);

router
  .route("/changeOfParts/scheduled", checkIfLoggedInAPI)
  .get(controllers.changeOfParts.fetchScheduleChangeOfParts);

router
  .route("/changeOfParts/scheduled/:plant", checkIfLoggedInAPI)
  .get(controllers.changeOfParts.fetchScheduleChangeOfParts);

router
  .route("/changeOfParts/scheduled/:plant/:datetype/:date", checkIfLoggedInAPI)
  .get(controllers.changeOfParts.fetchScheduleChangeOfParts);

router
  .route("/changeOfParts/completed", checkIfLoggedInAPI)
  .get(controllers.changeOfParts.fetchCompletedChangeOfParts);

router
  .route("/changeOfParts/completed/:plant", checkIfLoggedInAPI)
  .get(controllers.changeOfParts.fetchCompletedChangeOfParts);

router
  .route("/changeOfParts/completed/:plant/:datetype/:date", checkIfLoggedInAPI)
  .get(controllers.changeOfParts.fetchCompletedChangeOfParts);


/**
 * @api {get} /user/getUsers Get All Users
 * @apiDescription Get List of All Users
 * @apiName GetAllUsers
 * @apiGroup User
 * 
 * @apiSuccess {Object} - Object containing List of Object Users
 * @apiSuccess {Object[]} -.rows List of User Objects
 * @apiSuccess {String} -.rows.employee_id Employee ID
 * @apiSuccess {String} -.rows.full_name Employee's Full Name
 * @apiSuccess {Number} -.rows.user_id User ID
 * @apiSuccess {String} -.rows.user_name Username
 * @apiSuccess {String} -.rows.role_name Employee's Role Name
 * @apiSuccess {Number} -.total Total Pages
 */

/**
 * @api {post} /user/addUser Create New User
 * @apiDescription Create New User
 * @apiName CreateNewUser
 * @apiGroup User
 * 
 * @apiBody {String} firstName First Name
 * @apiBody {String} lastName Last Name
 * @apiBody {String} username Username
 * @apiBody {String} password Password
 * @apiBody {String} employeeId Employee ID
 * @apiBody {String} email Email
 * @apiBody {Number} roleType Role ID
 * @apiBody {Number[]} allocatedPlants List of Allocated Plants
 */

/**
 * @api {get} /user/getUsersData/:id Get Specific User Data
 * @apiDescription Get User Data of Specific User using User ID
 * @apiName GetUserData
 * @apiGroup User
 * 
 * @apiParam {Number} id User ID
 * 
 * @apiSuccess {String} first_name First Name
 * @apiSuccess {String} last_name Last Name
 * @apiSuccess {String} employee_id Employee ID
 * @apiSuccess {String} allocated_plants Allocated Plant Names
 * @apiSuccess {Number} allocatedplantids IDs of Allocated Plants
 * @apiSuccess {String} user_name Username
 * @apiSuccess {String} user_email User Email
 * @apiSuccess {Number} role_id User Role ID
 */

/**
 * @api {get} /user/getUsersplantData/:id Get User Plant Data by User ID
 * @apiDescription Get Plants related to user by User ID (assigned to or signed off by user)
 * @apiName GetUserPlantData
 * @apiGroup User
 * 
 * @apiParam {Number} id User ID
 * 
 * @apiSuccess {Object[]} - Array of Plant ID Objects
 * @apiSuccess {Number} -.plant_id ID of Plants related to user 
 */

/**
 * @api {post} /user/updateUser Update Existing User
 * @apiDescription Update Existing User
 * @apiName UpdateUser
 * @apiGroup User
 * 
 * @apiBody {Number} user_id User ID
 * @apiBody {String} first_name First Name
 * @apiBody {String} last_name Last Name
 * @apiBody {String} employee_id Employee ID
 * @apiBody {Number[]} addplantids Plant IDs to assign to user
 * @apiBody {Number[]} removeplantids Plant IDs to unassign from user
 * @apiBody {String} password New Password
 * @apiBody {String} user_name Username
 * @apiBody {String} user_email Email
 * @apiBody {Number} role_id Role ID
 * 
 * @apiError (Error 400) {Object} BadRequestError "Role does not exist"
 */

/**
 * @api {delete} /user/deleteUser/:id Delete Existing User
 * @apiDescription Delete Existing User using User ID
 * @apiName DeleteUser
 * @apiGroup User
 * 
 * @apiParam {Number} id User ID
 */
router
  .get("/user/getUsers", checkIfLoggedInAPI, controllers.user.getUsers)
  .get("/user/getUsersCSV", checkIfLoggedInAPI, controllers.user.getUsersCSV)
  .post("/user/addUser", checkIfLoggedInAPI, controllers.user.addUser)
  .get(
    "/user/getUsersData/:id",
    checkIfLoggedInAPI,
    controllers.user.getUsersData
  )
  .get(
    "/user/getUsersplantData/:id",
    checkIfLoggedInAPI,
    controllers.user.getUsersplantData
  )
  .post("/user/addUser", checkIfLoggedInAPI, controllers.user.addUser)
  .post("/user/updateUser", checkIfLoggedInAPI, controllers.user.updateUser);

router.delete(
  "/user/deleteUser/:id",
  checkIfLoggedInAPI,
  controllers.user.deleteUser
);
router.get("/user/logouthistory", checkIfLoggedInAPI, controllers.user.logout);

/**
 * @api {post} /setting/update Update User Details
 * @apiDescription Update Own User Details via Settings
 * @apiName UpdateUserDetails
 * @apiGroup Settings
 * 
 * @apiBody {String} username Updated Username
 * @apiBody {String} email Updated Email
 * @apiBody {Number} userId User ID
 */

/**
 * @api {post} /setting/updatePassword Update Password
 * @apiDescription Update Password via Settings
 * @apiName UpdatePassword
 * @apiGroup Settings
 * 
 * @apiBody {String} current_password Current Password
 * @apiBody {String} new_password New Password
 * @apiBody {String} confirm_password Confirm Password
 * @apiBody {Number} id User ID
 * 
 * @apiError (Error 400) {String} BadRequest "error"
 */

/**
 * @api {get} /setting/check/email/:id Check For Unique Email
 * @apiDescription Check for Unique Email
 * @apiName CheckUniqueEmail
 * @apiGroup Settings
 * 
 * @apiParam {Number} id User ID
 * 
 * @apiSuccess {Boolean} - Shows if an email is unique
 */

/**
 * @api {get} /setting/check/username/:id Check For Unique Username
 * @apiDescription Check for Unique Username
 * @apiName CheckUniqueUsername
 * @apiGroup Settings
 * 
 * @apiParam {Number} id User ID
 * 
 * @apiSuccess {Boolean} - Shows if an Username is unique
 */
router
  .post("/setting/update", checkIfLoggedInAPI, controllers.setting.updateUser)
  .post(
    "/setting/updatePassword",
    checkIfLoggedInAPI,
    controllers.setting.updatePassword
  )
  .get(
    "/setting/check/email/:id",
    checkIfLoggedInAPI,
    controllers.setting.checkEmail
  )
  .get(
    "/setting/check/username/:id",
    checkIfLoggedInAPI,
    controllers.setting.checkUsername
  );


/**
 * @api {get} /workflows Get All Workflows
 * @apiDescription Get All Workflows
 * @apiName getAllWorkflows
 * @apiGroup Workflow
 * 
 * @apiSuccess {Object} - Object containing an Array of Workflows
 * @apiSuccess {Object[]} -.rows Workflow Array
 * @apiSuccess {Number} -.rows.id Workflow ID
 * @apiSuccess {Number} -.rows.type Request Type ID
 * @apiSuccess {Number} -.rows.fault_id Fault ID
 * @apiSuccess {Number} -.rows.plant_id Plant ID
 * @apiSuccess {Number} -.rows.is_assign_to Signifies if Action is to Assign to User
 * @apiSuccess {Number} -.rows.is_send_email Signifies if Action is to Email User
 * @apiSuccess {Number} -.rows.is_active Signifies if Workflow is Active
 * @apiSuccess {Number} -.rows.user_id ID of User to Assign / Email to
 * @apiSuccess {String} -.rows.created_at Date and Time of Workflow Creation
 * @apiSuccess {String} -.rows.user_name Username of User to Assign / Email to
 * @apiSuccess {String} -.rows.user_email Email of User to Assign / Email to
 * @apiSuccess {String} -.rows.plant_name Plant Name
 * @apiSuccess {String} -.rows.fault_type Fault Type
 * 
 * @apiError (Error 500) {Object} InternalServerError {msg: ERRORMESSAGE}
 */

/**
 * @api {post} /workflow Create New Workflow
 * @apiDescription Create a New Workflow
 * @apiName createNewWorkflow
 * @apiGroup Workflow
 * 
 * @apiBody {Number} type Request Type ID (1 for Fault Request)
 * @apiBody {Number} plant Plant ID
 * @apiBody {Number} faultType Fault ID
 * @apiBody {String} action "assign-to" or "send-email"
 * @apiBody {Number} assignTo ID of User to Assign to, else 0
 * @apiBody {Number} sendEmail ID of User to Email to, else 0
 * 
 * @apiError (Error 500) {Object} InternalServerError {msg: ERRORMESSAGE}
 */

/**
 * @api {put} /workflow/:id Update Workflow
 * @apiDescription Update Workflow Active Status 
 * @apiName updateWorkflow
 * @apiGroup Workflow
 * 
 * @apiParam {Number} id Workflow ID
 * 
 * @apiBody {Number} is_active 0 for inactive, 1 for active
 * 
 * @apiError (Error 500) {Object} InternalServerError {msg: ERRORMESSAGE}
 */

/**
 * @api {delete} /workflow/:id Delete Workflow
 * @apiDescription Delete a Workflow
 * @apiName deleteWorkflow
 * @apiGroup Workflow
 * 
 * @apiParam {Number} id Workflow ID
 * 
 * @apiError (Error 500) {Object} InternalServerError {msg: ERRORMESSAGE}
 */
router
  .get("/workflow/run/assign", controllers.workflow.runWorkflowAssign)
  .get("/workflow/run/email", controllers.workflow.runWorkflowEmail)
  .get("/workflows", checkIfLoggedInAPI, controllers.workflow.listWorkflow)
  .post("/workflow", checkIfLoggedInAPI, controllers.workflow.createWorkflow)
  .put("/workflow/:id", checkIfLoggedInAPI, controllers.workflow.updateWorkflow)
  .delete(
    "/workflow/:id",
    checkIfLoggedInAPI,
    controllers.workflow.deleteWorkflow
  );

/**
 * @api {get} /plantLocation Get All Plant Locations
 * @apiDescription Get all plant locations
 * @apiName getPlantLocations
 * @apiGroup PlantLocation
 *
 * @apiSuccess {Object[]} - Data Array of Plant Location Objects
 * @apiSuccess {Number} -.id Plant Location ID
 * @apiSuccess {Number} -.plant_id Plant ID
 * @apiSuccess {String} -.location Plant Location Description
 *
 * @apiError (Error 500) {String} Internal Server Error "Error has occurred in the server"
 */
router.get(
  "/plantLocation",
  checkIfLoggedInAPI,
  controllers.plantLocation.getAllPlantLoc
);

/**
 * @api {get} /plantLocation/self Get your assigned plant locations
 * @apiDescription Get assigned plant locations
 * @apiName getAssignedPlantLocations
 * @apiGroup PlantLocation
 *
 * @apiSuccess {Object[]} - Data Array of Plant Location Objects
 * @apiSuccess {Number} -.id Plant Location ID
 * @apiSuccess {Number} -.plant_id Plant ID
 * @apiSuccess {String} -.location Plant Location Description
 *
 * @apiError (Error 500) {String} Internal Server Error "Error has occurred in the server"
 */
router.get("/plantLocation/self", controllers.plantLocation.getUserPlantLocs);

/**
 * @api {get} /plantLocation/:id Get single plant location
 * @apiDescription Get single plant location
 * @apiName getSinglePlantLocations
 * @apiGroup PlantLocation
 *
 * @apiParam {String} id Plant Location ID
 *
 * @apiSuccess {Object[]} - Data Array of Plant Location Objects
 * @apiSuccess {Number} -.loc_id Plant Location ID
 * @apiSuccess {Number} -.plant_id Plant ID
 * @apiSuccess {String} -.plant_name Plant Name
 * @apiSuccess {String} -.loc_floor Plant Location Floor
 * @apiSuccess {String} -.loc_room Plant Location Room
 *
 * @apiError (Error 500) {String} Internal Server Error "Error has occurred in the server"
 */
router.get("/plantLocation/:id", controllers.plantLocation.getSinglePlantLoc);

//.get("/workflow/run/checklist", controllers.workflow.runWorkflowChecklist);

// router.get("/user/getUser/:id", checkIfLoggedInAPI, controllers.setting.getUser);

/**
 * @api {get} /license_types Get License Types
 * @apiDescription License Types
 * @apiName Fetch license Type
 * @apiGroup License
 *
 * @apiSuccess {Object[]} - Array of License Type
 * @apiSuccess {Number} -.type_id license Type ID
 * @apiSuccess {Number} -.type type of license
 *
 *
 * @apiError (Error 500) {String} Internal Server Error "An error has occured while fetching license types"
 */

router.get(
  "/license_types",
  checkIfLoggedInAPI,
  controllers.license.fetchLicenseTypes
);

/**
 * @api {post} /license Create License
 * @apiDescription Create License
 * @apiName createLicense
 * @apiGroup License
 *
 * @apiBody {CMMSLicenseForm} -.license CMMSLicenseForm Object
 * @apiBody {String} -.license.license_name Name of license
 * @apiBody {String} -.license.license_provider Provider of license
 * @apiBody {Number} -.license.license_type_id type of license
 * @apiBody {String} -.license.license_details description of license
 * @apiBody {Number} -.license.plant_id plant id of asset that license if for
 * @apiBody {Number} -.license.plant_loc_id location id of asset license
 * @apiBody {Number} -.license.linked_asset_id id of linked asset
 * @apiBody {Number} -.license.assigned_user_id assigned user
 * @apiBody {File[]} -.images images tag to asset/license
 *
 * @apiSuccess {String} Success "Successfully created license"
 * @apiError (Error 500) {String} Internal Server Error "Error creating license"
 */

router.post(
  "/license",
  checkIfLoggedInAPI,
  upload.array("images", 6),
  controllers.license.createLicense
);

/**
 * @api {get} /license/draft?page=&expand=&plantId=&search= Get Draft License
 * @apiDescription Draft License
 * @apiName fetchDraftLicense
 * @apiGroup License
 * 
 * @apiQuery {Number} page Page of Draft License shown
 * @apiQuery {String[]} expand Types of parameters needed in the query 
 * @apiQuery {Number} plantId To filter by plants, 0 by default
 * @apiQuery {String} Search To search for specifics in the DB (Not implemented yet)

 * 
 * @apiSuccess {JSON} - Data of Draft License and total page
 * @apiSuccess {CMMSLicense[]} -.rows Array of License Draft
 * @apiSuccess {Number} -.total Total number of pages of Draft License in the DB
 *
 * 
 * @apiError (Error 500) {Object} Internal Server Error {msg : error}
 */

router.get(
  "/license/draft",
  checkIfLoggedInAPI,
  controllers.license.fetchDraftLicenses
);

router.get(
  "/license/draft/:plant/:datetype/:date",
  checkIfLoggedInAPI,
  controllers.license.fetchDraftLicenses
);

/**
 * @api {get} /license/acquired?page=&expand=&plantId=&search= Get Acquired License
 * @apiDescription Acquired License
 * @apiName fetchAcquiredLicense
 * @apiGroup License
 *
 * @apiQuery {Number} page Page of Acquired License shown
 * @apiQuery {String[]} expand Types of parameters needed in the query
 * @apiQuery {Number} plantId To filter by plants, 0 by default
 * @apiQuery {String} Search To search for specifics in the DB (Not implemented yet)
 *
 *
 * @apiSuccess {JSON} - Data of Acquired License and total page
 * @apiSuccess {CMMSLicense[]} -.rows Array of Acquired License
 * @apiSuccess {Number} -.total Total number of pages of Acquired License in the DB
 *
 *
 * @apiError (Error 500) {Object} Internal Server Error {msg : error}
 */

router.get(
  "/license/acquired",
  checkIfLoggedInAPI,
  controllers.license.fetchAcquiredLicenses
);

/**
 * @api {get} /license/acquired?page=&expand=&plantId=&search= Get Acquired License
 * @apiDescription Acquired License
 * @apiName fetchAcquiredLicense
 * @apiGroup License
 *
 * @apiParams {Number} plant_id ID of the plant if all plants put 0
 * @apiParams {Number} dataetype Type of date either in "days","months","year"
 * @apiParams {String} date Actual date in instring
 *
 * @apiQuery {Number} page Page of Acquired License shown
 * @apiQuery {String[]} expand Types of parameters needed in the query
 * @apiQuery {Number} plantId To filter by plants, 0 by default
 * @apiQuery {String} Search To search for specifics in the DB (Not implemented yet)
 *
 *
 * @apiSuccess {JSON} - Data of Acquired License and total page
 * @apiSuccess {CMMSLicense[]} -.rows Array of Acquired License
 * @apiSuccess {Number} -.total Total number of pages of Acquired License in the DB
 *
 * @apiError (Error 500) {Object} Internal Server Error {msg : error}
 */

router.get(
  "/license/acquired/:plant/:datetype/:date",
  checkIfLoggedInAPI,
  controllers.license.fetchAcquiredLicenses
);

/**
 * @api {get} /license/expired?page=&expand=&plantId=&search= Get Expired license
 * @apiDescription Expired License
 * @apiName fetchExpiredLicense
 * @apiGroup License
 *
 * @apiQuery {Number} page Page of Expired License shown
 * @apiQuery {String[]} expand Types of parameters needed in the query
 * @apiQuery {Number} plantId To filter by plants, 0 by default
 * @apiQuery {String} Search To search for specifics in the DB (Not implemented yet)
 *
 *
 * @apiSuccess {JSON} - Data of Expired License and total page
 * @apiSuccess {CMMSLicense[]} -.rows Array of Expired License
 * @apiSuccess {Number} -.total Total number of pages of Expired License in the DB
 *
 *
 * @apiError (Error 500) {Object} Internal Server Error {msg : error}
 */

router.get(
  "/license/expired",
  checkIfLoggedInAPI,
  controllers.license.fetchExpiredLicenses
);

/**
 * @api {get} /license/expiry_dates?plantId= Get License Expiry Dates
 * @apiDescription Fetch expiry_dates of License
 * @apiName fetchExpiryDates
 * @apiGroup License
 *
 * @apiQuery {Number} plantId To filter by plants, 0 by default
 *
 *
 * @apiSuccess {Date[]} - Data of Expiry Dates
 *
 *
 * @apiError (Error 500) {Object} Internal Server Error "Error has occured getting expiry dates of all licenses"
 */

router.get(
  "/license/expiry_dates",
  checkIfLoggedInAPI,
  controllers.license.fetchExpiryDates
);

/**
 * @api {get} /license/archived?page=&expand=&plantId=&search= Get Archived License
 * @apiDescription Archived License
 * @apiName fetchArchivedLicense
 * @apiGroup License
 *
 * @apiQuery {Number} page Page of Archived License shown
 * @apiQuery {String[]} expand Types of parameters needed in the query
 * @apiQuery {Number} plantId To filter by plants, 0 by default
 * @apiQuery {String} Search To search for specifics in the DB (Not implemented yet)
 *
 *
 * @apiSuccess {JSON} - Data of Archived License and total page
 * @apiSuccess {CMMSLicense[]} -.rows Array of Archived License
 * @apiSuccess {Number} -.total Total number of pages of Archived License in the DB
 *
 *
 * @apiError (Error 500) {Object} Internal Server Error {msg : error}
 */
router.get(
  "/license/archived",
  checkIfLoggedInAPI,
  controllers.license.fetchArchivedLicenses
);

/**
 * @api {get} /license/:id
 * @apiDescription Fetch single License
 * @apiName fetchSingleLicense
 * @apiGroup License
 *
 * @apiParams {Number} id Unique ID of the license
 *
 *
 * @apiSuccess {CMMSLicenseForm} -
 * @apiSuccess {String} -.license_id ID of license
 * @apiSuccess {String} -.license_name Name of license
 * @apiSuccess {String} -.license_provider Provider of license
 * @apiSuccess {Number} -.license_type_id type of license
 * @apiSuccess {String} -.license_details description of license
 * @apiSuccess {Number} -.plant_id plant id of asset that license if for
 * @apiSuccess {Number} -.plant_loc_id location id of asset license
 * @apiSuccess {Number} -.linked_asset_id id of linked asset
 * @apiSuccess {Number} -.assigned_user_id assigned user
 * @apiSuccess {Date} -.acquisition_date Aquired license Date
 * @apiSuccess {Date} -.expiry_date License Expiry Date
 * @apiSuccess {Number} -.status_id status of license
 *
 * @apiError (Error 500) {Object} Error Fetching license
 *
 * @api {delete} /license/:id
 * @apiDescription Delete Single License
 * @apiName deleteLicense
 * @apiGroup License
 *
 * @apiParams {Number} id ID of License to delete
 *
 * @apiSuccess {String} Successfully deleted License
 *
 * @apiError {Object} Error occurred deleting license
 */
router
  .route("/license/:id", checkIfLoggedInAPI)
  .get(controllers.license.fetchSingleLicense)
  .delete(controllers.license.deleteLicense);

/**
 * @api {patch} /license/:id
 * @apiDescription Edit License
 * @apiName editLicense
 * @apiGroup License
 *
 * @apiParams {Number} id ID of License to delete
 *
 * @apiBody {CMMSLicenseForm} -.license CMMSLicenseForm Object
 * @apiBody {String} -.license.license_name Name of license
 * @apiBody {String} -.license.license_provider Provider of license
 * @apiBody {Number} -.license.license_type_id type of license
 * @apiBody {String} -.license.license_details description of license
 * @apiBody {Number} -.license.plant_id plant id of asset that license if for
 * @apiBody {Number} -.license.plant_loc_id location id of asset license
 * @apiBody {Number} -.license.linked_asset_id id of linked asset
 * @apiBody {Number} -.license.assigned_user_id assigned user
 * @apiBody {File[]} -.images images tag to asset/license
 *
 *
 * @apiSuccess {String} Successfully editing license
 *
 */
router.patch(
  "/license/:id",
  checkIfLoggedInAPI,
  upload.array("images", 6),
  controllers.license.editLicense
);

/**
 * @api {patch} /license/acquire/:id
 * @apiDescription Acquire License
 * @apiName acquireLicense
 * @apiGroup License
 *
 * @apiParams {Number} id ID of License to acquire
 *
 * @apiBody {Date} -.acquisition_date License Acquired date
 * @apiBody {Date} -.expiry_date Date of expiry for License
 *
 * @apiSuccess {String} Successfully acquired license
 *
 *
 *
 */
router.patch(
  "/license/acquire/:id",
  checkIfLoggedInAPI,
  controllers.license.acquireLicense
);

/**
 * @api {patch} /license/renew/:id
 * @apiDescription Renew License
 * @apiName renewLicense
 * @apiGroup License
 *
 * @apiParams {Number} id ID of License to acquire
 *
 * @apiBody {Date} -.expiry_date Date of expiry for License
 *
 * @apiSuccess {String} Successfully renew license
 *
 *
 */
router.patch(
  "/license/renew/:id",
  checkIfLoggedInAPI,
  controllers.license.renewLicense
);

/**
 * @api {get} /license/images/:id
 * @apiDescription fetch license images
 * @apiName fetchLicenseImages
 * @apiGroup License
 *
 * @apiParams {Number} id ID of License to acquire
 *
 * @apiSuccess {Object} - Image Datas
 * @apiSuccess {File[]} -.images Data of the Images
 *
 */

router.get(
  "/license/images/:id",
  checkIfLoggedInAPI,
  controllers.license.fetchLicenseImages
);
/**
 * @api {get} /license/expired/:plant/:datetype/:date/:days
 * @apiDescription fetchExpiredLicensesInDays
 * @apiName fetchExpiredLicenseInDays
 * @apiGroup License
 *
 * @apiParams {Number} plant_id specific plant
 * @apiParams {String} date_type usually in date
 * @apiParams {String} date For the specific date, or "all"
 * @apiParams {String} days Number of days expired "30","60","90"
 *
 *
 * @apiSuccess {JSON} - Json Object returned
 * @apiSuccess {CMMSLicense[]} -.rows All expired license in an array
 * @apiSuccess {Number} -.total Total number of Pages required
 * @apiSuccess {Number} -.count Total number of license returned
 * @apiSuccess {String} -.row.license_id ID of license
 * @apiSuccess {String} -.row.license_name Name of license
 * @apiSuccess {String} -.row.license_provider Provider of license
 * @apiSuccess {Number} -.row.license_type_id type of license
 * @apiSuccess {String} -.row.license_details description of license
 * @apiSuccess {Number} -.row.plant_id plant id of asset that license if for
 * @apiSuccess {Number} -.row.plant_loc_id location id of asset license
 * @apiSuccess {Number} -.row.linked_asset_id id of linked asset
 * @apiSuccess {Number} -.row.assigned_user_id assigned user
 * @apiSuccess {Date} -.row.acquisition_date Aquired license Date
 * @apiSuccess {Date} -.row.expiry_date License Expiry Date
 * @apiSuccess {Number} -.row.status_id status of license
 *
 *
 */
router.get(
  "/license/expired/:plant/:datetype/:date/:days",
  checkIfLoggedInAPI,
  controllers.license.fetchExpiredLicensesInDays
);

router.get("/db/names", fetchDBNames);

// NO API ROUTE
router.all("/*", (req, res) => {
  return res.status(404).send("no route");
});

module.exports = router;
