const db = require("../../db");
const { generateCSV } = require("../csvGenerator");
const moment = require("moment");

const ITEMS_PER_PAGE = 10;

const fetchAllChecklistQuery = `
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
    cl.datajson,
    cl.signoff_user_id,
    cl.assigned_user_id,
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
`;

const fetchAssignedChecklistsQuery =
    fetchAllChecklistQuery +
    `
WHERE 
    ua.user_id = $1 AND 
    (cl.status_id is null or cl.status_id = 2 or cl.status_id = 3)
ORDER BY cl.checklist_id DESC
`;

const fetchAssignedChecklists = async (req, res, next) => {
    const page = req.query.page || 1;
    const offsetItems = (+page - 1) * ITEMS_PER_PAGE;

    const totalRows = await db.query(fetchAssignedChecklistsQuery, [req.user.id]);
    const totalPages = Math.ceil(+totalRows.rowCount / ITEMS_PER_PAGE);

    const query = fetchAssignedChecklistsQuery + ` LIMIT ${ITEMS_PER_PAGE} OFFSET ${offsetItems}`;

    try {
        const result = await db.query(query, [req.user.id]);
        if (result.rows.length == 0) return res.status(404).json({ msg: "No checklist" });

        return res.status(200).json({ rows: result.rows, total: totalPages });
    } catch (error) {
        return res.status(500).json({ msg: error });
    }
};

const fetchPendingChecklistsQuery =
    fetchAllChecklistQuery +
    `
WHERE 
    ua.user_id = $1 AND 
    (cl.status_id = 1)
ORDER BY cl.checklist_id DESC
`;

const fetchPendingChecklists = async (req, res, next) => {
    const page = req.query.page || 1;
    const offsetItems = (+page - 1) * ITEMS_PER_PAGE;

    const totalRows = await db.query(fetchForReviewChecklistsQuery, [req.user.id]);
    const totalPages = Math.ceil(+totalRows.rowCount / ITEMS_PER_PAGE);

    const query = fetchPendingChecklistsQuery + ` LIMIT ${ITEMS_PER_PAGE} OFFSET ${offsetItems}`;

    try {
        const result = await db.query(query, [req.user.id]);
        if (result.rows.length == 0) return res.status(404).json({ msg: "No checklist" });

        return res.status(200).json({ rows: result.rows, total: totalPages });
    } catch (error) {
        return res.status(500).json({ msg: error });
    }
};

const fetchForReviewChecklistsQuery =
    fetchAllChecklistQuery +
    `				
WHERE 
    ua.user_id = $1 AND 
    (cl.status_id = 4 OR cl.status_id = 6)
ORDER BY cl.checklist_id desc
`;

const fetchForReviewChecklists = async (req, res, next) => {
    const page = req.query.page || 1;
    const offsetItems = (+page - 1) * ITEMS_PER_PAGE;

    const totalRows = await db.query(fetchForReviewChecklistsQuery, [req.user.id]);
    const totalPages = Math.ceil(+totalRows.rowCount / ITEMS_PER_PAGE);

    const query = fetchForReviewChecklistsQuery + ` LIMIT ${ITEMS_PER_PAGE} OFFSET ${offsetItems}`;

    try {
        const result = await db.query(query, [req.user.id]);
        if (result.rows.length == 0) return res.status(404).json({ msg: "No checklist" });

        return res.status(200).json({ rows: result.rows, total: totalPages });
    } catch (error) {
        return res.status(500).json({ msg: error });
    }
};

const fetchApprovedChecklistsQuery =
    fetchAllChecklistQuery +
    `
WHERE 
    ua.user_id = $1 AND 
    (cl.status_id = 5 OR cl.status_id = 7)
ORDER BY cl.checklist_id DESC
`;
const fetchApprovedChecklists = async (req, res, next) => {
    const page = req.query.page || 1;
    const offsetItems = (+page - 1) * ITEMS_PER_PAGE;

    const totalRows = await db.query(fetchApprovedChecklistsQuery, [req.user.id]);
    const totalPages = Math.ceil(+totalRows.rowCount / ITEMS_PER_PAGE);

    const query = fetchApprovedChecklistsQuery + ` LIMIT ${ITEMS_PER_PAGE} OFFSET ${offsetItems}`;

    try {
        const result = await db.query(query, [req.user.id]);
        if (result.rows.length == 0) return res.status(404).json({ msg: "No checklist" });

        return res.status(200).json({ rows: result.rows, total: totalPages });
    } catch (error) {
        return res.status(500).json({ msg: error });
    }
};

