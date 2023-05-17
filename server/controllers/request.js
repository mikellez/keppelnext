const db = require("../../db");
const { generateCSV } = require("../csvGenerator");
const moment = require("moment");

/** Express router providing user related routes
 * @module controllers/request
 * @requires db
 */

const ITEMS_PER_PAGE = 10;

function fetchRequestQuery(status_query, role_id, user_id, page) {
  const offsetItems = (page - 1) * ITEMS_PER_PAGE;
  console.log(role_id)

  return role_id === 1 || role_id === 2 || role_id === 3
    ? `SELECT r.request_id , ft.fault_type AS fault_name, pm.plant_name,pm.plant_id,
	  rt.request, ro.role_name, sc.status,r.fault_description, rt.request AS request_type,
	  pri.priority, 
	  CASE 
		  WHEN (concat( concat(req_u.first_name ,' '), req_u.last_name) = ' ') THEN r.guestfullname
		  ELSE concat( concat(req_u.first_name ,' '), req_u.last_name )
	  END AS fullname,
	  r.created_date,tmp1.asset_name, r.uploadfilemimetype, r.completedfilemimetype, r.uploaded_file, r.completion_file,
	  r.complete_comments,
	  concat( concat(au.first_name,' '), au.last_name) AS assigned_user_name, r.associatedrequestid
	  , r.requesthistory, r.rejection_comments, r.status_id, r.psa_id, r.fault_id
	  FROM    
		  keppel.users u
		  JOIN keppel.user_access ua ON u.user_id = ua.user_id
		  JOIN keppel.request r ON ua.allocatedplantids LIKE concat(concat('%',r.plant_id::text) , '%')
		  left JOIN keppel.users req_u ON r.user_id = req_u.user_id
		  left JOIN keppel.fault_types ft ON r.fault_id = ft.fault_id
		  left JOIN keppel.plant_master pm ON pm.plant_id = r.plant_id 
		  left JOIN keppel.request_type rt ON rt.req_id = r.req_id
		  left JOIN keppel.priority pri ON pri.p_id = r.priority_id
		  left JOIN keppel.role ro ON ro.role_id = r.role_id
		  left JOIN keppel.status_pm sc ON sc.status_id = r.status_id
		  left JOIN keppel.users au ON au.user_id = r.assigned_user_id
		  left JOIN (SELECT psa_id ,  concat( system_asset , ' | ' , plant_asset_instrument ) AS asset_name 
			  from  keppel.system_assets   AS t1 ,keppel.plant_system_assets AS t2
			  WHERE t1.system_asset_id = t2.system_asset_id_lvl4) tmp1 ON tmp1.psa_id = r.psa_id
    WHERE 1 = 1 
	  ${status_query}
	  GROUP BY (
		  r.request_id,
		  ft.fault_type,
		  pm.plant_name,
		  pm.plant_id,
		  rt.request,
		  ro.role_name,
		  sc.status,
		  pri.priority,
		  req_u.first_name,
		  tmp1.asset_name,
		  req_u.last_name,
		  au.first_name,
		  au.last_name
	  )
	  ORDER BY r.created_date DESC, r.status_id DESC
	  LIMIT ${ITEMS_PER_PAGE}
	  OFFSET ${offsetItems};`
    : `SELECT r.request_id , ft.fault_type AS fault_name, pm.plant_name,pm.plant_id,
	  rt.request, ro.role_name, sc.status,r.fault_description, rt.request AS request_type,
	  pri.priority, 
	  CASE 
		  WHEN (concat( concat(req_u.first_name ,' '), req_u.last_name) = ' ') THEN r.guestfullname
		  ELSE concat( concat(req_u.first_name ,' '), req_u.last_name )
	  END AS fullname,
	  r.created_date,tmp1.asset_name, r.uploadfilemimetype, r.completedfilemimetype, r.uploaded_file, r.completion_file,
	  r.complete_comments,
	  concat( concat(au.first_name,' '), au.last_name) AS assigned_user_name, r.associatedrequestid
	  , r.requesthistory, r.rejection_comments, r.status_id, r.psa_id, r.fault_id
	  FROM    
		  keppel.users u
		  JOIN keppel.user_access ua ON u.user_id = ua.user_id
		  JOIN keppel.request r ON ua.allocatedplantids LIKE concat(concat('%',r.plant_id::text) , '%')
		  left JOIN keppel.users req_u ON r.user_id = req_u.user_id
		  left JOIN keppel.fault_types ft ON r.fault_id = ft.fault_id
		  left JOIN keppel.plant_master pm ON pm.plant_id = r.plant_id 
		  left JOIN keppel.request_type rt ON rt.req_id = r.req_id
		  left JOIN keppel.priority pri ON pri.p_id = r.priority_id
		  left JOIN keppel.role ro ON ro.role_id = r.role_id
		  left JOIN keppel.status_pm sc ON sc.status_id = r.status_id
		  left JOIN keppel.users au ON au.user_id = r.assigned_user_id
		  left JOIN (SELECT psa_id ,  concat( system_asset , ' | ' , plant_asset_instrument ) AS asset_name 
			  from  keppel.system_assets   AS t1 ,keppel.plant_system_assets AS t2
			  WHERE t1.system_asset_id = t2.system_asset_id_lvl4) tmp1 ON tmp1.psa_id = r.psa_id
	  WHERE (r.assigned_user_id = ${user_id} OR r.user_id = ${user_id})
	  ${status_query}
	  GROUP BY (
		  r.request_id,
		  ft.fault_type,
		  pm.plant_name,
		  pm.plant_id,
		  rt.request,
		  ro.role_name,
		  sc.status,
		  pri.priority,
		  req_u.first_name,
		  tmp1.asset_name,
		  req_u.last_name,
		  au.first_name,
		  au.last_name
	  )
	  ORDER BY r.created_date DESC, r.status_id DESC
	  LIMIT ${ITEMS_PER_PAGE}
	  OFFSET ${offsetItems}`;
}

