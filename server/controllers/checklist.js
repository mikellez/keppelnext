const db = require("../../db");
const { generateCSV } = require("../csvGenerator");
const moment = require("moment");

const fetchAssignedChecklistsQuery = `
SELECT 
    cl.checklist_id, 
    cl.chl_name, 
    cl.description, 
    cl.status_id,
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
FROM 
    keppel.users u
    JOIN keppel.user_access ua ON u.user_id = ua.user_id
    JOIN keppel.checklist_master cl on ua.allocatedplantids LIKE concat(concat('%',cl.plant_id::text), '%')
    LEFT JOIN (
        SELECT 
            t3.checklist_id, 
            string_agg(concat( system_asset , ' | ' , plant_asset_instrument )::text, ', '::text ORDER BY t2.psa_id ASC) AS assetNames
        FROM  
            keppel.system_assets AS t1,
            keppel.plant_system_assets AS t2, 
            keppel.checklist_master AS t3
        WHERE 
            t1.system_asset_id = t2.system_asset_id_lvl4 AND 
            t3.linkedassetids LIKE concat(concat('%',t2.psa_id::text) , '%')
        GROUP BY t3.checklist_id) tmp1 ON tmp1.checklist_id = cl.checklist_id
    LEFT JOIN keppel.users assignU ON assignU.user_id = cl.assigned_user_id
    LEFT JOIN keppel.users createdU ON createdU.user_id = cl.created_user_id
    LEFT JOIN keppel.users signoff ON signoff.user_id = cl.signoff_user_id
    LEFT JOIN keppel.plant_master pm ON pm.plant_id = cl.plant_id
    JOIN keppel.status_cm st ON st.status_id = cl.status_id	
WHERE 
    ua.user_id = $1 AND 
    (cl.status_id is null or cl.status_id = 2 or cl.status_id = 3)
ORDER BY cl.checklist_id DESC;
`;

const fetchAssignedChecklists = async (req, res, next) => {
    db.query(fetchAssignedChecklistsQuery, [req.user.id], (err, result) => {
        if (err) return res.status(400).json({ msg: err });
        if (result.rows.length == 0) return res.status(201).json({ msg: "No checklist" });

        return res.status(200).json(result.rows);
    });
};

const fetchForReviewChecklistsQuery = `
SELECT 
    cl.checklist_id, 
    cl.chl_name, 
    cl.description, 
    cl.status_id,
    concat( concat(createdU.first_name ,' '), createdU.last_name ) AS createdByUser,
    concat( concat(assignU.first_name ,' '), assignU.last_name ) AS assigneduser,
    concat( concat(signoff.first_name ,' '), signoff.last_name ) AS signoffUser,  
    pm.plant_name,
    pm.plant_id,
    completeremarks_req, 
    tmp1.assetNames AS linkedassets, 
    cl.chl_type, 
    cl.created_date, 
    cl.history, 
    st.status 
FROM  
    keppel.users u
    JOIN keppel.user_access ua ON u.user_id = ua.user_id
    JOIN keppel.checklist_master cl ON ua.allocatedplantids LIKE concat(concat('%',cl.plant_id::text) , '%')
    LEFT JOIN (
        SELECT  
            t3.checklist_id, 
            string_agg(concat( system_asset , ' | ' , plant_asset_instrument )::text, ', '::text ORDER BY t2.psa_id ASC) AS assetNames
        FROM  
            keppel.system_assets AS t1,
            keppel.plant_system_assets AS t2, 
            keppel.checklist_master AS t3
        WHERE 
            t1.system_asset_id = t2.system_asset_id_lvl4 AND  
            t3.linkedassetids LIKE concat(concat('%',t2.psa_id::text) , '%')
        GROUP BY t3.checklist_id) tmp1 ON tmp1.checklist_id = cl.checklist_id
    LEFT JOIN keppel.users assignU ON assignU.user_id = cl.assigned_user_id
    LEFT JOIN keppel.users createdU ON createdU.user_id = cl.created_user_id
    LEFT JOIN keppel.users signoff ON signoff.user_id = cl.signoff_user_id
    LEFT JOIN keppel.plant_master pm ON pm.plant_id = cl.plant_id 
    JOIN keppel.status_cm st ON st.status_id = cl.status_id						
WHERE 
    ua.user_id = $1 AND 
    (cl.status_id = 4 OR cl.status_id = 6)
ORDER BY cl.checklist_id desc;
        
`;
const fetchForReviewChecklists = async (req, res, next) => {
    db.query(fetchForReviewChecklistsQuery, [req.user.id], (err1, result) => {
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
    });
};

