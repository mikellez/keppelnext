const db = require("../../db");
const { generateCSV } = require("../csvGenerator");
const moment = require("moment");
const {
  CreateChecklistMail,
  CompleteChecklistMail,
  RejectChecklistMail,
  ApproveChecklistMail,
} = require("../mailer/ChecklistMail");
const { userPermission } = require("../global");

const ITEMS_PER_PAGE = 10;
const groupBYCondition = () => {  
  return `
    GROUP BY (
      cl.checklist_id,
      createdu.first_name,
      createdu.last_name,
      assignU.first_name,
      assignU.last_name,
      signoff.first_name,
      signoff.last_name,
      pm.plant_id,
      pm.plant_name,
      st.status,
      cs.checklist_id
    )`;
}

const orderByCondition = (sortField, sortOrder) => {
  if (sortField == undefined || sortOrder == undefined) {
    return `ORDER BY cl.checklist_id DESC`;
  } else {
    return `ORDER BY ${sortField} ${sortOrder}`;
  }
}

const condition = (req) => {
  let cond = ``;

  if(userPermission('canOnlyViewCMTList', req.user.permissions)) {
    cond = `AND aa.item_name like '%cmt%'`;
  }

  return cond;
}

var dateSelectClause = '';
  var dateWhereClause = '';
  var dateJoinClause = '';
  var dateOrderByClause = '';

const advancedScheduleCond = (req) => {
  // Get user role req.user.permissions
  const user_role = req.user.permissions;
  // Check if user if engineer or specialist - role contains "engineer" --> means engineer
  if (user_role.includes('engineer')){
    console.log('engineer view')
    return ``;
  }
  
  // otherwise it is specialist
  // where condition for checking current date against created date:
  else {
    console.log('specialist view');
    return `AND (
      cl.created_date::DATE <= CURRENT_DATE
    )`;
  };
}

const searchCondition = (search) => {
  //fields to search by: checklist_id, description, status, assigneduser, signoffuser, createdbyuser
  let searchInt = parseInt(search);

  if (search === "") {
    //handling empty search
    return ``;
  } else if (!isNaN(search)) {
    //handling integer input
    return `AND (
      cl.checklist_id = ${searchInt} OR
      cl.signoff_user_id = ${searchInt} OR
      cl.assigned_user_id = ${searchInt} 
    )`;
  } else if (typeof search === "string" && search !== "") {
    //handling text input
    return `
    AND (
      cl.chl_name ILIKE '%${search}%' OR
      description ILIKE '%${search}%' OR
      st.status ILIKE '%${search}%' OR
      
      cl.checklist_id IN (
        SELECT cm.checklist_id
        FROM keppel.checklist_master cm
        INNER JOIN keppel.users assigned_users ON cm.assigned_user_id = assigned_users.user_id
        INNER JOIN keppel.users sign_off_users ON cm.signoff_user_id = sign_off_users.user_id
        INNER JOIN keppel.users created_users ON cm.created_user_id = created_users.user_id
        WHERE assigned_users.user_name ILIKE '%${search}%' 
        OR assigned_users.first_name || ' ' || assigned_users.last_name ILIKE '%${search}%'
        OR sign_off_users.first_name || ' ' || sign_off_users.last_name ILIKE '%${search}%'
        OR created_users.first_name || ' ' || created_users.last_name ILIKE '%${search}%'
      )  
    )`;
  }
};

const templateSearchCondition = (search) => {
  //fields to search by: checklist_id, chl_name, description, assigneduser, signoffuser, createdbyuser
  let searchInt = parseInt(search);

  if (search === "") {
    //handling empty search
    return ``;
  } else if (!isNaN(search)) {
    //handling integer input
    return `AND (
      checklist_id = ${searchInt} OR
      signoff_user_id = ${searchInt} OR
      assigned_user_id = ${searchInt} 
    )`;
  } else if (typeof search === "string" && search !== "") {
    //handling text input
    return `
    AND (
      chl_name ILIKE '%${search}%' OR
      description ILIKE '%${search}%' OR
      
      checklist_id IN (
        SELECT ct.checklist_id
        FROM keppel.checklist_templates ct
        INNER JOIN keppel.users assigned_users ON ct.assigned_user_id = assigned_users.user_id
        INNER JOIN keppel.users sign_off_users ON ct.signoff_user_id = sign_off_users.user_id
        INNER JOIN keppel.users created_users ON ct.created_user_id = created_users.user_id
        WHERE assigned_users.user_name ILIKE '%${search}%' 
        OR assigned_users.first_name || ' ' || assigned_users.last_name ILIKE '%${search}%'
        OR sign_off_users.first_name || ' ' || sign_off_users.last_name ILIKE '%${search}%'
        OR created_users.first_name || ' ' || created_users.last_name ILIKE '%${search}%'
      )  
    )`;
  }
};