const getTotalPagesForRequestStatus = async (status) => {
  const totalRows =
    await db.query(`SELECT COUNT(DISTINCT(r.request_id)) FROM keppel.request r
	JOIN keppel.status_pm s ON r.status_id = s.status_id
	WHERE s.status_id = ${status}`);

  const totalPages = Math.ceil(+totalRows.rows[0].count / ITEMS_PER_PAGE);
  return totalPages;
};

const fetchPendingRequests = async (req, res, next) => {
  const page = req.query.page || 1;

  const sql = fetchRequestQuery(
    "AND sc.status_id = 1", //PENDING
    req.user.role_id,
    req.user.id,
    page
  );


  const result = await db.query(sql);
  const totalPages = await getTotalPagesForRequestStatus(1);
  if (result.rows.length == 0)
    return res.status(404).json({ msg: "No requests" });

  res.status(200).send({ rows: result.rows, total: totalPages });
};

const fetchAssignedRequests = async (req, res, next) => {
  const page = req.query.page || 1;

  const sql = fetchRequestQuery(
    "AND sc.status_id = 2", //ASSIGNED
    req.user.role_id,
    req.user.id,
    page
  );

  const result = await db.query(sql);
  const totalPages = await getTotalPagesForRequestStatus(2);
  if (result.rows.length == 0)
    return res.status(404).json({ msg: "No requests" });

  res.status(200).send({ rows: result.rows, total: totalPages });
};

const fetchReviewRequests = async (req, res, next) => {
  const page = req.query.page || 1;

  const sql = fetchRequestQuery(
    "AND (sc.status_id = 3 OR sc.status_id = 5 OR sc.status_id = 6)", //COMPLETED, REJECTED, CANCELLEd
    req.user.role_id,
    req.user.id,
    page
  );

  const result = await db.query(sql);
  const totalPages = await getTotalPagesForRequestStatus(`ANY('{3, 5, 6}')`);
  if (result.rows.length == 0)
    return res.status(404).json({ msg: "No requests" });

  res.status(200).send({ rows: result.rows, total: totalPages });
};

const fetchApprovedRequests = async (req, res, next) => {
  const page = req.query.page || 1;

  const sql = fetchRequestQuery(
    "AND sc.status_id = 4", //APPROVED
    req.user.role_id,
    req.user.id,
    page
  );

  const result = await db.query(sql);
  const totalPages = await getTotalPagesForRequestStatus(4);
  if (result.rows.length == 0)
    return res.status(404).json({ msg: "No requests" });

  res.status(200).send({ rows: result.rows, total: totalPages });
};

