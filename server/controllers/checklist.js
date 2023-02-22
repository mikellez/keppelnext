const db = require("../../db");

const getTemplateChecklists = async (req, res, next) => {
    db.query(
        `SELECT cl.checklist_id, cl.chl_name, cl.description, cl.status_id,
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
			cl.history 
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
					
		WHERE ua.user_id = $1
		AND (cl.chl_type = 'Template')
		AND (cl.status_id is null or cl.status_id = 1 or cl.status_id = 2 or cl.status_id = 3 or cl.status_id = 6)
		ORDER BY cl.checklist_id DESC;
		`,
        [req.user.id],
        (err, result) => {
            if (err) return res.status(400).json({ msg: err1 });
            if (result.rows.length == 0) return res.status(201).json({ msg: "No checklist" });

            return res.status(200).send(result.rows);
        }
    );
};

const getChecklistTemplateNames = async (req, res, next) => {
    db.query(`SELECT * from keppel.checklist_templates`, (err, result) => {
        if (err) throw err;
        if (result) return res.status(200).send(result.rows);
    });
};

module.exports = {
    getTemplateChecklists,
    getChecklistTemplateNames,
};
