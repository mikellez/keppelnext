const db = require("../../db");
const { generateCSV } = require("../csvGenerator");
const tableInfo = require("../../public/master.json");
const activityLog = require("../../public/activity.json");

const ITEMS_PER_PAGE = 10;

let query = `
    SELECT concat(ii.first_name, ' ', ii.last_name) AS user_name,
            'Login events'::text AS type,
            to_timestamp(substr(i.datetime::text, 1, length(i.datetime::text) - 3), 'mm-dd-yyyy HH24:MI'::text) AS event_time,
            i.activity AS description
        FROM keppel.loginevents i,
            keppel.users ii
        WHERE i.userid = ii.user_id
        GROUP BY (to_timestamp(substr(i.datetime::text, 1, length(i.datetime::text) - 3), 'mm-dd-yyyy HH24:MI'::text)), ii.user_name, i.activity, ii.first_name, ii.last_name
       
`;
for (const key in activityLog) {
  query += `
    UNION ALL
    SELECT btrim(((activity.value -> 'name'::text)::character varying)::text, '"'::text) AS user_name,
    '${key}'::text AS type,
    to_timestamp(substr(((activity.value -> 'date'::text)::character varying)::text, 2, length(((activity.value -> 'date'::text)::character varying)::text) - 1), '${activityLog[key].format}') AS event_time,
    btrim(concat(activity.value -> 'activity'::text), '"'::text) AS description
    FROM ${activityLog[key].table},
    LATERAL jsonb_array_elements(${activityLog[key].table}.activity_log) activity(value)
    `;
}
for (const key in tableInfo) {
  query += ` UNION ALL
    SELECT btrim(((activity.value -> 'name'::text)::character varying)::text, '"'::text) AS user_name,
        'Master'::text AS type,
        to_timestamp(substr(((activity.value -> 'date'::text)::character varying)::text, 2, length(((activity.value -> 'date'::text)::character varying)::text) - 1), 'yyyy-mm-dd HH24:MI:SS::text') AS event_time,
        btrim(concat(activity.value -> 'activity'::text), '"'::text) AS description
         FROM keppel.${tableInfo[key].internalName},
        LATERAL jsonb_array_elements(${tableInfo[key].internalName}.activity_log) activity(value)`;
}
/*for (const key in tableInfo) {
    query += ` UNION ALL
    SELECT btrim(((activity.value -> 'name'::text)::character varying)::text, '"'::text) AS user_name,
        'Master'::text AS type,
        to_timestamp(substr(((activity.value -> 'date'::text)::character varying)::text, 2, length(((activity.value -> 'date'::text)::character varying)::text) - 5), 'dd-mm-yyyy HH24:MI'::text) AS event_time,
        btrim(concat(activity.value -> 'activity'::text), '"'::text) AS description
         FROM keppel.${tableInfo[key].internalName},
        LATERAL jsonb_array_elements(${tableInfo[key].internalName}.activity_log) activity(value)`
}*/

const getEventtHistory = async (req, res, next) => {
  let q = `SELECT * FROM (${query}) AS activity_log WHERE event_time >= date_trunc('month', CURRENT_DATE) ORDER BY event_time DESC`;
  //console.log(q);
  // global.db.query(q, (err, result) => {
  //     // console.log(result.rows);
  //     if (err) return res.status(400).json({ msg: err });
  //     if (result.rows.length == 0) return res.status(201).json({ msg: "No assets added" });
  //     return res.status(200).json(result.rows);
  // });
  const page = req.query.page || 1;
  const offsetItems = (page - 1) * ITEMS_PER_PAGE;
  let totalPages;
  try {
    const result = await global.db.query(q);
    totalPages = Math.ceil(result.rows.length / ITEMS_PER_PAGE);
    q += ` LIMIT ${ITEMS_PER_PAGE} OFFSET ${offsetItems}`;
    const logs = await global.db.query(q);
    return res.status(200).json({ logs: logs.rows, totalPages });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ msg: err });
  }
};