const createRequest = async (req, res, next) => {
  const {
    requestTypeID,
    faultTypeID,
    description,
    plantLocationID,
    taggedAssetID,
  } = req.body;
  console.log(req.body.linkedRequestId);
  console.log("^&*")
  const fileBuffer = req.file === undefined ? null : req.file.buffer;
  const fileType = req.file === undefined ? null : req.file.mimetype;
  const today = moment(new Date()).format("DD/MM/YYYY HH:mm A");
  let user_id = '';
  let role_id = '';
  let history = '';
  let activity_log = '';
  let guestfullname='';

  if(req?.user || req?.body?.user_id) {

    if(req?.body?.user_id) {
      user_id = req.body.user_id;
      role_id = req.body.role_id;
    } else {
      user_id = req.user.id;
      role_id = req.user.role_id;
    }

    history = `PENDING_Request Created_${today}_${req.user.role_name}_${req.user.name}`;
    activity_log = [
      {
        date: today,
        name: req.user.name,
        role: req.user.role_name,
        activity: "Request Created",
        activity_type: "PENDING",
      },
    ];

  } else {
    //guest
    user_id = null;
    role_id = 0;
    guestfullname = req.body.name;

    history = `PENDING_Request Created_${today}_GUEST_${req.body.name}`;
    activity_log = [
      {
        date: today,
        name: guestfullname,
        role: "GUEST",
        activity: "Request Created",
        activity_type: "PENDING",
      },
    ];
  }
if(!req.body.linkedRequestId) {
  const q = `INSERT INTO keppel.request(
    fault_id,fault_description,plant_id, req_id, user_id, role_id, psa_id, guestfullname, created_date, status_id, uploaded_file, uploadfilemimetype, requesthistory, associatedrequestid, activity_log
  ) VALUES (
    $1,$2,$3,$4,$5,$6,$7,$8,NOW(),'1',$9,$10,$11,$12,$13
  )`;
  db.query(q
    ,
    [
      faultTypeID,
      description,
      plantLocationID,
      requestTypeID,
      user_id,
      role_id,
      taggedAssetID,
      guestfullname,
      fileBuffer,
      fileType,
      history,
      req.body.linkedRequestId,
      JSON.stringify(activity_log),
    ],
    (err, result) => {
      if (err) return res.status(500).json({ errormsg: err });
      if (result.rows.length == 0) return res.status(404).json({ msg: "No checklist" });
      res.status(200).send({ msg: "Request created successfully" });

    }
  );
}
else if (req.body.linkedRequestId){
  const insertQuery = `
  INSERT INTO keppel.request(
    fault_id,fault_description,plant_id, req_id, user_id, role_id, psa_id, created_date, status_id, uploaded_file, uploadfilemimetype, requesthistory, associatedrequestid, activity_log
  ) VALUES (
    $1,$2,$3,$4,$5,$6,$7,NOW(),'1',$8,$9,$10,$11,$12
  );
`;
const updateQuery = `
UPDATE keppel.request SET status_id = 3 WHERE request_id = $1;
`;

db.query(insertQuery, [
  faultTypeID,
  description,
  plantLocationID,
  requestTypeID,
  user_id,
  role_id,
  taggedAssetID,
  fileBuffer,
  fileType,
  history,
  req.body.linkedRequestId,
  JSON.stringify(activity_log),
], (err, result) => {
  if (err) {
    console.log(err);
    return next(err);
  }

  db.query(updateQuery, [req.body.linkedRequestId], (err, result) => {
    if (err) {
      console.log(err);
      return next(err);
    }

    res.status(200).send({ message: "Request created successfully" });
  });
});

  }
};


const updateRequest = async (req, res, next) => {
  const assignUserName = req.body.assignedUser.label.split("|")[0].trim();
  const today = moment(new Date()).format("DD/MM/YYYY HH:mm A");
  const history = `!ASSIGNED_Assign ${assignUserName} to Case ID: ${req.params.request_id}_${today}_${req.user.role_name}_${req.user.name}!ASSIGNED_Update Priority to ${req.body.priority.priority}_${today}_${req.user.role_name}_${req.user.name}`;
  db.query(
    `
		UPDATE keppel.request SET 
      assigned_user_id = $1,
      priority_id = $2,
      requesthistory = concat(requesthistory, $3::text),
      status_id = 2,
      activity_log = activity_log || 
        jsonb_build_object(
          'date', '${today}',
          'name', '${req.user.name}',
          'role', '${req.user.role_name}',
          'activity', 'Assigned ${assignUserName} to Case ID: ${req.params.request_id}',
          'activity_type', 'ASSIGNED'
        )
    WHERE request_id = $4
	`,
    [
      req.body.assignedUser.value,
      req.body.priority.p_id,
      history,
      req.params.request_id,
    ],
    (err) => {
      if (err) console.log(err);
      return res.status(200).json("Request successfully updated");
    }
  );
};

const fetchRequestTypes = async (req, res, next) => {
  db.query(
    `SELECT * FROM keppel.request_type ORDER BY req_id ASC`,
    (err, result) => {
      if (err) return res.status(500).json({ errormsg: err });
      res.status(200).json(result.rows);
    }
  );
};