const filterCondition = (status, plant, date, datetype) => {
  let plantCond = ``;
  let dateCond = ``;
  let statusCond = ``;

  if (status != "" && status != 0) {
    if (status.includes(",")) {
      statusCond = `AND cl.status_id IN (${status})`;
    } else {
      statusCond = `AND cl.status_id = '${status}'`;
    }
  }

  if (plant && plant != 0) {
    plantCond = `AND cl.plant_id = '${plant}'`;
  }

  if (date && date !== "all") {
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
  return `${statusCond} ${plantCond} ${dateCond}`;
};

const fetchAllChecklistQuery = `
SELECT 
    cl.checklist_id, 
    cl.chl_name, 
    cl.description, 
    cl.status_id,
    cl.activity_log,
    CASE WHEN createdU.first_name IS NULL THEN 'System' ELSE concat( concat(createdU.first_name ,' '), createdU.last_name ) END AS createdByUser,
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
    st.status,
    cl.overdue,
    cl.overdue_status,
    cl.updated_at,
    STRING_AGG(cscm.status || ': ' || cs.date, ', ') AS checklist_status
    
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
            ',' || t3.linkedassetids || ',' LIKE concat(concat('%,',t2.psa_id::text) , ',%')
        GROUP BY t3.checklist_id) tmp1 ON tmp1.checklist_id = cl.checklist_id
    LEFT JOIN keppel.users assignU ON assignU.user_id = cl.assigned_user_id
    LEFT JOIN keppel.users createdU ON createdU.user_id = cl.created_user_id
    LEFT JOIN keppel.users signoff ON signoff.user_id = cl.signoff_user_id
    LEFT JOIN keppel.plant_master pm ON pm.plant_id = cl.plant_id
    JOIN keppel.status_cm st ON st.status_id = cl.status_id	
    left JOIN keppel.checklist_status cs on cs.checklist_id = cl.checklist_id
    left JOIN keppel.status_cm cscm on cscm.status_id = cl.status_id
`;

// check if user is an Opspec
const fetchAssignedChecklistsQuery =
  fetchAllChecklistQuery +
  `
  WHERE (cl.status_id is null or cl.status_id = 2 or cl.status_id = 3 or cl.status_id = 6) AND
      (CASE
          WHEN (SELECT ua.role_id
              FROM
                  keppel.user_access ua
              WHERE
                  ua.user_id = $1) = 4
          THEN assignU.user_id = $1
          ELSE True
          END) AND
          ua.user_id = $1
        ${groupBYCondition()}
  ORDER BY cl.checklist_id DESC
`;

const getAllChecklistQuery = (req) => {
  const expand = req.query.expand || false;
  const sortField = req.query.sortField;
  const sortOrder = req.query.sortOrder;

  let expandCond = "";
  let SELECT_ARR = [];
  let query;

  const SELECT = {
    checklist_id: "cl.checklist_id",
    chl_name: "cl.chl_name",
    description: "cl.description",
    status_id: "cl.status_id",
    activity_log: "cl.activity_log",
    createdbyuser:
      "CASE WHEN createdU.first_name IS NULL THEN 'System' ELSE concat( concat(createdU.first_name ,' '), createdU.last_name ) END AS createdByUser",
    assigneduser:
      "concat( concat(assignU.first_name ,' '), assignU.last_name ) AS assigneduser",
    signoffuser:
      "concat( concat(signoff.first_name ,' '), signoff.last_name ) AS signoffUser",
    plant_name: "pm.plant_name",
    plant_id: "pm.plant_id",
    completeremarks_req: "completeremarks_req",
    linkedassetids: "linkedassetids",
    chl_type: "cl.chl_type",
    created_date: "cl.created_date",
    history: "cl.history",
    datajson: "cl.datajson",
    signoff_user_id: "cl.signoff_user_id",
    assigned_user_id: "cl.assigned_user_id",
    status: "st.status",
    overdue: "cl.overdue",
    overdue_status: "cl.overdue_status",
    completeremarks_req: "cl.completeremarks_req",
    updated_at: "cl.updated_at",
    checklist_status: "STRING_AGG(cscm.status || ': ' || cs.date, ', ') AS checklist_status",
    date: "cs.date",
    checklist_user_role: "aa.item_name"

  };

  if (expand) {
    const expandArr = expand.split(",");

    SELECT_ARR = [];
    for (let i = 0; i < expandArr.length; i++) {
      SELECT_ARR.push(SELECT[expandArr[i]]);
    }
  } else {
    for (let key in SELECT) {
      if (SELECT.hasOwnProperty(key)) {
        SELECT_ARR.push(SELECT[key]);
      }
    }
  }

  expandCond = SELECT_ARR.join(", ");

  // for approved date and completed date sorting
  
  // if (sortField){
  //   if (sortField=='approved_date') {
  //   dateSelectClause = `DISTINCT ON (cl.checklist_id)
  //   (SELECT  jsonb_agg(activity ORDER BY idx DESC)
  //     FROM jsonb_array_elements(cl.activity_log) WITH ORDINALITY AS t(activity, idx)
  //     WHERE activity->>'activity_type' = 'APPROVED'
  //     LIMIT 1) AS approved_activity,`
  //     dateWhereClause = `AND al.elem->>'activity_type' = 'APPROVED'`;
  //     dateJoinClause = `
  //     JOIN keppel.request r1 ON u.user_id = r1.user_id 
  //     CROSS JOIN LATERAL
  //         jsonb_array_elements(r1.activity_log) AS al(elem)`;
  
  //     dateOrderByClause = `ORDER BY cl.checklist_id, (SELECT (activity->>'date')::timestamp
  //         FROM jsonb_array_elements(cl.activity_log) AS t(activity)
  //         WHERE activity->>'activity_type' = 'APPROVED'
  //         AND activity->>'date' IS NOT NULL
  //         LIMIT 1) ${sortOrder}`

  //   } 
  // }

  query = `
    SELECT 
      ${expandCond}
    FROM 
        keppel.users u
        JOIN keppel.user_access ua ON u.user_id = ua.user_id
        JOIN keppel.checklist_master cl on ua.allocatedplantids LIKE concat(concat('%',cl.plant_id::text), '%')
        LEFT JOIN keppel.users assignU ON assignU.user_id = cl.assigned_user_id
        LEFT JOIN keppel.users createdU ON createdU.user_id = cl.created_user_id
        LEFT JOIN keppel.auth_assignment aa ON aa.user_id = cl.created_user_id
        LEFT JOIN keppel.users signoff ON signoff.user_id = cl.signoff_user_id
        LEFT JOIN keppel.plant_master pm ON pm.plant_id = cl.plant_id
        JOIN keppel.status_cm st ON st.status_id = cl.status_id	
        left JOIN keppel.checklist_status cs on cs.checklist_id = cl.checklist_id
        left JOIN keppel.status_cm cscm on cscm.status_id = cl.status_id
    `
  return query;
};

const getAssignedChecklistsQuery = (req) => {
  const search = req.query.search || "";

  const sortField = req.query.sortField;
  const sortOrder = req.query.sortOrder;

  //console.log("Checklist Assigned: default sorting");
  //console.log(sortField, sortOrder);
  return (
    getAllChecklistQuery(req) +
    `
    WHERE (cl.status_id is null or cl.status_id = 2 or cl.status_id = 3 or cl.status_id = 6 or cl.status_id = 10) AND
        (CASE
            WHEN (SELECT ua.role_id
                FROM
                    keppel.user_access ua
                WHERE
                    ua.user_id = $1) = 4
            THEN assignU.user_id = $1
            ELSE True
            END) AND
            ua.user_id = $1
    ${condition(req)}
    ${advancedScheduleCond(req)}
    ${searchCondition(search)}
    ${groupBYCondition()}
    ${orderByCondition(sortField, sortOrder)}
  `
  );
};

const getPendingChecklistsQuery = (req) => {
  const search = req.query.search || "";
  const plant = req.params.plant;
  const date = req.params.date;
  const datetype = req.params.datetype;
  const sortField = req.query.sortField;
  const sortOrder = req.query.sortOrder;

  return (
    getAllChecklistQuery(req) +
    `
    WHERE
        ua.user_id = $1 AND
        (cl.status_id = 1)
    ${condition(req)}
    ${advancedScheduleCond(req)}
    ${filterCondition("", plant, date, datetype)}
    ${searchCondition(search)}
    ${groupBYCondition()}
    ${orderByCondition(sortField, sortOrder)}
    `
  );
};

const getOutstandingChecklistsQuery = (req) => {
  const search = req.query.search || "";
  const role_id = req.user.role_id;

  const plant = req.params.plant;
  const date = req.params.date;
  const datetype = req.params.datetype;
  const sortField = req.query.sortField;
  const sortOrder = req.query.sortOrder;

  let userRoleCond = "";

  if (role_id === 4) {
    userRoleCond = "AND (createdU.user_id = $1 OR assignU.user_id = $1)";
  }

  return (
    getAllChecklistQuery(req) +
    `
    WHERE
        ua.user_id = $1
        ${userRoleCond} AND
        (cl.status_id = 2 OR cl.status_id = 3 OR cl.status_id = 4 OR cl.status_id = 6 OR cl.status_id = 9 OR cl.status_id = 10)
    ${condition(req)}
    ${advancedScheduleCond(req)}
    ${filterCondition("", plant, date, datetype)}
    ${searchCondition(search)}
    ${groupBYCondition()}
    ${orderByCondition(sortField, sortOrder)}
  `
  );
};

const getCompletedChecklistsQuery = (req) => {
  const search = req.query.search || "";

  const plant = req.params.plant;
  const date = req.params.date;
  const datetype = req.params.datetype;
  const sortField = req.query.sortField;
  const sortOrder = req.query.sortOrder;

  return (
    getAllChecklistQuery(req) +
    `
    WHERE
        ua.user_id = $1 AND
        (cl.status_id = 6 OR cl.status_id = 11)
    ${condition(req)}
    ${filterCondition("", plant, date, datetype)}
    ${searchCondition(search)}
    ${groupBYCondition()}
    ${orderByCondition(sortField, sortOrder)}
  `
  );
};

const getOverdueChecklistsQuery = (req) => {
  const search = req.query.search || "";

  const plant = req.params.plant;
  const date = req.params.date;
  const datetype = req.params.datetype;
  return (
    getAllChecklistQuery(req) +
    `
    WHERE
        ua.user_id = $1 AND
        cl.overdue_status = true
    ${condition(req)}
    ${filterCondition("", plant, date, datetype)}
    ${searchCondition(search)}
    ${groupBYCondition()}
    ORDER BY cl.checklist_id DESC
  `
  );
};

const getForReviewChecklistsQuery = (req) => {
  const search = req.query.search || "";
  const sortField = req.query.sortField;
  const sortOrder = req.query.sortOrder;

  return (
    getAllChecklistQuery(req) +
    `
    WHERE
        ua.user_id = $1 AND
        (cl.status_id = 4 or cl.status_id = 8 or cl.status_id = 9)
    ${condition(req)}
    ${searchCondition(search)}
    ${groupBYCondition()}
    ${orderByCondition(sortField, sortOrder)}
  `
  );
};

const getApprovedChecklistsQuery = (req) => {
  const search = req.query.search || "";
  const sortField = req.query.sortField;
  const sortOrder = req.query.sortOrder;
  
  return (
    getAllChecklistQuery(req) +
    `
    WHERE
        ua.user_id = $1 AND
        (cl.status_id = 5 OR cl.status_id = 7 OR cl.status_id = 11)
    ${condition(req)}
    ${searchCondition(search)}
    ${groupBYCondition()}
    ${orderByCondition(sortField, sortOrder)}
  `
  );
};

const fetchAssignedChecklists = async (req, res, next) => {
  const page = req.query.page || 1;
  const offsetItems = (+page - 1) * ITEMS_PER_PAGE;
  const expand = req.query.expand || false;
  const search = req.query.search || "";

  const totalRows = await global.db.query(getAssignedChecklistsQuery(req), [
    req.user.id,
  ]);
  const totalPages = Math.ceil(+totalRows.rowCount / ITEMS_PER_PAGE);
  const query =
    getAssignedChecklistsQuery(req) +
    ` LIMIT ${ITEMS_PER_PAGE} OFFSET ${offsetItems}`;
    console.log(getAssignedChecklistsQuery);

  try {
    const result = await global.db.query(query, [req.user.id]);
    //if (result.rows.length == 0)
    //return res.status(204).json({ msg: "No checklist" });
    // console.log(result.rows);
    // console.log(totalPages);

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
        ${groupBYCondition()}
ORDER BY cl.checklist_id DESC
`;

const fetchPendingChecklists = async (req, res, next) => {
  const page = req.query.page || 1;
  const offsetItems = (+page - 1) * ITEMS_PER_PAGE;
  const expand = req.query.expand || false;
  const search = req.query.search || "";
  const sortField = req.query.sortField;
  const sortOrder = req.query.sortOrder;

  const totalRows = await global.db.query(getPendingChecklistsQuery(req), [
    req.user.id,
  ]);
  const totalPages = Math.ceil(+totalRows.rowCount / ITEMS_PER_PAGE);

  const query =
    getPendingChecklistsQuery(req) +
    (req.query.page ? ` LIMIT ${ITEMS_PER_PAGE} OFFSET ${offsetItems}` : "");

  try {
    const result = await global.db.query(query, [req.user.id]);
    //if (result.rows.length == 0)
    //return res.status(204).json({ msg: "No checklist" });

    return res.status(200).json({ rows: result.rows, total: totalPages });
  } catch (error) {
    return res.status(500).json({ msg: error });
  }
};

const fetchOutstandingChecklists = async (req, res, next) => {
  const page = req.query.page || 1;
  const offsetItems = (+page - 1) * ITEMS_PER_PAGE;
  const expand = req.query.expand || false;
  const search = req.query.search || "";

  const totalRows = await global.db.query(getOutstandingChecklistsQuery(req), [
    req.user.id,
  ]);
  const totalPages = Math.ceil(+totalRows.rowCount / ITEMS_PER_PAGE);

  const query =
    getOutstandingChecklistsQuery(req) +
    (req.query.page ? ` LIMIT ${ITEMS_PER_PAGE} OFFSET ${offsetItems}` : "");
  //console.log(query);

  try {
    const result = await global.db.query(query, [req.user.id]);
    //if (result.rows.length == 0)
    //return res.status(204).json({ msg: "No checklist" });

    return res.status(200).json({ rows: result.rows, total: totalPages });
  } catch (error) {
    return res.status(500).json({ msg: error });
  }
};

const fetchCompletedChecklists = async (req, res, next) => {
  const page = req.query.page || 1;
  const offsetItems = (+page - 1) * ITEMS_PER_PAGE;
  const expand = req.query.expand || false;
  const search = req.query.search || "";

  const totalRows = await global.db.query(getCompletedChecklistsQuery(req), [
    req.user.id,
  ]);
  const totalPages = Math.ceil(+totalRows.rowCount / ITEMS_PER_PAGE);

  const query =
    getCompletedChecklistsQuery(req) +
    (req.query.page ? ` LIMIT ${ITEMS_PER_PAGE} OFFSET ${offsetItems}` : "");

  try {
    const result = await global.db.query(query, [req.user.id]);
    //if (result.rows.length == 0)
    //return res.status(204).json({ msg: "No checklist" });

    return res.status(200).json({ rows: result.rows, total: totalPages });
  } catch (error) {
    return res.status(500).json({ msg: error });
  }
};

const fetchOverdueChecklists = async (req, res, next) => {
  const page = req.query.page || 1;
  const offsetItems = (+page - 1) * ITEMS_PER_PAGE;
  const expand = req.query.expand || false;
  const search = req.query.search || "";

  const totalRows = await global.db.query(getOverdueChecklistsQuery(req), [
    req.user.id,
  ]);
  const totalPages = Math.ceil(+totalRows.rowCount / ITEMS_PER_PAGE);

  const query =
    getOverdueChecklistsQuery(req) +
    (req.query.page ? ` LIMIT ${ITEMS_PER_PAGE} OFFSET ${offsetItems}` : "");

  try {
    const result = await global.db.query(query, [req.user.id]);
    //if (result.rows.length == 0)
    //return res.status(204).json({ msg: "No checklist" });

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
    (cl.status_id = 4 OR cl.status_id = 6 OR cl.status_id = 9)
        ${groupBYCondition()}
    ORDER BY cl.activity_log -> (jsonb_array_length(cl.activity_log) -1) ->> 'date' desc
`;

const fetchForReviewChecklists = async (req, res, next) => {
  const page = req.query.page || 1;
  const offsetItems = (+page - 1) * ITEMS_PER_PAGE;
  const expand = req.query.expand || false;
  const search = req.query.search || "";

  const totalRows = await global.db.query(getForReviewChecklistsQuery(req), [
    req.user.id,
  ]);
  const totalPages = Math.ceil(+totalRows.rowCount / ITEMS_PER_PAGE);

  const query =
    getForReviewChecklistsQuery(req) +
    ` LIMIT ${ITEMS_PER_PAGE} OFFSET ${offsetItems}`;

  try {
    const result = await global.db.query(query, [req.user.id]);
    //if (result.rows.length == 0)
    //return res.status(204).json({ msg: "No checklist" });

    return res.status(200).json({ rows: result.rows, total: totalPages });
  } catch (error) {
    return res.status(500).json({ msg: error });
  }
};


const fetchApprovedChecklistsQuery =
  fetchAllChecklistQuery +
    `WHERE 
      ua.user_id = $1 AND 
      (cl.status_id = 5 OR cl.status_id = 7 OR cl.status.id = 11)
          ${groupBYCondition()}
    ORDER BY cl.checklist_id desc`;
const fetchApprovedChecklists = async (req, res, next) => {
  const page = req.query.page || 1;
  const offsetItems = (+page - 1) * ITEMS_PER_PAGE;
  const expand = req.query.expand || false;
  const search = req.query.search || "";

  const totalRows = await global.db.query(getApprovedChecklistsQuery(req), [
    req.user.id,
  ]);
  const totalPages = Math.ceil(+totalRows.rowCount / ITEMS_PER_PAGE);

  const query =
    getApprovedChecklistsQuery(req) +
    ` LIMIT ${ITEMS_PER_PAGE} OFFSET ${offsetItems}`;

  try {
    const result = await global.db.query(query, [req.user.id]);
    //if (result.rows.length == 0)
    //return res.status(204).json({ msg: "No checklist" });

    return res.status(200).json({ rows: result.rows, total: totalPages });
  } catch (error) {
    return res.status(500).json({ msg: error });
  }
};

// get checklist templates
const fetchChecklistTemplateNames = async (req, res, next) => {
  let userRoleCond = '';
  if(userPermission('canOnlyViewCMTList', req.user.permissions)) {
    userRoleCond = `AND aa.item_name like '%cmt%'`;
  }

  const search = req.query.search || "";
  // Plant_id = 0 refers to fetching all the universal templates as well:
  const sql = req.params.id
    ? `SELECT * from keppel.checklist_templates 
    JOIN keppel.auth_assignment aa ON aa.user_id = keppel.checklist_templates.created_user_id
    WHERE (plant_id = ${req.params.id} OR plant_id = 0) ${templateSearchCondition(search)} ${userRoleCond}
          ORDER BY keppel.checklist_templates.checklist_id DESC;` // templates are plant specificed (from that plant only)
    : `SELECT * from keppel.checklist_templates 
    JOIN keppel.auth_assignment aa ON aa.user_id = keppel.checklist_templates.created_user_id
    WHERE (plant_id = any(ARRAY[${req.user.allocated_plants}]::int[]) OR plant_id = 0) ${templateSearchCondition(search)} ${userRoleCond}
          ORDER BY keppel.checklist_templates.checklist_id DESC;`; // templates are plants specificed depending on user access(1 use can be assigned multiple plants)

  global.db.query(sql, (err, result) => {
    if (err) return res.status(500).json({ msg: error });
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
            ct.status_id,
            ct.linkedassetids,
            ct.overdue
        FROM
            keppel.checklist_templates ct
        WHERE 
            checklist_id = $1
    `;

  global.db.query(sql, [req.params.checklist_id], (err, found) => {
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
            cl.checklist_id = $1 and ua.user_id = $2
        GROUP BY (
          cl.checklist_id,
          createdu.first_name,
          createdu.last_name,
          assignU.first_name,
          assignU.last_name,
          signoff.first_name,
          signoff.last_name,
          pm.plant_id,
          pm.plant_name,
          st.status,
          tmp1.assetNames,
          cs.date
        )  
    `;

  global.db.query(sql, [req.params.checklist_id, 17], (err, found) => {
    if (err) {
      console.log(err);
      return res.status(500).json("No checklist template found");
    }
    // console.log(found.rows);
    res.status(200).send(found.rows[0]);
  });
};

const fetchMultipleChecklistRecords = async (req, res, next) => {
  const checklist_ids_tuple = req.params.checklist_ids
  console.log(checklist_ids_tuple)
  const sql =
    fetchAllChecklistQuery +
    ` 
    WHERE
      cl.checklist_id in ${checklist_ids_tuple} AND
      ua.user_id = $1 
        
      ${groupBYCondition()}
    `;

  global.db.query(sql, [17], (err, found) => {
    if (err) {
      console.log(err);
      return res.status(500).json("No checklist template found");
    }
    console.log("found.rows",found.rows);
    res.status(200).send(found.rows);
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
  if (req.body.checklistSections === undefined)
    return res.status(400).json("ayo?");

  return res.status(200).json({
    msg: "awesome",
  });
};

const createNewChecklistRecord = async (req, res, next) => {
  // console.log("REQ: " , req.body);
  const { checklist } = req.body;
  // console.log("checklist" , JSON.stringify(checklist));

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
            status_id,
            activity_log,
            overdue
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)    
        RETURNING checklist_id    
    `;

  const today = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");

  const activity_log = [
    {
      date: today,
      name: req.user.name,
      activity: "Created Checklist Record",
      activity_type: `${statusId === 2 ? "ASSIGNED" : "PENDING"}`,
    },
  ];

  try {
    const data = await global.db.query(sql, [
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
      statusId,
      JSON.stringify(activity_log),
      checklist.overdue,
    ]);

    if (statusId === 2) {
      const { checklist_id } = data.rows[0];
      const {
        assigned_user_email,
        signoff_user_email,
        creator_email,
        plant_name,
        assets,
        status,
      } = await fetchEmailDetailsForSpecificChecklist(checklist_id);

      const mail = new CreateChecklistMail(
        [assigned_user_email, signoff_user_email],
        {
          id: checklist_id,
          name: checklist.chl_name,
          description: checklist.description,
          date: today,
          plant: plant_name,
          assets: assets,
          assignedTo: assigned_user_email,
          signoff: signoff_user_email,
          createdBy: creator_email,
          status: status,
          overdue: checklist.overdue,
        },
        "",
        [creator_email]
      );

      // await mail.send();
    }

    return res.status(200).json("New checklist successfully created");
  } catch (err) {
    console.log(err);
    return res.status(500).json("Failure to create new checklist");
  }
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
            status_id,
            linkedassetids,
            overdue
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`;

  const today = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");

  const history = `Created Template_PENDING_${today}_${req.user.name}_NIL`;

  global.db.query(
    sql,
    [
      checklist.chl_name,
      checklist.description ?? "",
      checklist.signoff_user_id,
      JSON.stringify(checklist.datajson),
      "Template",
      checklist.plant_id,
      today,
      req.user.id,
      history,
      1,
      checklist.linkedassetids,
      checklist.overdue,
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
          ? `SELECT S.STATUS AS NAME, CM.STATUS_ID AS ID, CM.OVERDUE_STATUS AS OVERDUE_STATUS, COUNT(CM.STATUS_ID) AS VALUE FROM KEPPEL.CHECKLIST_MASTER CM
				JOIN KEPPEL.STATUS_CM S ON S.STATUS_ID = CM.STATUS_ID
				WHERE CM.PLANT_ID = ${req.params.plant}
                ${dateCond}
				GROUP BY(CM.STATUS_ID, S.STATUS, CM.OVERDUE_STATUS) ORDER BY (status)`
          : `SELECT S.STATUS AS NAME, CM.STATUS_ID AS ID, CM.OVERDUE_STATUS, COUNT(CM.STATUS_ID) AS VALUE FROM KEPPEL.CHECKLIST_MASTER CM
				JOIN KEPPEL.STATUS_CM S ON S.STATUS_ID = CM.STATUS_ID
                WHERE 1 = 1
                ${dateCond}
				GROUP BY(CM.STATUS_ID, S.STATUS, CM.OVERDUE_STATUS) ORDER BY (status)`;
      break;
    default:
      return res
        .status(404)
        .send(`Invalid checklist type of ${req.params.field}`);
  }
  global.db.query(sql, (err, result) => {
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
      activeTabQuery = fetchAssignedChecklistsQuery;
      break;
    case "2":
      activeTabQuery = fetchForReviewChecklistsQuery;
      break;
    case "3":
      activeTabQuery = fetchApprovedChecklistsQuery;
      break;
    default:
      activeTabQuery = `fetch error`;
  }
  global.db.query(activeTabQuery, [req.user.id], (err, result) => {
    if (err) return res.status(400).json({ msg: err });
    if (result.rows.length == 0)
      return res.status(204).json({ msg: "No checklist" });
    // console.log(result);
    generateCSV(result.rows)
      .then((buffer) => {
        res.set({
          "Content-Type": "text/csv",
        });
        // console.log(buffer);
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
          'activity', 'Checklist ID-${req.params.checklist_id} Completed',
          'activity_type', 'WORK DONE'
        )
        WHERE 
            checklist_id = $2
    `;

  try {
    await global.db.query(sql, [
      JSON.stringify(req.body.datajson),
      req.params.checklist_id,
    ]);

    const {
      assigned_user_email,
      signoff_user_email,
      creator_email,
      plant_name,
      assets,
      status,
      name,
      description,
      created_date,
      overdue,
    } = await fetchEmailDetailsForSpecificChecklist(req.params.checklist_id);

    const mail = new CompleteChecklistMail(
      [assigned_user_email, signoff_user_email],
      {
        id: req.params.checklist_id,
        name: name,
        description: description,
        date: created_date,
        plant: plant_name,
        assets: assets,
        assignedTo: assigned_user_email,
        signoff: signoff_user_email,
        createdBy: creator_email,
        status: status,
        overdue: overdue,
      },
      "",
      [creator_email]
    );

    // await mail.send();

    return res.status(200).json("Checklist successfully completed");
  } catch (err) {
    // console.log(err);
    return res.status(500).json("Failure to update checklist completion");
  }
};

const editChecklistRecord = async (req, res, next) => {
  const data = req.body.checklistData;
  const assigned = req.body.assigned;
  const today = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");

  const updatehistory = assigned
    ? `,Assigned Record_ASSIGNED_${today}_${req.user.name}`
    : `,Edited Record_PENDING_${today}_${req.user.name}`;
  const statusId = data.assigned_user_id ? 2 : 1;
  const activity_log = assigned
    ? {
        date: today,
        name: req.user.name,
        activity: `Assigned Checklist ID-${
          req.params.checklist_id
        } to ${data.assigneduser.split("|")[0].trim()}`,
        activity_type: "ASSIGNED",
      }
    : {
        date: today,
        name: req.user.name,
        activity: `Edited (${
          statusId == 2 ? "ASSIGNED" : "PENDING"
        }) Checklist ID-${req.params.checklist_id}`,
        activity_type: `EDITED`,
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
            activity_log = activity_log || $9,
            overdue = $11
        WHERE 
            checklist_id = $10
    `;

  try {
    await global.db.query(sql, [
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
      data.overdue,
    ]);

    if (statusId === 2) {
      const {
        assigned_user_email,
        signoff_user_email,
        creator_email,
        plant_name,
        assets,
        status,
        name,
        description,
        overdue,
      } = await fetchEmailDetailsForSpecificChecklist(req.params.checklist_id);

      const mail = new CreateChecklistMail(
        [assigned_user_email, signoff_user_email],
        {
          id: req.params.checklist_id,
          name: name,
          description: description,
          date: today,
          plant: plant_name,
          assets: assets,
          assignedTo: assigned_user_email,
          signoff: signoff_user_email,
          createdBy: creator_email,
          status: status,
          overdue: overdue,
        },
        "",
        [creator_email]
      );
    }
    return res
      .status(200)
      .json(
        `Checklist successfully ${
          data.assigned_user_id ? "assigned" : "updated"
        }`
      );
  } catch (err) {
    return res.status(500).json("Failure to update checklist");
  }
};

const approveChecklist = async (req, res, next) => {
  const today = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
  const approvalComments = req.body.remarks;

  const updatehistory = `,Updated Record_APPROVE_${today}_${req.user.name}`;
  const activity_log = {
    date: today,
    name: req.user.name,
    activity: `Checklist ID-${req.params.checklist_id} Approved`,
    activity_type: "APPROVED",
    remarks: approvalComments,
  };

  const sql = `
        UPDATE
            keppel.checklist_master
        SET 
            status_id = 5,
            overdue_status = false,
            history = concat(history,'${updatehistory}'),
            activity_log = activity_log || $1
        WHERE 
            checklist_id = $2
    `;

  try {
    await global.db.query(sql, [
      JSON.stringify(activity_log),
      req.params.checklist_id,
    ]);

    const {
      assigned_user_email,
      signoff_user_email,
      creator_email,
      plant_name,
      assets,
      status,
      name,
      description,
      created_date,
      overdue,
    } = await fetchEmailDetailsForSpecificChecklist(req.params.checklist_id);

    const mail = new ApproveChecklistMail(
      [assigned_user_email, signoff_user_email],
      {
        id: req.params.checklist_id,
        name: name,
        description: description,
        date: created_date,
        plant: plant_name,
        assets: assets,
        assignedTo: assigned_user_email,
        signoff: signoff_user_email,
        createdBy: creator_email,
        status: status,
        overdue: overdue,
      },
      "",
      [creator_email]
    );

    // await mail.send();

    return res.status(200).json("Checklist successfully approved");
  } catch (err) {
    return res.status(500).json("Failure to update checklist approval");
  }
};

const rejectChecklist = async (req, res, next) => {
  const today = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
  const rejectionComments = req.body.remarks; // todo add rejected comment here

  const updatehistory = `,Updated Record_REJECTED_${today}_${req.user.name}_${rejectionComments}`;
  const activity_log = {
    date: today,
    name: req.user.name,
    activity: `Checklist ID-${req.params.checklist_id} Rejected`,
    activity_type: "REJECTED",
    remarks: rejectionComments,
  };

  const sql = `
        UPDATE
            keppel.checklist_master
        SET 
            status_id = 6,
            overdue_status = false,
            history = concat(history,'${updatehistory}'),
            activity_log = activity_log || $1
        WHERE 
            checklist_id = $2
    `;

  try {
    await global.db.query(sql, [
      JSON.stringify(activity_log),
      req.params.checklist_id,
    ]);

    const {
      assigned_user_email,
      signoff_user_email,
      creator_email,
      plant_name,
      assets,
      status,
      name,
      description,
      created_date,
    } = await fetchEmailDetailsForSpecificChecklist(req.params.checklist_id);

    const mail = new RejectChecklistMail(
      [assigned_user_email, signoff_user_email],
      {
        id: req.params.checklist_id,
        name: name,
        description: description,
        date: created_date,
        plant: plant_name,
        assets: assets,
        assignedTo: assigned_user_email,
        signoff: signoff_user_email,
        createdBy: creator_email,
        status: status,
      },
      "",
      rejectionComments,
      [creator_email]
    );

    // await mail.send();

    return res.status(200).json("Checklist successfully rejected");
  } catch (err) {
    return res.status(500).json("Failure to update checklist rejection");
  }
};

const cancelChecklist = async (req, res, next) => {
  const today = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
  const cancelledComments = req.body.remarks ? req.body.remarks : "";

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
            overdue_status = false,
            history = concat(history,'${updatehistory}'),
            activity_log = activity_log || $1,
            completeremarks_req = '${cancelledComments}'
        WHERE 
            checklist_id = $2
    `;

  global.db.query(
    sql,
    [JSON.stringify(activity_log), req.params.checklist_id],
    (err) => {
      if (err) {
        console.log(err);
        return res.status(500).json("Failure to update checklist cancellation");
      }
      return res.status(200).json("Checklist successfully cancelled");
    }
  );
};

const requestCancelChecklist = async (req, res, next) => {
  const today = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
  const cancelledComments = req.body.remarks ? req.body.remarks : "";

  const updatehistory = `,Updated Record_REQUEST_CANCELLATION_${today}_${req.user.name}_${cancelledComments}`;
  const activity_log = {
    date: today,
    name: req.user.name,
    activity: "REQUEST_CANCELLATION",
    activity_type: "Updated Record",
    comments: cancelledComments,
  };

  const sql = `
        UPDATE
            keppel.checklist_master
        SET 
            status_id = 9,
            overdue_status = false,
            history = concat(history,'${updatehistory}'),
            activity_log = activity_log || $1,
            completeremarks_req = '${cancelledComments}'
        WHERE 
            checklist_id = $2
    `;

  global.db.query(
    sql,
    [JSON.stringify(activity_log), req.params.checklist_id],
    (err) => {
      if (err) {
        // console.log(err);
        return res
          .status(500)
          .json("Failure to update checklist request cancellation");
      }
      return res
        .status(200)
        .json("Checklist successfully request cancellation");
    }
  );
};
const approveCancelChecklist = async (req, res, next) => {
  const today = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
  const cancelledComments = req.body.remarks ? req.body.remarks : "";

  const updatehistory = `,Updated Record_APPROVE_CANCELLATION_${today}_${req.user.name}_${cancelledComments}`;
  const activity_log = {
    date: today,
    name: req.user.name,
    activity: "APPROVE_CANCELLATION",
    activity_type: "Updated Record",
    comments: cancelledComments,
  };

  const sql = `
        UPDATE
            keppel.checklist_master
        SET 
            status_id = 11,
            overdue_status = false,
            history = concat(history,'${updatehistory}'),
            activity_log = activity_log || $1,
            completeremarks_req = '${cancelledComments}'
        WHERE 
            checklist_id = $2
    `;

  global.db.query(
    sql,
    [JSON.stringify(activity_log), req.params.checklist_id],
    (err) => {
      if (err) {
        // console.log(err);
        return res
          .status(500)
          .json("Failure to update checklist approve cancellation");
      }
      return res
        .status(200)
        .json("Checklist successfully approve cancellation");
    }
  );
};
const rejectCancelChecklist = async (req, res, next) => {
  const today = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
  const cancelledComments = req.body.remarks ? req.body.remarks : "";

  const updatehistory = `,Updated Record_REJECT_CANCELLATION_${today}_${req.user.name}_${cancelledComments}`;
  const activity_log = {
    date: today,
    name: req.user.name,
    activity: "REJECT_CANCELLATION",
    activity_type: "Updated Record",
    comments: cancelledComments,
  };

  const sql = `
        UPDATE
            keppel.checklist_master
        SET 
            status_id = 10,
            overdue_status = false,
            history = concat(history,'${updatehistory}'),
            activity_log = activity_log || $1,
            completeremarks_req = '${cancelledComments}'

        WHERE 
            checklist_id = $2
    `;

  global.db.query(
    sql,
    [JSON.stringify(activity_log), req.params.checklist_id],
    (err) => {
      if (err) {
        // console.log(err);
        return res
          .status(500)
          .json("Failure to update checklist reject cancellation");
      }
      return res.status(200).json("Checklist successfully reject cancellation");
    }
  );
};

const requestReassignChecklist = async (req, res, next) => {
  // Sets status of the checklist to "Reassignment Request" / status_id = 8
  const today = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");

  try {
    const checklist_id = parseInt(req.params.checklist_id);
    const reassignReqComments = req.body.remarks; // todo add reassign comment here

    // Update activity log entry in the record
    const updatehistory = `,Updated Record_REASSIGNED_${today}_${req.user.name}_${reassignReqComments}`;
    const activity_log = {
      date: today,
      name: req.user.name,
      activity: "REASSIGNMENT REQUEST",
      activity_type: "Updated Record",
      comments: reassignReqComments,
    };

    const sql = `
          UPDATE
              keppel.checklist_master
          SET 
              status_id = 8,
              completeremarks_req = $1,
              history = concat(history,'${updatehistory}'),
              activity_log = activity_log || $2
          WHERE 
              checklist_id = $3
      `;

    global.db.query(
      sql,
      [reassignReqComments, JSON.stringify(activity_log), checklist_id],
      (err, result) => {
        if (err) {
          console.log(err);
          return res
            .status(500)
            .json("Failure to update checklist reassignment request");
        }
        if (result.rowCount == 0) {
          return res
            .status(404)
            .json("Checklist ID: " + checklist_id + " does not exist");
        }
        return res
          .status(200)
          .json(
            "Reassignment Request for Checklist ID: " +
              checklist_id +
              " Successfully Created"
          );
      }
    );
  } catch (err) {
    console.log(err);
    return res.status(403).json("Invalid Input IDs");
  }
};

const approveReassignChecklist = async (req, res, next) => {
  // When user approves the reassignment request for the checklist - revert to status_id = 2 (assigned) and update to new assigned user
  const today = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
  try {
    const checklist_id = parseInt(req.params.checklist_id);
    const reassignedUserId = parseInt(req.body.assigned_user_id);
    const approvalComments = req.body.remarks;
    const updatehistory = `,Updated Record_APPROVE_REASSIGNMENT_REQUEST_${today}_${req.user.name}_${approvalComments}`;
    const activity_log = {
      date: today,
      name: req.user.name,
      activity: "APPROVE_REASSIGNMENT_REQUEST",
      activity_type: "Updated Record",
      comments: approvalComments,
    };

    const sql = `
          UPDATE
              keppel.checklist_master
          SET 
              status_id = 2,
              assigned_user_id = $1,
              completeremarks_req = $2,
              history = concat(history,'${updatehistory}'),
              activity_log = activity_log || $3
          WHERE 
              checklist_id = $4 AND status_id = 8
      `;

    global.db.query(
      sql,
      [
        reassignedUserId,
        approvalComments,
        JSON.stringify(activity_log),
        req.params.checklist_id,
      ],
      (err, result) => {
        if (err) {
          console.log(err);
          return res
            .status(500)
            .json(
              "Failure to update checklist approval of reassignment request"
            );
        }
        if (result.rowCount == 0) {
          return res
            .status(404)
            .json(
              "Checklist ID: " +
                checklist_id +
                " of Reassignment Request status does not exist"
            );
        }
        return res
          .status(200)
          .json("Checklist successfully approved for reassignment request");
      }
    );
  } catch (err) {
    console.log(err);
    return res.status(403).json("Invalid Input IDs");
  }
};

const rejectReassignChecklist = async (req, res, next) => {
  const today = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
  try {
    const checklist_id = parseInt(req.params.checklist_id);
    const rejectionComments = req.body.remarks; // todo add rejected comment here
    const updatehistory = `,Updated Record_REJECT_REASSIGNMENT_REQUEST_${today}_${req.user.name}_${rejectionComments}`;
    const activity_log = {
      date: today,
      name: req.user.name,
      activity: "REJECT_REASSIGNMENT_REQUEST",
      activity_type: "Updated Record",
      comments: rejectionComments,
    };

    const sql = `
          UPDATE
              keppel.checklist_master
          SET 
              status_id = 2,
              completeremarks_req = $1,
              history = concat(history,'${updatehistory}'),
              activity_log = activity_log || $2
          WHERE 
              checklist_id = $3 AND status_id = 8
      `; // Only
    global.db.query(
      sql,
      [
        rejectionComments,
        JSON.stringify(activity_log),
        req.params.checklist_id,
      ],
      (err, result) => {
        if (err) {
          console.log(err);
          return res
            .status(500)
            .json(
              "Failure to update checklist rejection of reassignment request"
            );
        }
        if (result.rowCount == 0) {
          return res
            .status(404)
            .json(
              "Checklist ID: " +
                checklist_id +
                " of Reassignment Request status does not exist"
            );
        }
        return res
          .status(200)
          .json("Checklist successfully reject reassignment request");
      }
    );
  } catch (err) {
    console.log(err);
    return res.status(403).json("Invalid Input IDs");
  }
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
    case "requestCancel":
      return requestCancelChecklist;
    case "approveCancel":
      return approveCancelChecklist;
    case "rejectCancel":
      return rejectCancelChecklist;
    case "requestReassign":
      return requestReassignChecklist;
    case "approveReassign":
      return approveReassignChecklist;
    case "rejectReassign":
      return rejectReassignChecklist;
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

  global.db.query(sql, (err) => {
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
    userRoleCond = `AND cl.assigned_user_id = ${req.user.id}`;
  }

  if (plant && plant != 0) {
    plantCond = `AND cl.plant_id = '${plant}'`;
  }

  if (status) {
    if (status.includes(",")) {
      statusCond = `AND cl.status_id IN (${status})`;
    } else {
      statusCond = `AND cl.status_id = '${status}'`;
    }
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
        ${plantCond}
        ${statusCond}
        ${dateCond}
        ${groupBYCondition()}
    ORDER BY cl.checklist_id DESC
    `;

  const countSql = `SELECT COUNT(*) AS total FROM (${sql}) AS t1`;

  const totalRows = await global.db.query(countSql);
  const totalPages = Math.ceil(+totalRows.rows[0].total / ITEMS_PER_PAGE);

  global.db.query(sql + pageCond, (err, result) => {
    if (err) return res.status(500).json({ msg: err });
    if (result.rows.length == 0)
      return res.status(204).json({ msg: "No checklist" });

    return res.status(200).json({ rows: result.rows, total: totalPages });
  });
};

const fetchEmailDetailsForSpecificChecklist = async (checklist_id) => {
  const data = await global.db.query(
    `
        SELECT 
            u1.user_email as assigned_user_email,
            u2.user_email as signoff_user_email,
            u3.user_email as creator_email,
            pm.plant_name,
            tmp.assetNames AS assets,
            s.status,
            cm.chl_name as name,
            cm.description,
            cm.created_date,
            cm.overdue
            
        FROM 
            keppel.checklist_master cm 
                JOIN keppel.users u1 ON cm.assigned_user_id = u1.user_id
                JOIN keppel.users u2 ON cm.signoff_user_id = u2.user_id
                JOIN keppel.users u3 ON cm.created_user_id = u3.user_id
                JOIN keppel.plant_master pm ON cm.plant_id = pm.plant_id
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
                    GROUP BY t3.checklist_id
                ) tmp ON tmp.checklist_id = cm.checklist_id
                JOIN keppel.status_cm s ON cm.status_id = s.status_id
        WHERE
            cm.checklist_id = $1
    `,
    [checklist_id]
  );

  return data.rows[0];
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
  fetchOutstandingChecklists,
  fetchCompletedChecklists,
  editChecklistRecord,
  fetchOverdueChecklists,
  fetchMultipleChecklistRecords,
};