const getEventtHistoryDate = async (req, res, next) => {
  let date = req.params.date;
  let type = req.params.type;
  let date_trunc = `WHERE date_trunc('month', event_time) = date_trunc('month', '${date}'::date)`;
  if (type == "day") {
    date_trunc = `WHERE CAST(event_time AS DATE) = '${date}'`;
  } else if (type == "month") {
    date_trunc = `WHERE date_trunc('month', event_time) = date_trunc('month', '${date}'::date)`;
  } else if (type == "year") {
    date_trunc = `WHERE date_trunc('year', event_time) = date_trunc('year', '${date}'::date)`;
  }
  let q = `SELECT * FROM (${query}) AS activity_log ${date_trunc} ORDER BY event_time DESC`;
  // global.db.query(q, (err, result) => {
  //   // console.log(result.rows);
  //   if (err) return res.status(400).json({ msg: err });
  //   if (result.rows.length == 0) return res.status(201).json([{}]);
  //   return res.status(200).json(result.rows);
  // });

  const page = req.query.page || 1;
  const offsetItems = (page - 1) * ITEMS_PER_PAGE;
  let totalPages;
  try {
    const result = await global.db.query(q);
    totalPages = Math.ceil(result.rows.length / ITEMS_PER_PAGE);
    q += ` LIMIT ${ITEMS_PER_PAGE} OFFSET ${offsetItems}`;
    const logs = await global.db.query(q);
    return res.status(200).json({ logs: logs.rows, totalPages });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ msg: err });
  }
};

const createActivityCSV = async (req, res, next) => {
  // console.log(req.body);
  generateCSV(req.body).then((buffer) => {
    res.set({
      "Content-Type": "text/csv",
    });
    return res.status(200).send(buffer);
  });
};

module.exports = {
  getEventtHistory,
  createActivityCSV,
  getEventtHistoryDate,
};

