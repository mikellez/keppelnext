const db = require("../../db");
const { generateCSV } = require("../csvGenerator");

const getEventtHistory = async (req, res, next) => {
    db.query(`SELECT user_name,type,event_time,description FROM keppel.activity_log;
        `, (err, result) => {
        console.log(result.rows);
        if (err) return res.status(400).json({ msg: err });
        if (result.rows.length == 0) return res.status(201).json({ msg: "No assets added" });
        return res.status(200).json(result.rows);
    });
};

const createActivityCSV = async (req, res, next) => {
    db.query(`SELECT keppel.events.user_id, description, event_time 
        FROM keppel.events, keppel.users 
        WHERE keppel.events.user_id = keppel.users.user_id
        `, (err, result) => {
        if (err) return res.status(400).json({ msg: err });
        if (result.rows.length == 0) return res.status(201).json({ msg: "No assets added" });
        
        generateCSV(result.rows).then(buffer => {
            res.set({
                'Content-Type': 'text/csv',
            })
            return res.status(200).send(buffer);
        })
        .catch(err => {
            return res.status(500).send("Error in generating csv file");
        })      
  });
}



module.exports = {
    getEventtHistory,
    createActivityCSV,
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