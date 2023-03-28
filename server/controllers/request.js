const db = require("../../db");
const { generateCSV } = require("../csvGenerator");
const moment = require("moment");

/** Express router providing user related routes
 * @module controllers/request
 * @requires db
 */

const fetchRequests = async (req, res, next) => {
    const sql =
        req.user.role_id === 1 || req.user.role_id === 2 || req.user.role_id === 3
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

        res.status(200).json(result.rows);
    });
};

const createRequest = async (req, res, next) => {
    const { requestTypeID, faultTypeID, description, plantLocationID, taggedAssetID } = req.body;
    const fileBuffer = req.file === undefined ? null : req.file.buffer;
    const fileType = req.file === undefined ? null : req.file.mimetype;
    const today = moment(new Date()).format("DD/MM/YYYY HH:mm A");
    const history = `PENDING_Request Created_${today}_${req.user.role_name}_${req.user.name}`;
    db.query(
        `INSERT INTO keppel.request(
			fault_id,fault_description,plant_id, req_id, user_id, role_id, psa_id, created_date, status_id, uploaded_file, uploadfilemimetype, requesthistory, associatedrequestid
		) VALUES (
			$1,$2,$3,$4,$5,$6,$7,NOW(),'1',$8,$9,$10,$11
		)`,
        [
            faultTypeID,
            description,
            plantLocationID,
            requestTypeID,
            req.user.id,
            req.user.role_id,
            taggedAssetID,
            fileBuffer,
            fileType,
            history,
            req.body.linkedRequestId,
        ],
        (err, result) => {
            if (err) return res.status(500).json({ errormsg: err });

            res.status(200).json("success");
        }
    );
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
		status_id = 2
		WHERE request_id = $4
	`,
        [req.body.assignedUser.value, req.body.priority.p_id, history, req.params.request_id],
        (err) => {
            if (err) console.log(err);
            return res.status(200).json("Request successfully updated");
        }
    );
};

const fetchRequestTypes = async (req, res, next) => {
    db.query(`SELECT * FROM keppel.request_type ORDER BY req_id ASC`, (err, result) => {
        if (err) return res.status(500).json({ errormsg: err });
        res.status(200).json(result.rows);
    });
};

const fetchRequestCounts = async (req, res, next) => {
    let sql;
    switch (req.params.field) {
        case "status":
            sql =
                req.params.plant != 0
                    ? `SELECT S.STATUS AS NAME, R.STATUS_ID AS ID, COUNT(R.STATUS_ID) AS VALUE FROM KEPPEL.REQUEST R
				JOIN KEPPEL.STATUS_PM S ON S.STATUS_ID = R.STATUS_ID
				WHERE R.PLANT_ID = ${req.params.plant}
				GROUP BY(R.STATUS_ID, S.STATUS) ORDER BY (name)`
                    : `SELECT S.STATUS AS NAME, R.STATUS_ID AS ID, COUNT(R.STATUS_ID) AS VALUE FROM KEPPEL.REQUEST R
				JOIN KEPPEL.STATUS_PM S ON S.STATUS_ID = R.STATUS_ID

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
				GROUP BY(FT.FAULT_TYPE, R.FAULT_ID) ORDER BY (name)`
                    : `SELECT FT.FAULT_TYPE AS NAME, R.FAULT_ID AS ID, COUNT(R.FAULT_ID) AS VALUE FROM 
				KEPPEL.REQUEST R 
				JOIN KEPPEL.FAULT_TYPES FT ON R.FAULT_ID = FT.FAULT_ID
				WHERE R.STATUS_ID != 5 AND R.STATUS_ID != 7
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
				GROUP BY(P.PRIORITY, R.PRIORITY_ID) ORDER BY (ID)`
                    : `SELECT P.PRIORITY AS NAME, R.PRIORITY_ID AS ID, COUNT(R.PRIORITY_ID) AS VALUE FROM 
				KEPPEL.REQUEST R 
				JOIN KEPPEL.PRIORITY P ON R.PRIORITY_ID = P.P_ID
				WHERE R.STATUS_ID != 5 AND R.STATUS_ID != 7
				GROUP BY(P.PRIORITY, R.PRIORITY_ID) ORDER BY (ID)`;
            break;
        default:
            return res.status(404).send(`Invalid request type of ${req.params.field}`);
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
    const sql = `SELECT 
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
  u.user_email as assigned_user_email,
  r.uploaded_file,
  r.completion_file,
  r.complete_comments
  FROM keppel.request AS r
  JOIN keppel.request_type AS rt ON rt.req_id = r.req_id
  JOIN keppel.fault_types  AS ft ON ft.fault_id = r.fault_id
  JOIN keppel.plant_master AS pm ON pm.plant_id = r.plant_id
  JOIN keppel.plant_system_assets AS psa ON psa.psa_id = r.psa_id
  LEFT JOIN keppel.priority AS pr ON r.priority_id = pr.p_id
  LEFT JOIN keppel.users AS u ON r.assigned_user_id = u.user_id
  WHERE request_id = $1`;
    db.query(sql, [req.params.request_id], (err, result) => {
        if (err) return res.status(500).send("Error in fetching request");
        return res.status(200).send(result.rows[0]);
    });
};

const createRequestCSV = (req, res, next) => {
    const sql =
        req.user.role_id === 1 || req.user.role_id === 2 || req.user.role_id === 3
            ? `SELECT r.request_id , ft.fault_type AS fault_name, pm.plant_name,pm.plant_id,
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
    const sql = `
	UPDATE keppel.request SET 
	status_id = $1,
	rejection_comments = $2
	WHERE request_id = $3`;
    db.query(
        sql,
        [req.params.status_id, req.body.comments, req.params.request_id],
        (err, result) => {
            if (err) return res.status(500).send("Error in updating status");
            return res.status(200).json("Request successfully updated");
        }
    );
};

const completeRequest = async (req, res, next) => {
	res.send(req)
	const fileBuffer = req.body.completion_file === undefined ? null : req.file.buffer;
    const fileType = req.body.completion_file === undefined ? null : req.file.mimetype;
	console.log(fileType, fileBuffer)
	// const sql = `UPDATE keppel.request SET
	// 	completion_file = $1,
	// 	completed_comments = $2
	// 	WHERE request_id = $3`;
	// 	db.query(
	// 		sql,
	// 		[req.body.completion_file, req.body.completed_comments , req.params.request_id],
	// 		(err, result) => {
	// 			if (err) return res.status(500).send("Error in updating status");
	// 			return res.status(200).json("Request successfully updated");
	// 		}
	// 	);
};

module.exports = {
    fetchRequests,
    createRequest,
    fetchRequestTypes,
    fetchRequestCounts,
    createRequestCSV,
    fetchSpecificRequest,
    fetchRequestPriority,
    updateRequest,
    approveRejectRequest,
	completeRequest,
};