const fetchRequestCounts = async (req, res, next) => {
  let sql;
  let date = req.params.date;
  let datetype = req.params.datetype;
  let dateCond = "";
  let userRoleCond = "";
  if (![1, 2, 3].includes(req.user.role_id)) {
    userRoleCond = `AND (r.assigned_user_id = ${req.user.id} OR r.user_id = ${req.user.id})`;
  }

  if (date !== "all") {
    switch (datetype) {
      case "week":
        dateCond = `
                  AND DATE_PART('week', R.CREATED_DATE::DATE) = DATE_PART('week', '${date}'::DATE) 
                  AND DATE_PART('year', R.CREATED_DATE::DATE) = DATE_PART('year', '${date}'::DATE)`;

        break;

      case "month":
        dateCond = `
                  AND DATE_PART('month', R.CREATED_DATE::DATE) = DATE_PART('month', '${date}'::DATE) 
                  AND DATE_PART('year', R.CREATED_DATE::DATE) = DATE_PART('year', '${date}'::DATE)`;

        break;

      case "year":
        dateCond = `AND DATE_PART('year', R.CREATED_DATE::DATE) = DATE_PART('year', '${date}'::DATE)`;

        break;

      case "quarter":
        dateCond = `
                  AND DATE_PART('quarter', R.CREATED_DATE::DATE) = DATE_PART('quarter', '${date}'::DATE) 
                  AND DATE_PART('year', R.CREATED_DATE::DATE) = DATE_PART('year', '${date}'::DATE)`;

        break;
      default:
        dateCond = `AND R.CREATED_DATE::DATE = '${date}'::DATE`;
    }
  }

  switch (req.params.field) {
    case "status":
      sql =
        req.params.plant != 0
          ? `SELECT S.STATUS AS NAME, R.STATUS_ID AS ID, COUNT(R.STATUS_ID) AS VALUE FROM KEPPEL.REQUEST R
				JOIN KEPPEL.STATUS_PM S ON S.STATUS_ID = R.STATUS_ID
				WHERE R.PLANT_ID = ${req.params.plant}
        ${userRoleCond}
				${dateCond}	
				GROUP BY(R.STATUS_ID, S.STATUS) ORDER BY (name)`
          : `SELECT S.STATUS AS NAME, R.STATUS_ID AS ID, COUNT(R.STATUS_ID) AS VALUE FROM KEPPEL.REQUEST R
				JOIN KEPPEL.STATUS_PM S ON S.STATUS_ID = R.STATUS_ID
				WHERE 1 = 1 
        ${userRoleCond}
				${dateCond}

				GROUP BY(R.STATUS_ID, S.STATUS) ORDER BY (name)`;
      break;
    case "fault":
      sql =
        req.params.plant != 0
          ? `SELECT FT.FAULT_TYPE AS NAME, R.FAULT_ID AS ID, COUNT(R.FAULT_ID) AS VALUE FROM 
				KEPPEL.REQUEST R 
				JOIN KEPPEL.FAULT_TYPES FT ON R.FAULT_ID = FT.FAULT_ID
				WHERE R.STATUS_ID != 5 AND 
				R.STATUS_ID != 7 AND
				R.PLANT_ID = ${req.params.plant}
        ${userRoleCond}
				${dateCond}	
				GROUP BY(FT.FAULT_TYPE, R.FAULT_ID) ORDER BY (name)`
          : `SELECT FT.FAULT_TYPE AS NAME, R.FAULT_ID AS ID, COUNT(R.FAULT_ID) AS VALUE FROM 
				KEPPEL.REQUEST R 
				JOIN KEPPEL.FAULT_TYPES FT ON R.FAULT_ID = FT.FAULT_ID
				WHERE R.STATUS_ID != 5 AND R.STATUS_ID != 7
        ${userRoleCond}
				${dateCond}	
				GROUP BY(FT.FAULT_TYPE, R.FAULT_ID) ORDER BY (name)`;
      break;
    case "priority":
      sql =
        req.params.plant != 0
          ? `SELECT P.PRIORITY AS NAME, R.PRIORITY_ID AS ID, COUNT(R.PRIORITY_ID) AS VALUE FROM 
				KEPPEL.REQUEST R 
				JOIN KEPPEL.PRIORITY P ON R.PRIORITY_ID = P.P_ID
				WHERE R.STATUS_ID != 5 AND 
				R.STATUS_ID != 7 AND
				R.PLANT_ID = ${req.params.plant}
        ${userRoleCond}
				${dateCond}	
				GROUP BY(P.PRIORITY, R.PRIORITY_ID) ORDER BY (ID)`
          : `SELECT P.PRIORITY AS NAME, R.PRIORITY_ID AS ID, COUNT(R.PRIORITY_ID) AS VALUE FROM 
				KEPPEL.REQUEST R 
				JOIN KEPPEL.PRIORITY P ON R.PRIORITY_ID = P.P_ID
				WHERE R.STATUS_ID != 5 AND R.STATUS_ID != 7
        ${userRoleCond}
				${dateCond}	
				GROUP BY(P.PRIORITY, R.PRIORITY_ID) ORDER BY (ID)`;
      break;
    default:
      return res
        .status(404)
        .send(`Invalid request type of ${req.params.field}`);
  }

  db.query(sql, (err, result) => {
    if (err)
      return res
        .status(500)
        .send(`Error in fetching request ${req.params.field} for dashboard`);
    return res.status(200).send(result.rows);
  });
};