// EVERYTHING QUERY
// SELECT btrim(((activity.value -> 'name'::text)::character varying)::text, '"'::text) AS user_name,
// 'Request'::text AS type,
// to_timestamp(substr(((activity.value -> 'date'::text)::character varying)::text, 2, length(((activity.value -> 'date'::text)::character varying)::text) - 5), 'dd-mm-yyyy HH24:MI'::text) AS event_time,
// btrim(concat(activity.value -> 'activity'::text), '"'::text) AS description
// FROM keppel.request,
// LATERAL jsonb_array_elements(request.activity_log) activity(value)
// UNION ALL
// SELECT concat(ii.first_name, ' ', ii.last_name) AS user_name,
// 'Login events'::text AS type,
// to_timestamp(substr(i.datetime::text, 1, length(i.datetime::text) - 3), 'mm-dd-yyyy HH24:MI'::text) AS event_time,
// i.activity AS description
// FROM keppel.loginevents i,
// keppel.users ii
// WHERE i.userid = ii.user_id AND to_date(substr(i.datetime::text, 1, length(i.datetime::text) - 3), 'mm-dd-yyyy HH24:MI'::text) > to_char(now(), 'yyyy-mm-01'::text)::date
// GROUP BY (to_timestamp(substr(i.datetime::text, 1, length(i.datetime::text) - 3), 'mm-dd-yyyy HH24:MI'::text)), ii.user_name, i.activity, ii.first_name, ii.last_name
// UNION ALL
// SELECT btrim((((cm.activity_log -> 0) -> 'name'::text)::character varying)::text, '"'::text) AS user_name,
// 'Checklist'::text AS type,
// to_timestamp(substr((((cm.activity_log -> 0) -> 'date'::text)::character varying)::text, 2, length((((cm.activity_log -> 0) -> 'date'::text)::character varying)::text) - 5), 'dd-mm-yyyy HH24:MI'::text) AS event_time,
// btrim(concat((cm.activity_log -> 0) -> 'activity'::text), '"'::text) AS description
// FROM keppel.checklist_master cm
// GROUP BY (to_timestamp(substr((((cm.activity_log -> 0) -> 'date'::text)::character varying)::text, 2, length((((cm.activity_log -> 0) -> 'date'::text)::character varying)::text) - 5), 'dd-mm-yyyy HH24:MI'::text)), (btrim((((cm.activity_log -> 0) -> 'name'::text)::character varying)::text, '"'::text)), (btrim(concat((cm.activity_log -> 0) -> 'activity'::text), '"'::text)), cm.created_date
// UNION ALL
// SELECT btrim((((i.activity_log -> 0) -> 'name'::text)::character varying)::text, '"'::text) AS user_name,
// 'Assets'::text AS type,
// to_timestamp(substr((((i.activity_log -> 0) -> 'date'::text)::character varying)::text, 2, length((((i.activity_log -> 0) -> 'date'::text)::character varying)::text) - 5), 'dd-mm-yyyy HH24:MI'::text) AS event_time,
// btrim(concat((i.activity_log -> 0) -> 'activity'::text), '"'::text) AS description
// FROM keppel.plant_system_assets i
// WHERE jsonb_array_length(i.activity_log) > 0
// GROUP BY (to_timestamp(substr((((i.activity_log -> 0) -> 'date'::text)::character varying)::text, 2, length((((i.activity_log -> 0) -> 'date'::text)::character varying)::text) - 5), 'dd-mm-yyyy HH24:MI'::text)), (btrim((((i.activity_log -> 0) -> 'name'::text)::character varying)::text, '"'::text)), (btrim(concat((i.activity_log -> 0) -> 'activity'::text), '"'::text)), i.created_date
// UNION ALL
// SELECT btrim(((activity.value -> 'name'::text)::character varying)::text, '"'::text) AS user_name,
// 'Master'::text AS type,
// to_timestamp(substr(((activity.value -> 'date'::text)::character varying)::text, 2, length(((activity.value -> 'date'::text)::character varying)::text) - 5), 'dd-mm-yyyy HH24:MI'::text) AS event_time,
// btrim(concat(activity.value -> 'activity'::text), '"'::text) AS description
// FROM keppel.plant_master,
// LATERAL jsonb_array_elements(plant_master.activity_log) activity(value)
// UNION ALL
// SELECT btrim(((activity.value -> 'name'::text)::character varying)::text, '"'::text) AS user_name,
// 'Master'::text AS type,
// to_timestamp(substr(((activity.value -> 'date'::text)::character varying)::text, 2, length(((activity.value -> 'date'::text)::character varying)::text) - 5), 'dd-mm-yyyy HH24:MI'::text) AS event_time,
// btrim(concat(activity.value -> 'activity'::text), '"'::text) AS description
// FROM keppel.system_master,
// LATERAL jsonb_array_elements(system_master.activity_log) activity(value)
// UNION ALL
// SELECT btrim(((activity.value -> 'name'::text)::character varying)::text, '"'::text) AS user_name,
// 'Master'::text AS type,
// to_timestamp(substr(((activity.value -> 'date'::text)::character varying)::text, 2, length(((activity.value -> 'date'::text)::character varying)::text) - 5), 'dd-mm-yyyy HH24:MI'::text) AS event_time,
// btrim(concat(activity.value -> 'activity'::text), '"'::text) AS description
// FROM keppel.asset_type,
// LATERAL jsonb_array_elements(asset_type.activity_log) activity(value)
// UNION ALL
// SELECT btrim(((activity.value -> 'name'::text)::character varying)::text, '"'::text) AS user_name,
// 'Master'::text AS type,
// to_timestamp(substr(((activity.value -> 'date'::text)::character varying)::text, 2, length(((activity.value -> 'date'::text)::character varying)::text) - 5), 'dd-mm-yyyy HH24:MI'::text) AS event_time,
// btrim(concat(activity.value -> 'activity'::text), '"'::text) AS description
// FROM keppel.fault_types,
// LATERAL jsonb_array_elements(fault_types.activity_log) activity(value);
