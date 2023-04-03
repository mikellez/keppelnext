const db = require("../../db");
const { generateCSV } = require("../csvGenerator");

const fetchTemplateChecklistsQuery = `SELECT cl.checklist_id, cl.chl_name, cl.description, cl.status_id,
concat( concat(createdU.first_name ,' '), createdU.last_name ) AS createdByUser,
concat( concat(assignU.first_name ,' '), assignU.last_name ) AS assigneduser,
concat( concat(signoff.first_name ,' '), signoff.last_name ) AS signoffUser,  
pm.plant_name,
pm.plant_id,
completeremarks_req,
tmp1.assetNames AS linkedassets,
linkedassetids,
cl.chl_type,
cl.created_date,
cl.history,
st.status
FROM keppel.users u
JOIN keppel.user_access ua ON u.user_id = ua.user_id
JOIN keppel.checklist_master cl on ua.allocatedplantids LIKE concat(concat('%',cl.plant_id::text), '%')
LEFT JOIN (
SELECT t3.checklist_id, string_agg(concat( system_asset , ' | ' , plant_asset_instrument )::text, ', '::text ORDER BY t2.psa_id ASC) AS assetNames
FROM  keppel.system_assets AS t1 ,keppel.plant_system_assets AS t2, keppel.checklist_master AS t3
WHERE t1.system_asset_id = t2.system_asset_id_lvl4 AND t3.linkedassetids LIKE concat(concat('%',t2.psa_id::text) , '%')
	GROUP BY t3.checklist_id) tmp1 ON tmp1.checklist_id = cl.checklist_id
LEFT JOIN keppel.users assignU ON assignU.user_id = cl.assigned_user_id
LEFT JOIN keppel.users createdU ON createdU.user_id = cl.created_user_id
LEFT JOIN keppel.users signoff ON signoff.user_id = cl.signoff_user_id
LEFT JOIN keppel.plant_master pm ON pm.plant_id = cl.plant_id
JOIN keppel.status_cm st ON st.status_id = cl.status_id
		
WHERE ua.user_id = $1
AND (cl.chl_type = 'Template')
AND (cl.status_id is null or cl.status_id = 1 or cl.status_id = 2 or cl.status_id = 3 or cl.status_id = 6)
ORDER BY cl.checklist_id DESC;
`;

const fetchTemplateChecklists = async (req, res, next) => {
    db.query(fetchTemplateChecklistsQuery, [req.user.id], (err, result) => {
        if (err) return res.status(400).json({ msg: err });
        if (result.rows.length == 0) return res.status(201).json({ msg: "No checklist" });

        return res.status(200).json(result.rows);
    });
};

const fetchForReviewChecklists = async (req, res, next) => {
    db.query(
        `SELECT cl.checklist_id, cl.chl_name, cl.description, cl.status_id,
			concat( concat(createdU.first_name ,' '), createdU.last_name ) AS createdByUser,
			concat( concat(assignU.first_name ,' '), assignU.last_name ) AS assigneduser,
			concat( concat(signoff.first_name ,' '), signoff.last_name ) AS signoffUser,  
			pm.plant_name,pm.plant_id,
			completeremarks_req, tmp1.assetNames as linkedassets, cl.chl_type, cl.created_date, cl.history, st.status 
			FROM  keppel.users u
				JOIN keppel.user_access ua on u.user_id = ua.user_id
				JOIN keppel.checklist_master cl on ua.allocatedplantids like concat(concat('%',cl.plant_id::text) , '%')
				LEFT JOIN (
					select  t3.checklist_id, string_agg(concat( system_asset , ' | ' , plant_asset_instrument )::text, ', '::text order by t2.psa_id asc) as assetNames
						from  keppel.system_assets   as t1 ,keppel.plant_system_assets as t2, keppel.checklist_master as t3
						where t1.system_asset_id = t2.system_asset_id_lvl4 and  t3.linkedassetids like concat(concat('%',t2.psa_id::text) , '%')
							group by t3.checklist_id) tmp1 on tmp1.checklist_id = cl.checklist_id
			left join keppel.users assignU on assignU.user_id = cl.assigned_user_id
			left join keppel.users createdU on createdU.user_id = cl.created_user_id
			left join keppel.users signoff on signoff.user_id = cl.signoff_user_id
			left join keppel.plant_master pm on pm.plant_id = cl.plant_id 
      JOIN keppel.status_cm st ON st.status_id = cl.status_id
							
			where ua.user_id = $1
			and (cl.chl_type = 'Record')
			and (cl.status_id = 2 or cl.status_id = 3 or cl.status_id = 4 or cl.status_id = 7)
			order by cl.checklist_id desc;
		`,
        [req.user.id],
        (err1, result) => {
            if (err1) {
                // throw err1;
                return res.status(400).json({
                    msg: err1,
                });
            }
            if (result.rows.length == 0) {
                // console.log(result);
                return res.status(201).json({
                    msg: "No checklist added",
                });
            }

            return res.status(200).json(result.rows);
        }
    );
};