// get checklist templates
const fetchChecklistTemplateNames = async (req, res, next) => {
    console.log(req.user.allocated_plants);
    const sql = req.params.id
        ? `SELECT * from keppel.checklist_templates WHERE plant_id = ${req.params.id} 
          ORDER BY keppel.checklist_templates.checklist_id DESC;` // templates are plant specificed (from that plant only)
        : `SELECT * from keppel.checklist_templates WHERE plant_id = any(ARRAY[${req.user.allocated_plants}]::int[])
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
            ct.signoff_user_id,
            ct.status_id
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
    const sql =
        fetchAllChecklistQuery +
        ` 
        WHERE 
            cl.checklist_id = $1
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
    const { checklist } = req.body;
    const statusId = req.body.checklist.assigned_user_id ? 2 : 1;
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
            status_id,
            activity_log
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`;

    const today = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
    
    const history = `Created Record_${statusId === 2 ? "ASSIGNED" : "PENDING"}_${today}_${
        req.user.name
    }_NIL`;
    const activity_log = [
        {
            date: today,
            name: req.user.name,
            activity: `${statusId === 2 ? "ASSIGNED" : "PENDING"}`,
            activity_type: "Created Record",
        },
    ];

    db.query(
        sql,
        [
            checklist.chl_name,
            checklist.description,
            checklist.assigned_user_id,
            checklist.signoff_user_id,
            checklist.linkedassetids,
            JSON.stringify(checklist.datajson),
            "Record",
            checklist.plant_id,
            today,
            req.user.id,
            history,
            statusId,
            JSON.stringify(activity_log),
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
    let date = req.params.date;
    let datetype = req.params.datetype;
    let dateCond = "";
    let dateSplit = {};
    let year, month, week, quarter;

    if (date !== "all") {
        switch (datetype) {
            case "week":
                dateCond = `
                    AND DATE_PART('week', CM.CREATED_DATE::DATE) = DATE_PART('week', '${date}'::DATE) 
                    AND DATE_PART('year', CM.CREATED_DATE::DATE) = DATE_PART('year', '${date}'::DATE)`;

                break;

            case "month":
                dateCond = `
                    AND DATE_PART('month', CM.CREATED_DATE::DATE) = DATE_PART('month', '${date}'::DATE) 
                    AND DATE_PART('year', CM.CREATED_DATE::DATE) = DATE_PART('year', '${date}'::DATE)`;

                break;

            case "year":
                dateCond = `
                    AND DATE_PART('year', CM.CREATED_DATE::DATE) = DATE_PART('year', '${date}'::DATE)`;

                break;

            case "quarter":
                dateCond = `
                    AND DATE_PART('quarter', CM.CREATED_DATE::DATE) = DATE_PART('quarter', '${date}'::DATE) 
                    AND DATE_PART('year', CM.CREATED_DATE::DATE) = DATE_PART('year', '${date}'::DATE)`;

                break;
            default:
                dateCond = `AND CM.CREATED_DATE::DATE = '${date}'::DATE`;
        }
    }

    switch (req.params.field) {
        case "status":
            sql =
                req.params.plant != 0
                    ? `SELECT S.STATUS AS NAME, CM.STATUS_ID AS ID, COUNT(CM.STATUS_ID) AS VALUE FROM KEPPEL.CHECKLIST_MASTER CM
				JOIN KEPPEL.STATUS_CM S ON S.STATUS_ID = CM.STATUS_ID
				WHERE CM.PLANT_ID = ${req.params.plant}
                ${dateCond}
				GROUP BY(CM.STATUS_ID, S.STATUS) ORDER BY (status)`
                    : `SELECT  S.STATUS AS NAME, CM.STATUS_ID AS ID, COUNT(CM.STATUS_ID) AS VALUE FROM KEPPEL.CHECKLIST_MASTER CM
				JOIN KEPPEL.STATUS_CM S ON S.STATUS_ID = CM.STATUS_ID
                WHERE 1 = 1
                ${dateCond}
				GROUP BY(CM.STATUS_ID, S.STATUS) ORDER BY (status)`;
            break;
        default:
            return res.status(404).send(`Invalid checklist type of ${req.params.field}`);
    }
    console.log(date);
    console.log(sql);
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
            activeTabQuery = fetchAssignedChecklistsQuery;
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
        if (result.rows.length == 0) return res.status(404).json({ msg: "No checklist" });
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
            history = concat(history,'${updatehistory}'),
            activity_log = activity_log || 
        jsonb_build_object(
          'date', '${today}',
          'name', '${req.user.name}',
          'activity', 'WORK DONE',
          'activity_type', 'Updated Record'
        )
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

const editChecklistRecord = async (req, res, next) => {
    const data = req.body.checklist;
    const today = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");

    const updatehistory = data.assigned_user_id
        ? `,Assigned Record_ASSIGNED_${today}_${req.user.name}`
        : `,Edited Record_PENDING_${today}_${req.user.name}`;
    const statusId = data.assigned_user_id ? 2 : 1;
    const activity_log = data.assigned_user_id
        ? {
              date: today,
              name: req.user.name,
              activity: "ASSIGNED",
              activity_type: "Assigned Record",
          }
        : {
              date: today,
              name: req.user.name,
              activity: "PENDING",
              activity_type: "Edited Record",
          };

    const sql = `
        UPDATE
            keppel.checklist_master
        SET 
            datajson = $1,
            status_id = $2,
            history = concat(history,'${updatehistory}'),
            chl_name = $3,
            description = $4,
            assigned_user_id = $5,
            signoff_user_id = $6,
            linkedassetids = $7,
            plant_id = $8,
            activity_log = activity_log || $9
        WHERE 
            checklist_id = $10
    `;

    db.query(
        sql,
        [
            JSON.stringify(data.datajson),
            statusId,
            data.chl_name,
            data.description,
            data.assigned_user_id,
            data.signoff_user_id,
            data.linkedassetids,
            data.plant_id,
            JSON.stringify(activity_log),
            req.params.checklist_id,
        ],
        (err) => {
            if (err) {
                console.log(err);
                return res.status(500).json("Failure to update checklist completion");
            }
            return res.status(200).json("Checklist successfully assigned");
        }
    );
};

const approveChecklist = async (req, res, next) => {
    const today = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");

    const updatehistory = `,Updated Record_APPROVE_${today}_${req.user.name}`;
    const activity_log = {
        date: today,
        name: req.user.name,
        activity: "APPROVED",
        activity_type: "Updated Record",
    };

    const sql = `
        UPDATE
            keppel.checklist_master
        SET 
            status_id = 5,
            history = concat(history,'${updatehistory}'),
            activity_log = activity_log || $1
        WHERE 
            checklist_id = $2
    `;

    db.query(sql, [JSON.stringify(activity_log), req.params.checklist_id], (err) => {
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
    const activity_log = {
        date: today,
        name: req.user.name,
        activity: "REJECTED",
        activity_type: "Updated Record",
    };

    const sql = `
        UPDATE
            keppel.checklist_master
        SET 
            status_id = 6,
            history = concat(history,'${updatehistory}'),
            activity_log = activity_log || $1
        WHERE 
            checklist_id = $2
    `;

    db.query(sql, [JSON.stringify(activity_log), req.params.checklist_id], (err) => {
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
    const activity_log = {
        date: today,
        name: req.user.name,
        activity: "CANCELLED",
        activity_type: "Updated Record",
        comments: cancelledComments,
    };

    const sql = `
        UPDATE
            keppel.checklist_master
        SET 
            status_id = 7,
            history = concat(history,'${updatehistory}')
            activity_log = activity_log || $1
        WHERE 
            checklist_id = $2
    `;

    db.query(sql, [JSON.stringify(activity_log), req.params.checklist_id], (err) => {
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
}

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
        if (err) return res.status(500).json("Failure to delete template");
        return res.status(200).json("Template successfully deleted");
    });
};

const fetchFilteredChecklists = async (req, res, next) => {
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
        userRoleCond = `AND ua.user_id = ${req.user.id}`;
    }

    if (plant && plant != 0) {
        plantCond = `AND cl.plant_id = '${plant}'`;
    }

    if (status) {
        statusCond = `AND cl.status_id = '${status}'`;
    }

    if (date !== "all") {
        switch (datetype) {
            case "week":
                dateCond = `
                    AND DATE_PART('week', CL.CREATED_DATE::DATE) = DATE_PART('week', '${date}'::DATE) 
                    AND DATE_PART('year', CL.CREATED_DATE::DATE) = DATE_PART('year', '${date}'::DATE)`;

                break;

            case "month":
                dateCond = `
                    AND DATE_PART('month', CL.CREATED_DATE::DATE) = DATE_PART('month', '${date}'::DATE) 
                    AND DATE_PART('year', CL.CREATED_DATE::DATE) = DATE_PART('year', '${date}'::DATE)`;

                break;

            case "year":
                dateCond = `AND DATE_PART('year', CL.CREATED_DATE::DATE) = DATE_PART('year', '${date}'::DATE)`;

                break;

            case "quarter":
                dateCond = `
                    AND DATE_PART('quarter', CL.CREATED_DATE::DATE) = DATE_PART('quarter', '${date}'::DATE) 
                    AND DATE_PART('year', CL.CREATED_DATE::DATE) = DATE_PART('year', '${date}'::DATE)`;

                break;
            default:
                dateCond = `AND CL.CREATED_DATE::DATE = '${date}'::DATE`;
        }
    }

    const sql =
        fetchAllChecklistQuery +
        `
    WHERE 1 = 1
        AND ua.user_id = ${req.user.id} 
        ${plantCond}
        ${statusCond}
        ${dateCond}
    ORDER BY cl.checklist_id DESC
    `;

    const countSql = `SELECT COUNT(*) AS total FROM (${sql}) AS t1`;

    const totalRows = await db.query(countSql);
    const totalPages = Math.ceil(+totalRows.rows[0].total / ITEMS_PER_PAGE);
    console.log(sql);

    db.query(sql + pageCond, (err, result) => {
        if (err) return res.status(400).json({ msg: err });
        if (result.rows.length == 0) return res.status(404).json({ msg: "No checklist" });

        return res.status(200).json({ rows: result.rows, total: totalPages });
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
    fetchFilteredChecklists,
    fetchPendingChecklists,
    editChecklistRecord,
};