const fetchRequestPriority = async (req, res, next) => {
  db.query(`SELECT * from keppel.priority`, (err, result) => {
    if (err) return res.status(500).send("Error in priority");
    return res.status(200).json(result.rows);
  });
};

const fetchSpecificRequest = async (req, res, next) => {
  console.log(req.params.request_id)
  const sql = `SELECT 
  r.request_id,
  rt.request as request_name, 
  r.req_id, 
  ft.fault_type as fault_name, 
  r.fault_id, 
  r.fault_description, 
  pm.plant_name, 
  r.plant_id, 
  psa.plant_asset_instrument as asset_name, 
  r.psa_id, 
  r.uploaded_file, 
  r.assigned_user_id, 
  r.priority_id, 
  pr.priority,
  r.status_id,
  s.status,
  u.user_email as assigned_user_email,
  r.uploaded_file,
  r.completion_file,
  r.complete_comments,
  r.rejection_comments,
  r.requesthistory,
  concat( concat(u.first_name,' '), u.last_name) AS assigned_user_name,
  concat( concat(ua.first_name,' '), ua.last_name) AS created_by,
  r.created_date
  FROM keppel.request AS r
  JOIN keppel.request_type AS rt ON rt.req_id = r.req_id
  JOIN keppel.fault_types  AS ft ON ft.fault_id = r.fault_id
  JOIN keppel.plant_master AS pm ON pm.plant_id = r.plant_id
  JOIN keppel.plant_system_assets AS psa ON psa.psa_id = r.psa_id
  LEFT JOIN keppel.priority AS pr ON r.priority_id = pr.p_id
  LEFT JOIN keppel.users AS u ON r.assigned_user_id = u.user_id
	LEFT JOIN keppel.user_access ua ON u.user_id = ua.user_id
  JOIN keppel.status_pm AS s ON r.status_id = s.status_id
  WHERE request_id = $1`;
  db.query(sql, [req.params.request_id], (err, result) => {
    if (err) return res.status(500).send("Error in fetching request");
    if(result.rows.length === 0) return res.status(404).send("Request not found");
    return res.status(200).send(result.rows[0]);
  });
};