const fetchApprovedChecklists = async (req, res, next) => {
    db.query(
        `SELECT cl.checklist_id, cl.chl_name, cl.description, cl.status_id,
	concat( concat(createdU.first_name ,' '), createdU.last_name ) AS createdByUser,
	concat( concat(assignU.first_name ,' '), assignU.last_name ) AS assigneduser,
	concat( concat(signoff.first_name ,' '), signoff.last_name ) AS signoffUser,  
	pm.plant_name,pm.plant_id,
	completeremarks_req, tmp1.assetNames as linkedassets, cl.chl_type, cl.created_date, cl.history, st.status 
	FROM  keppel.users u
		JOIN keppel.user_access ua on u.user_id = ua.user_id
		JOIN keppel.checklist_master cl on ua.allocatedplantids like concat(concat('%',cl.plant_id::text) , '%')
		LEFT JOIN (
			select  t3.checklist_id, string_agg(concat( system_asset , ' | ' , plant_asset_instrument )::text, ', '::text order by t2.psa_id asc) as assetNames
				from  keppel.system_assets   as t1 ,keppel.plant_system_assets as t2, keppel.checklist_master as t3
				where t1.system_asset_id = t2.system_asset_id_lvl4 and  t3.linkedassetids like concat(concat('%',t2.psa_id::text) , '%')
					group by t3.checklist_id) tmp1 on tmp1.checklist_id = cl.checklist_id
	  left join keppel.users assignU on assignU.user_id = cl.assigned_user_id
	  left join keppel.users createdU on createdU.user_id = cl.created_user_id
	  left join keppel.users signoff on signoff.user_id = cl.signoff_user_id
	  left join keppel.plant_master pm on pm.plant_id = cl.plant_id 
    JOIN keppel.status_cm st ON st.status_id = cl.status_id
					
	where ua.user_id = $1
	and (cl.chl_type = 'Approved')
	and (cl.status_id = 5 or cl.status_id = 7)
	order by cl.checklist_id desc;`,
        [req.user.id],
        (err, result) => {
            if (err) {
                // throw err1;
                return res.status(400).json({
                    msg: err,
                });
            }
            if (result.rows.length == 0) {
                // console.log(result);
                return res.status(201).json({
                    msg: "No checklist added",
                });
            }

            return res.status(200).json(result.rows);
        }
    );
};

// get checklist templates
const fetchChecklistTemplateNames = async (req, res, next) => {
    const sql = req.params.id
        ? `SELECT * from keppel.checklist_templates WHERE plant_id = ${req.params.id}` // templates are plant specificed (from that plant only)
        : `SELECT * from keppel.checklist_templates WHERE plant_id = any(ARRAY${req.query.test}::int[])
            ORDER BY keppel.checklist_templates.checklist_id DESC;`; // templates are plants specificed depending on user access(1 use can be assigned multiple plants)
    db.query(sql, (err, result) => {
        if (err) throw err;
        if (result) return res.status(200).json(result.rows);
    });
};

const submitNewChecklistTemplate = async (req, res, next) => {
    if (req.body.checklistSections === undefined) return res.status(400).json("ayo?");

    console.log(req.body.checklistSections);

    return res.status(200).json({
        msg: "awesome",
    });
};

const fetchChecklistCounts = (req, res, next) => {
    let sql;
    switch (req.params.field) {
        case "status":
            sql =
                req.params.plant != 0
                    ? `SELECT S.STATUS AS NAME, CM.STATUS_ID AS ID, COUNT(CM.STATUS_ID) AS VALUE FROM KEPPEL.CHECKLIST_MASTER CM
				JOIN KEPPEL.STATUS_CM S ON S.STATUS_ID = CM.STATUS_ID
				WHERE CM.PLANT_ID = ${req.params.plant}
				GROUP BY(CM.STATUS_ID, S.STATUS) ORDER BY (status)`
                    : `SELECT  S.STATUS AS NAME, CM.STATUS_ID AS ID, COUNT(CM.STATUS_ID) AS VALUE FROM KEPPEL.CHECKLIST_MASTER CM
				JOIN KEPPEL.STATUS_CM S ON S.STATUS_ID = CM.STATUS_ID
				GROUP BY(CM.STATUS_ID, S.STATUS) ORDER BY (status)`;
            break;
        default:
            return res.status(404).send(`Invalid checklist type of ${req.params.field}`);
    }
    db.query(sql, (err, result) => {
        if (err)
            return res
                .status(500)
                .send(`Error in fetching checklist ${req.params.field} for dashboard`);
        return res.status(200).send(result.rows);
    });
};

const createChecklistCSV = async (req, res, next) => {
    db.query(fetchTemplateChecklistsQuery, [req.user.id], (err, result) => {
        if (err) return res.status(400).json({ msg: err });
        if (result.rows.length == 0) return res.status(201).json({ msg: "No checklist" });
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

module.exports = {
    fetchTemplateChecklists,
    fetchForReviewChecklists,
    fetchApprovedChecklists,
    fetchChecklistTemplateNames,
    submitNewChecklistTemplate,
    fetchChecklistCounts,
    createChecklistCSV,
};