const fetchApprovedChecklistsQuery = `
SELECT 
    cl.checklist_id, 
    cl.chl_name, 
    cl.description, 
    cl.status_id,
    concat( concat(createdU.first_name ,' '), createdU.last_name ) AS createdByUser,
    concat( concat(assignU.first_name ,' '), assignU.last_name ) AS assigneduser,
    concat( concat(signoff.first_name ,' '), signoff.last_name ) AS signoffUser,  
    pm.plant_name,
    pm.plant_id,
    completeremarks_req, 
    tmp1.assetNames as linkedassets, 
    cl.chl_type, 
    cl.created_date, 
    cl.history, 
    st.status 
FROM 
    keppel.users u 
    JOIN keppel.user_access ua ON u.user_id = ua.user_id
    JOIN keppel.checklist_master cl ON ua.allocatedplantids LIKE concat(concat('%',cl.plant_id::text) , '%')
    LEFT JOIN (
        SELECT  
            t3.checklist_id, 
            string_agg(concat( system_asset , ' | ' , plant_asset_instrument )::text, ', '::text ORDER BY t2.psa_id asc) as assetNames
        FROM  
            keppel.system_assets AS t1,
            keppel.plant_system_assets AS t2, 
            keppel.checklist_master AS t3
        WHERE 
            t1.system_asset_id = t2.system_asset_id_lvl4 AND  
            t3.linkedassetids LIKE concat(concat('%',t2.psa_id::text) , '%')
        group by 
            t3.checklist_id) tmp1 ON tmp1.checklist_id = cl.checklist_id
    LEFT JOIN keppel.users assignU ON assignU.user_id = cl.assigned_user_id
    LEFT JOIN keppel.users createdU ON createdU.user_id = cl.created_user_id
    LEFT JOIN keppel.users signoff ON signoff.user_id = cl.signoff_user_id
    LEFT JOIN keppel.plant_master pm ON pm.plant_id = cl.plant_id 
    JOIN keppel.status_cm st ON st.status_id = cl.status_id
                    
WHERE 
    ua.user_id = $1 AND 
    (cl.status_id = 5 OR cl.status_id = 7)
ORDER BY cl.checklist_id DESC;
`;
const fetchApprovedChecklists = async (req, res, next) => {
    db.query(fetchApprovedChecklistsQuery, [req.user.id], (err, result) => {
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
    });
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

const fetchSpecificChecklistTemplate = async (req, res, next) => {
    const sql = `
        SELECT 
            ct.chl_name,
            ct.description,
            ct.datajson,
            ct.plant_id,
            ct.signoff_user_id
        FROM
            keppel.checklist_templates ct
        WHERE 
            checklist_id = $1
    `;

    db.query(sql, [req.params.checklist_id], (err, found) => {
        if (err) {
            console.log(err);
            return res.status(500).json("No checklist template found");
        }
        res.status(200).send(found.rows[0]);
    });
};

const fetchSpecificChecklistRecord = async (req, res, next) => {
    const sql = `
        SELECT 
            cm.checklist_id,
            cm.chl_name,
            cm.description,
            cm.datajson,
            cm.created_date,
            cm.status_id,
            cm.history,
            pm.plant_id,
            pm.plant_name,
            u1.user_id as assigned_user_id,
            concat(u1.first_name, ' ', u1.last_name) as assigneduser,
            u1.user_email as assigned_user_email,
            u2.user_id as assigned_user_id,
            concat(u2.first_name, ' ', u2.last_name) as signoffuser,
            u2.user_email as signoff_user_email,
            u3.user_id as created_by_user_id,
            concat(u3.first_name, ' ', u3.last_name) as createdbyuser,
            u3.user_email as created_by_user_email,
            tmp1.assetNames as linkedassets
            
        FROM
            keppel.checklist_master cm
            JOIN keppel.users u1 ON u1.user_id = cm.assigned_user_id
            JOIN keppel.users u2 ON u2.user_id = cm.signoff_user_id
            JOIN keppel.users u3 ON u3.user_id = cm.created_user_id
            JOIN keppel.plant_master pm ON pm.plant_id = cm.plant_id
            JOIN (
                SELECT  
                            t3.checklist_id, 
                            string_agg(concat( system_asset , ' | ' , plant_asset_instrument )::text, ', '::text ORDER BY t2.psa_id asc) as assetNames
                        FROM  
                            keppel.system_assets AS t1,
                            keppel.plant_system_assets AS t2, 
                            keppel.checklist_master AS t3
                        WHERE 
                            t1.system_asset_id = t2.system_asset_id_lvl4 AND  
                            t3.linkedassetids LIKE concat(concat('%',t2.psa_id::text) , '%')
                        group by 
                            t3.checklist_id
            ) tmp1 ON tmp1.checklist_id = cm.checklist_id
            
        WHERE 
            cm.checklist_id = $1
    `;

    db.query(sql, [req.params.checklist_id], (err, found) => {
        if (err) {
            console.log(err);
            return res.status(500).json("No checklist template found");
        }
        res.status(200).send(found.rows[0]);
    });
};

const fetchChecklistRecords = async (req, res, next) => {
    if (req.params.checklist_id) {
        return fetchSpecificChecklistRecord(req, res, next);
    } else {
        return fetchForReviewChecklists(req, res, next);
    }
};

const submitNewChecklistTemplate = async (req, res, next) => {
    if (req.body.checklistSections === undefined) return res.status(400).json("ayo?");

    console.log(req.body.checklistSections);

    return res.status(200).json({
        msg: "awesome",
    });
};

const createNewChecklistRecord = async (req, res, next) => {
    // console.log(req.body.checklist)
    const { checklist } = req.body;
    sql = `INSERT INTO
        keppel.checklist_master
        (
            chl_name,
            description,
            assigned_user_id,
            signoff_user_id,
            linkedassetids,
            datajson,
            chl_type,
            plant_id,
            created_date,
            created_user_id,
            history,
            status_id
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`;

    const today = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");

    const history = `Created Record_ASSIGNED_${today}_${req.user.name}_NIL`;

    db.query(
        sql,
        [
            checklist.chl_name,
            checklist.description,
            checklist.assigned_user_id,
            checklist.signoff_user_id,
            checklist.linkedassetids,
            checklist.datajson,
            "Record",
            checklist.plant_id,
            today,
            req.user.id,
            history,
            2,
        ],
        (err) => {
            if (err) {
                console.log(err);
                return res.status(500).json("Failure to create new checklist");
            }
            return res.status(200).json("New checklist successfully created");
        }
    );
};

const createNewChecklistTemplate = async (req, res, next) => {
    const { checklist } = req.body;
    sql = `INSERT INTO
        keppel.checklist_templates
        (
            chl_name,
            description,
            signoff_user_id,
            datajson,
            chl_type,
            plant_id,
            created_date,
            created_user_id,
            history,
            status_id
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`;

    const today = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");

    const history = `Created Template_PENDING_${today}_${req.user.name}_NIL`;

    db.query(
        sql,
        [
            checklist.chl_name,
            checklist.description,
            checklist.signoff_user_id,
            checklist.datajson,
            "Template",
            checklist.plant_id,
            today,
            req.user.id,
            history,
            1,
        ],
        (err) => {
            if (err) {
                console.log(err);
                return res.status(500).json("Failure to create new checklist");
            }
            return res.status(200).json("New checklist successfully created");
        }
    );
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
    let activeTabQuery;
    switch (req.query.activeTab) {
        case "0":
            activeTabQuery = fetchPendingChecklistsQuery;
            break;
        case "1":
            activeTabQuery = fetchForReviewChecklistsQuery;
            break;
        case "2":
            activeTabQuery = fetchApprovedChecklistsQuery;
            break;
        default:
            activeTabQuery = `fetch error`;
    }
    db.query(activeTabQuery, [req.user.id], (err, result) => {
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

const completeChecklist = async (req, res, next) => {
    const today = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");

    const updatehistory = `,Updated Record_WORK DONE_${today}_${req.user.name}`;

    const sql = `
        UPDATE
            keppel.checklist_master
        SET 
            datajson = $1,
            status_id = 4,
            history = concat(history,'${updatehistory}')
        WHERE 
            checklist_id = $2
    `;

    db.query(sql, [req.body.datajson, req.params.checklist_id], (err) => {
        if (err) {
            console.log(err);
            return res.status(500).json("Failure to update checklist completion");
        }
        return res.status(200).json("Checklist successfully completed");
    });
};

const approveChecklist = async (req, res, next) => {
    const today = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");

    const updatehistory = `,Updated Record_APPROVE_${today}_${req.user.name}`;

    const sql = `
        UPDATE
            keppel.checklist_master
        SET 
            status_id = 5,
            history = concat(history,'${updatehistory}')
        WHERE 
            checklist_id = $1
    `;

    db.query(sql, [req.params.checklist_id], (err) => {
        if (err) {
            console.log(err);
            return res.status(500).json("Failure to update checklist completion");
        }
        return res.status(200).json("Checklist successfully approved");
    });
};

const rejectChecklist = async (req, res, next) => {
    const today = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
    const rejectionComments = req.body.remarks; // todo add rejected comment here

    const updatehistory = `,Updated Record_REJECTED_${today}_${req.user.name}_${rejectionComments}`;

    const sql = `
        UPDATE
            keppel.checklist_master
        SET 
            status_id = 6,
            history = concat(history,'${updatehistory}')
        WHERE 
            checklist_id = $1
    `;

    db.query(sql, [req.params.checklist_id], (err) => {
        if (err) {
            console.log(err);
            return res.status(500).json("Failure to update checklist completion");
        }
        return res.status(200).json("Checklist successfully cancelled");
    });
};

const cancelChecklist = async (req, res, next) => {
    const today = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
    const cancelledComments = ""; // todo add cancelled comment here

    const updatehistory = `,Updated Record_CANCELLED_${today}_${req.user.name}_${cancelledComments}`;

    const sql = `
        UPDATE
            keppel.checklist_master
        SET 
            status_id = 7,
            history = concat(history,'${updatehistory}')
        WHERE 
            checklist_id = $1
    `;

    db.query(sql, [req.params.checklist_id], (err) => {
        if (err) {
            console.log(err);
            return res.status(500).json("Failure to update checklist completion");
        }
        return res.status(200).json("Checklist successfully rejected");
    });
};

function updateChecklist(updateType) {
    switch (updateType) {
        case "complete":
            return completeChecklist;
        case "approve":
            return approveChecklist;
        case "reject":
            return rejectChecklist;
        case "cancel":
            return cancelChecklist;
        default:
            return console.log("update checklist type error");
    }
};

const deleteChecklistTemplate = async (req, res, next) => {
    const sql = `
        DELETE FROM
            keppel.schedule_checklist
        WHERE 
            checklist_template_id = ${req.params.checklist_id};

        DELETE FROM
            keppel.checklist_templates
        WHERE
            checklist_id = ${req.params.checklist_id}
    `;

    db.query(sql, (err) => {
        if (err) return res.status(500).json("Failure to delete template")
        return res.status(200).json("Template successfully deleted");
    });
};

module.exports = {
    fetchAssignedChecklists,
    fetchForReviewChecklists,
    fetchApprovedChecklists,
    fetchChecklistTemplateNames,
    submitNewChecklistTemplate,
    fetchChecklistCounts,
    createChecklistCSV,
    createNewChecklistRecord,
    createNewChecklistTemplate,
    fetchSpecificChecklistTemplate,
    fetchSpecificChecklistRecord,
    fetchChecklistRecords,
    updateChecklist,
    deleteChecklistTemplate,
};