const createRequestCSV = (req, res, next) => {
  const sql =
    req.user.role_id === 1 || req.user.role_id === 2 || req.user.role_id === 3
      ? `SELECT r.request_id , ft.fault_type, pm.plant_name,
	rt.request, ro.role_name, sc.status,r.fault_description, rt.request AS request_type,
	pri.priority, 
	CASE 
		WHEN (concat( concat(req_u.first_name ,' '), req_u.last_name) = ' ') THEN r.guestfullname
		ELSE concat( concat(req_u.first_name ,' '), req_u.last_name )
	END AS Approver,
	r.created_date,tmp1.asset_name, 
	r.complete_comments,
	concat( concat(au.first_name,' '), au.last_name) AS assigned_user_name, r.associatedrequestid
	, r.rejection_comments, r.status_id
	FROM    
		keppel.users u
		JOIN keppel.user_access ua ON u.user_id = ua.user_id
		JOIN keppel.request r ON ua.allocatedplantids LIKE concat(concat('%',r.plant_id::text) , '%')
		left JOIN keppel.users req_u ON r.user_id = req_u.user_id
		left JOIN keppel.fault_types ft ON r.fault_id = ft.fault_id
		left JOIN keppel.plant_master pm ON pm.plant_id = r.plant_id 
		left JOIN keppel.request_type rt ON rt.req_id = r.req_id
		left JOIN keppel.priority pri ON pri.p_id = r.priority_id
		left JOIN keppel.role ro ON ro.role_id = r.role_id
		left JOIN keppel.status_pm sc ON sc.status_id = r.status_id
		left JOIN keppel.users au ON au.user_id = r.assigned_user_id
		left JOIN (SELECT psa_id ,  concat( system_asset , ' | ' , plant_asset_instrument ) AS asset_name 
			from  keppel.system_assets   AS t1 ,keppel.plant_system_assets AS t2
			WHERE t1.system_asset_id = t2.system_asset_id_lvl4) tmp1 ON tmp1.psa_id = r.psa_id
	GROUP BY (
		r.request_id,
		ft.fault_type,
		pm.plant_name,
		pm.plant_id,
		rt.request,
		ro.role_name,
		sc.status,
		pri.priority,
		req_u.first_name,
		tmp1.asset_name,
		req_u.last_name,
		au.first_name,
		au.last_name
	)
	ORDER BY r.created_date DESC, r.status_id DESC;`
      : `SELECT r.request_id , ft.fault_type AS fault_name, pm.plant_name,pm.plant_id,
	rt.request, ro.role_name, sc.status,r.fault_description, rt.request AS request_type,
	pri.priority, 
	CASE 
		WHEN (concat( concat(req_u.first_name ,' '), req_u.last_name) = ' ') THEN r.guestfullname
		ELSE concat( concat(req_u.first_name ,' '), req_u.last_name )
	END AS fullname,
	r.created_date,tmp1.asset_name,
	r.complete_comments,
	concat( concat(au.first_name,' '), au.last_name) AS assigned_user_name, r.associatedrequestid
	, r.rejection_comments, r.status_id
	FROM    
		keppel.users u
		JOIN keppel.user_access ua ON u.user_id = ua.user_id
		JOIN keppel.request r ON ua.allocatedplantids LIKE concat(concat('%',r.plant_id::text) , '%')
		left JOIN keppel.users req_u ON r.user_id = req_u.user_id
		left JOIN keppel.fault_types ft ON r.fault_id = ft.fault_id
		left JOIN keppel.plant_master pm ON pm.plant_id = r.plant_id 
		left JOIN keppel.request_type rt ON rt.req_id = r.req_id
		left JOIN keppel.priority pri ON pri.p_id = r.priority_id
		left JOIN keppel.role ro ON ro.role_id = r.role_id
		left JOIN keppel.status_pm sc ON sc.status_id = r.status_id
		left JOIN keppel.users au ON au.user_id = r.assigned_user_id
		left JOIN (SELECT psa_id ,  concat( system_asset , ' | ' , plant_asset_instrument ) AS asset_name 
			from  keppel.system_assets   AS t1 ,keppel.plant_system_assets AS t2
			WHERE t1.system_asset_id = t2.system_asset_id_lvl4) tmp1 ON tmp1.psa_id = r.psa_id
	WHERE r.assigned_user_id = ${req.user.id} OR r.user_id = ${req.user.id}
	GROUP BY (
		r.request_id,
		ft.fault_type,
		pm.plant_name,
		pm.plant_id,
		rt.request,
		ro.role_name,
		sc.status,
		pri.priority,
		req_u.first_name,
		tmp1.asset_name,
		req_u.last_name,
		au.first_name,
		au.last_name
	)
	ORDER BY r.created_date DESC, r.status_id DESC;`;

  db.query(sql, (err, result) => {
    if (err) return res.status(500).json({ errormsg: err });
    generateCSV(result.rows)
      .then((buffer) => {
        res.set({
          "Content-Type": "text/csv",
        });
        return res.status(200).send(buffer);
      })
      .catch((error) => {
        res.status(500).send(`Error in generating csv file`);
      });
  });
};

const approveRejectRequest = async (req, res, next) => {
  const today = moment(new Date()).format("DD/MM/YYYY HH:mm A");
  const status = req.params.status_id == 4 ? "APPROVED" : "REJECTED";
  const text = req.params.status_id == 4 ? "Approved" : "Rejected";
  const history = `!${status}_${text} request_${today}_${req.user.role_name}_${req.user.name}`;
  console.log(req.body);
  const sql = `
	UPDATE keppel.request SET 
	status_id = $1,
	rejection_comments = $2,
	requesthistory = concat(requesthistory, $3::text),
  activity_log = activity_log || 
        jsonb_build_object(
          'date', '${today}',
          'name', '${req.user.name}',
          'role', '${req.user.role_name}',
          'activity', '${text} request',
          'activity_type', '${status}'
        )
	WHERE request_id = $4`;
  db.query(
    sql,
    [req.params.status_id, req.body.comments, history, req.params.request_id],
    (err, result) => {
      if (err) return res.status(500).send("Error in updating status");
      return res.status(200).json("Request successfully updated");
    }
  );
};

