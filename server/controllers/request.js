const db = require("../../db");

/** Express router providing user related routes
 * @module controllers/request
 * @requires db
 */

const fetchRequests = async (req, res, next) => {
	const sql = (req.user.role_id === 1 || req.user.role_id === 2 || req.user.role_id === 3) ? 
		`SELECT r.request_id , ft.fault_type AS fault_name, pm.plant_name,pm.plant_id,
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
		ORDER BY r.created_date DESC, r.status_id DESC;` :
		`SELECT r.request_id , ft.fault_type AS fault_name, pm.plant_name,pm.plant_id,
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
		ORDER BY r.created_date DESC, r.status_id DESC;`
	db.query(sql, (err, result) => {
		if(err) return res.status(500).json({errormsg: err});

		res.status(200).json(result.rows);
	});
}

const createRequest = async (req, res, next) => {

	const { requestTypeID, faultTypeID, description, plantLocationID, taggedAssetID } = req.body;
	const fileBuffer	= (req.file === undefined) ? null : req.file.buffer;
	const fileType		= (req.file === undefined) ? null : req.file.mimetype;

	db.query(`INSERT INTO keppel.request(
			fault_id,fault_description,plant_id, req_id, user_id, role_id, psa_id, created_date, status_id, uploaded_file, uploadfilemimetype
		) VALUES (
			$1,$2,$3,$4,$5,$6,$7,NOW(),'1',$8,$9
		)`, [
			faultTypeID, description, plantLocationID, requestTypeID, req.user.id, req.user.role_id, taggedAssetID, fileBuffer, fileType
		], (err, result) => {
			if(err) return res.status(500).json({errormsg: err});
	
			res.status(200).json("success");
		}
	);
}

const fetchRequestTypes = async (req, res, next) => {
	db.query(`SELECT * FROM keppel.request_type ORDER BY req_id ASC`, (err, result) => {
		if(err) return res.status(500).json({errormsg: err});
		res.status(200).json(result.rows);
	})
}

// const fetchRequestStatus = async (req, res, next) => {
//     const sql = req.params.plant != 0 ? `SELECT S.STATUS AS NAME, R.STATUS_ID AS ID, COUNT(R.STATUS_ID) AS VALUE FROM KEPPEL.REQUEST R
//     JOIN KEPPEL.STATUS_CM S ON S.STATUS_ID = R.STATUS_ID
//     WHERE R.PLANT_ID = ${req.params.plant}
//     GROUP BY(R.STATUS_ID, S.STATUS) ORDER BY (status)` : 
//     `SELECT S.STATUS AS NAME, R.STATUS_ID AS ID, COUNT(R.STATUS_ID) AS VALUE FROM KEPPEL.REQUEST R
//     JOIN KEPPEL.STATUS_CM S ON S.STATUS_ID = R.STATUS_ID
//     GROUP BY(R.STATUS_ID, S.STATUS) ORDER BY (status)`;

//     db.query(sql, (err, result) => {
//         if (err) return res.status(500).send("Error in fetching request for dashboard");
//         return res.status(200).send(result.rows);
//     });
// };

// const fetchRequestPriority = async (req, res, next) => {
// 	const sql = req.params.plant != 0 ? `SELECT P.PRIORITY AS NAME, R.PRIORITY_ID AS ID, COUNT(R.PRIORITY_ID) AS VALUE FROM 
// 	KEPPEL.REQUEST R 
// 	JOIN KEPPEL.PRIORITY P ON R.PRIORITY_ID = P.P_ID
// 	WHERE R.STATUS_ID != 5 AND 
// 	R.STATUS_ID != 7 AND
// 	R.PLANT_ID = ${req.params.plant}
//     GROUP BY(P.PRIORITY, R.PRIORITY_ID) ORDER BY (status)` : 
//     `SELECT P.PRIORITY AS NAME, R.PRIORITY_ID AS ID, COUNT(R.PRIORITY_ID) AS VALUE FROM 
// 	KEPPEL.REQUEST R 
// 	JOIN KEPPEL.PRIORITY P ON R.PRIORITY_ID = P.P_ID
// 	WHERE R.STATUS_ID != 5 AND R.STATUS_ID != 7
// 	GROUP BY(P.PRIORITY, R.PRIORITY_ID)`;

// 	db.query(sql, (err, result) => {
//         if (err) return res.status(500).send("Error in fetching request priorities for dashboard");
//         return res.status(200).send(result.rows);
//     });
// };

// const fetchRequestFaults = async (req, res, next) => {
// 	const sql = req.params.plant != 0 ? `SELECT FT.FAULT_TYPE AS NAME, R.FAULT_ID AS ID, COUNT(R.FAULT_ID) AS VALUE FROM 
// 	KEPPEL.REQUEST R 
// 	JOIN KEPPEL.FAULT_TYPES FT ON R.FAULT_ID = FT.FAULT_ID
// 	WHERE R.STATUS_ID != 5 AND 
// 	R.STATUS_ID != 7 AND
// 	R.PLANT_ID = ${req.params.plant}
//     GROUP BY(FT.FAULT_TYPE) ORDER BY (status)` : 
//     `SELECT FT.FAULT_TYPE AS NAME, R.FAULT_ID AS ID, COUNT(R.FAULT_ID) AS VALUE FROM 
// 	KEPPEL.REQUEST R 
// 	JOIN KEPPEL.FAULT_TYPES FT ON R.FAULT_ID = FT.FAULT_ID
// 	WHERE R.STATUS_ID != 5 AND R.STATUS_ID != 7
// 	GROUP BY(FT.FAULT_TYPE)`;


// 	db.query(sql, (err, result) => {
//         if (err) return res.status(500).send("Error in fetching request faults for dashboard");
//         return res.status(200).send(result.rows);
//     });
// };

const fetchRequestCounts = async (req, res, next) => {
	let sql;
	switch(req.params.field) {
		case "status":
			sql = req.params.plant != 0 ? `SELECT S.STATUS AS NAME, R.STATUS_ID AS ID, COUNT(R.STATUS_ID) AS VALUE FROM KEPPEL.REQUEST R
				JOIN KEPPEL.STATUS_CM S ON S.STATUS_ID = R.STATUS_ID
				WHERE R.PLANT_ID = ${req.params.plant}
				GROUP BY(R.STATUS_ID, S.STATUS) ORDER BY (name)` : 
				`SELECT S.STATUS AS NAME, R.STATUS_ID AS ID, COUNT(R.STATUS_ID) AS VALUE FROM KEPPEL.REQUEST R
				JOIN KEPPEL.STATUS_CM S ON S.STATUS_ID = R.STATUS_ID
				GROUP BY(R.STATUS_ID, S.STATUS) ORDER BY (name)`;
			break;
		case "fault":
			sql = req.params.plant != 0 ? `SELECT FT.FAULT_TYPE AS NAME, R.FAULT_ID AS ID, COUNT(R.FAULT_ID) AS VALUE FROM 
				KEPPEL.REQUEST R 
				JOIN KEPPEL.FAULT_TYPES FT ON R.FAULT_ID = FT.FAULT_ID
				WHERE R.STATUS_ID != 5 AND 
				R.STATUS_ID != 7 AND
				R.PLANT_ID = ${req.params.plant}
				GROUP BY(FT.FAULT_TYPE, R.FAULT_ID) ORDER BY (name)` : 
				`SELECT FT.FAULT_TYPE AS NAME, R.FAULT_ID AS ID, COUNT(R.FAULT_ID) AS VALUE FROM 
				KEPPEL.REQUEST R 
				JOIN KEPPEL.FAULT_TYPES FT ON R.FAULT_ID = FT.FAULT_ID
				WHERE R.STATUS_ID != 5 AND R.STATUS_ID != 7
				GROUP BY(FT.FAULT_TYPE, R.FAULT_ID) ORDER BY (name)`;
			break;
		case "priority":
			sql = req.params.plant != 0 ? `SELECT P.PRIORITY AS NAME, R.PRIORITY_ID AS ID, COUNT(R.PRIORITY_ID) AS VALUE FROM 
				KEPPEL.REQUEST R 
				JOIN KEPPEL.PRIORITY P ON R.PRIORITY_ID = P.P_ID
				WHERE R.STATUS_ID != 5 AND 
				R.STATUS_ID != 7 AND
				R.PLANT_ID = ${req.params.plant}
				GROUP BY(P.PRIORITY, R.PRIORITY_ID) ORDER BY (name)` : 
				`SELECT P.PRIORITY AS NAME, R.PRIORITY_ID AS ID, COUNT(R.PRIORITY_ID) AS VALUE FROM 
				KEPPEL.REQUEST R 
				JOIN KEPPEL.PRIORITY P ON R.PRIORITY_ID = P.P_ID
				WHERE R.STATUS_ID != 5 AND R.STATUS_ID != 7
				GROUP BY(P.PRIORITY, R.PRIORITY_ID) ORDER BY (name)`;
			break;
		default:
			return res.status(404).send(`Invalid request type of ${req.params.field}`);

	};
	db.query(sql, (err, result) => {
        if (err) return res.status(500).send(`Error in fetching request ${req.params.field} for dashboard`);
        return res.status(200).send(result.rows);
    });
};

module.exports = {
	fetchRequests,
	createRequest,
	fetchRequestTypes,
	// fetchRequestStatus,
	// fetchRequestPriority,
	// fetchRequestFaults,
	fetchRequestCounts,
}