const completeRequest = async (req, res, next) => {
  const fileBuffer = req.file === undefined ? null : req.file.buffer;
  const fileType = req.file === undefined ? null : req.file.mimetype;
  const today = moment(new Date()).format("DD/MM/YYYY HH:mm A");
  const history = `!COMPLETED_Completed request_${today}_${req.user.role_name}_${req.user.name}`;

  const sql = `UPDATE keppel.request SET
		complete_comments = $1,
		completion_file = $2,
		completedfilemimetype = $3,
		status_id = 3,
		requesthistory = concat(requesthistory, $4::text),
    activity_log = activity_log || 
        jsonb_build_object(
          'date', '${today}',
          'name', '${req.user.name}',
          'role', '${req.user.role_name}',
          'activity', 'Completed request',
          'activity_type', 'COMPLETED'
        )
		WHERE request_id = $5`;
  db.query(
    sql,
    [
      req.body.complete_comments,
      fileBuffer,
      fileType,
      history,
      req.params.request_id,
    ],
    (err, result) => {
      if (err) {
        console.log(err);
        return res.status(500).send("Error in updating status");
      }
      return res.status(200).json("Request successfully updated");
    }
  );
};

const fetchFilteredRequests = async (req, res, next) => {
  let date = req.params.date;
  let datetype = req.params.datetype;
  let status = req.params.status;
  let plant = req.params.plant;
  let page = req.params?.page;
  let dateCond = "";
  let statusCond = "";
  let plantCond = "";
  let userRoleCond = "";
  let pageCond = "";

  if (page) {
    const offsetItems = (page - 1) * ITEMS_PER_PAGE;
    pageCond = `OFFSET ${offsetItems} LIMIT ${ITEMS_PER_PAGE}`;
  }

  if (![1, 2, 3].includes(req.user.role_id)) {
    userRoleCond = `AND (r.assigned_user_id = ${req.user.id} OR r.user_id = ${req.user.id})`;
  }

  if (plant && plant != 0) {
    plantCond = `AND r.plant_id = '${plant}'`;
  }

  if (status && status != 0) {
    if(status.includes(",")) {
      statusCond = `AND r.status_id IN (${status})`;
    } else {
      statusCond = `AND r.status_id = '${status}'`;
    }
  }

  if (date !== "all") {
    switch (datetype) {
      case "week":
        dateCond = `
                  AND DATE_PART('week', R.CREATED_DATE::DATE) = DATE_PART('week', '${date}'::DATE) 
                  AND DATE_PART('year', R.CREATED_DATE::DATE) = DATE_PART('year', '${date}'::DATE)`;

        break;

      case "month":
        dateCond = `
                  AND DATE_PART('month', R.CREATED_DATE::DATE) = DATE_PART('month', '${date}'::DATE) 
                  AND DATE_PART('year', R.CREATED_DATE::DATE) = DATE_PART('year', '${date}'::DATE)`;

        break;

      case "year":
        dateCond = `AND DATE_PART('year', R.CREATED_DATE::DATE) = DATE_PART('year', '${date}'::DATE)`;

        break;

      case "quarter":
        dateCond = `
                  AND DATE_PART('quarter', R.CREATED_DATE::DATE) = DATE_PART('quarter', '${date}'::DATE) 
                  AND DATE_PART('year', R.CREATED_DATE::DATE) = DATE_PART('year', '${date}'::DATE)`;

        break;
      default:
        dateCond = `AND R.CREATED_DATE::DATE = '${date}'::DATE`;
    }
  }

  const sql = `SELECT r.request_id , ft.fault_type AS fault_name, pm.plant_name,pm.plant_id,
		rt.request, ro.role_name, sc.status,r.fault_description, rt.request AS request_type,
		pri.priority, 
		CASE 
			WHEN (concat( concat(req_u.first_name ,' '), req_u.last_name) = ' ') THEN r.guestfullname
			ELSE concat( concat(req_u.first_name ,' '), req_u.last_name )
		END AS fullname,
		r.created_date,tmp1.asset_name, r.uploadfilemimetype, r.completedfilemimetype, r.uploaded_file, r.completion_file,
		r.complete_comments,
		concat( concat(au.first_name,' '), au.last_name) AS assigned_user_name, r.associatedrequestid
		, r.requesthistory, r.rejection_comments, r.status_id
		FROM    
			keppel.users u
			JOIN keppel.user_access ua ON u.user_id = ua.user_id
			JOIN keppel.request r ON ua.allocatedplantids LIKE concat(concat('%',r.plant_id::text) , '%')
			left JOIN keppel.users req_u ON r.user_id = req_u.user_id
			left JOIN keppel.fault_types ft ON r.fault_id = ft.fault_id
			left JOIN keppel.plant_master pm ON pm.plant_id = r.plant_id 
			left JOIN keppel.request_type rt ON rt.req_id = r.req_id
			left JOIN keppel.priority pri ON pri.p_id = r.priority_id
			left JOIN keppel.role ro ON ro.role_id = r.role_id
			left JOIN keppel.status_pm sc ON sc.status_id = r.status_id
			left JOIN keppel.users au ON au.user_id = r.assigned_user_id
			left JOIN (SELECT psa_id ,  concat( system_asset , ' | ' , plant_asset_instrument ) AS asset_name 
				from  keppel.system_assets   AS t1 ,keppel.plant_system_assets AS t2
				WHERE t1.system_asset_id = t2.system_asset_id_lvl4) tmp1 ON tmp1.psa_id = r.psa_id
        WHERE 1 = 1
      ${userRoleCond}
      ${dateCond}
      ${statusCond}
      ${plantCond}

		GROUP BY (
			r.request_id,
			ft.fault_type,
			pm.plant_name,
			pm.plant_id,
			rt.request,
			ro.role_name,
			sc.status,
			pri.priority,
			req_u.first_name,
			tmp1.asset_name,
			req_u.last_name,
			au.first_name,
			au.last_name
		)
		ORDER BY r.created_date DESC, r.status_id DESC
    
    `;

  const countSql = `SELECT COUNT(*) AS total FROM (${sql}) AS t1`;

  const totalRows = await db.query(countSql);
  const totalPages = Math.ceil(+totalRows.rows[0].total / ITEMS_PER_PAGE);

  db.query(sql + pageCond, (err, result) => {
    if (err) return res.status(400).json({ errormsg: err });
    if (result.rows.length == 0)
      return res.status(404).json({ msg: "No requests" });

    res.status(200).json({ rows: result.rows, total: totalPages });
  });
};

const fetchRequestUploadedFile = async (req, res, next) => {
  const sql = `SELECT 
  r.uploaded_file,
  r.uploadfilemimetype
  FROM keppel.request AS r
  JOIN keppel.request_type AS rt ON rt.req_id = r.req_id
  JOIN keppel.fault_types  AS ft ON ft.fault_id = r.fault_id
  JOIN keppel.plant_master AS pm ON pm.plant_id = r.plant_id
  JOIN keppel.plant_system_assets AS psa ON psa.psa_id = r.psa_id
  LEFT JOIN keppel.priority AS pr ON r.priority_id = pr.p_id
  LEFT JOIN keppel.users AS u ON r.assigned_user_id = u.user_id
	LEFT JOIN keppel.user_access ua ON u.user_id = ua.user_id
  JOIN keppel.status_pm AS s ON r.status_id = s.status_id
  WHERE request_id = $1`;
  db.query(sql, [req.params.request_id], (err, result) => {

    if (err) return res.status(500).send("Error in fetching request");
    if(result.rows.length === 0 || result.rows[0].uploaded_file === null) return res.status(404).send("File not found");

    const { uploaded_file, uploadfilemimetype } = result.rows[0];

    const arrayBuffer = new Uint8Array(uploaded_file);
    const buffer = Buffer.from(arrayBuffer).toString('base64');
    const img = Buffer.from(buffer, 'base64');

    const filename = `request_${req.params.request_id}.${uploadfilemimetype.split('/')[1]}`;

     res.writeHead(200, {
      'Content-Type': uploadfilemimetype,
      'Content-Length': img.length
    });

    res.end(img);

    //return res.status(200).send(result.rows[0]);
  });
};

module.exports = {
  fetchPendingRequests,
  fetchAssignedRequests,
  fetchReviewRequests,
  fetchApprovedRequests,
  createRequest,
  fetchRequestTypes,
  fetchRequestCounts,
  createRequestCSV,
  fetchSpecificRequest,
  fetchRequestPriority,
  updateRequest,
  approveRejectRequest,
  completeRequest,
  fetchPendingRequests,
  fetchFilteredRequests,
  fetchRequestUploadedFile
};
