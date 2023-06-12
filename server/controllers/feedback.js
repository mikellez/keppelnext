const db = require("../../db");
const { generateCSV } = require("../csvGenerator");
const moment = require("moment");

/** Express router providing user related routes
 * @module controllers/request
 * @requires db
 */

const fetchAllChecklistQuery = `
SELECT 
    f.feedback_id, 
    f.plant_loc, 
    f.plant_id, 
    f.status_id,
    f.activity_log,
    concat( concat(createdU.first_name ,' '), createdU.last_name ) AS createdByUser,
    concat( concat(assignU.first_name ,' '), assignU.last_name ) AS assigneduser,
    pm.plant_name,
    pm.plant_id,
    f.created_date,
    f.assigned_user_id,
    st.status
FROM 
    keppel.users u
    JOIN keppel.user_access ua ON u.user_id = ua.user_id
    JOIN keppel.feedback f  on ua.allocatedplantids LIKE concat(concat('%',f.plant_id::text), '%')
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
    LEFT JOIN keppel.users assignU ON assignU.user_id = f.assigned_user_id
    LEFT JOIN keppel.users createdU ON createdU.user_id = cl.created_user_id
    LEFT JOIN keppel.users signoff ON signoff.user_id = cl.signoff_user_id
    LEFT JOIN keppel.plant_master pm ON pm.plant_id = cl.plant_id
    JOIN keppel.status_cm st ON st.status_id = cl.status_id	
`;

const ITEMS_PER_PAGE = 10;
function fetchFeedbackQuery(status_query, role_id, user_id, page) {
  const offsetItems = (page - 1) * ITEMS_PER_PAGE;
  // console.log(role_id)
  let userCond = "";
  if (role_id == 3) {
    userCond = `AND u.user_id = ${user_id}`;
  }

  return role_id === 1 || role_id === 2 || role_id === 3
    ? `SELECT r.request_id , ft.fault_type AS fault_name, pm.plant_name,pm.plant_id,
      ro.role_name, sc.status,r.fault_description, rt.request AS request_type,
        pri.priority, 
        CASE 
            WHEN (concat( concat(req_u.first_name ,' '), req_u.last_name) = ' ') THEN r.guestfullname
            ELSE concat( concat(req_u.first_name ,' '), req_u.last_name )
        END AS fullname,
        r.created_date,tmp1.asset_name, r.uploadfilemimetype, r.completedfilemimetype, r.uploaded_file, r.completion_file,
        r.complete_comments,
        concat( concat(au.first_name,' '), au.last_name) AS assigned_user_name, r.associatedrequestid
        , r.activity_log, r.rejection_comments, r.status_id, r.psa_id, r.fault_id
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
      ${userCond}
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
        ro.role_name, sc.status,r.fault_description, rt.request AS request_type,
        pri.priority, 
        CASE 
            WHEN (concat( concat(req_u.first_name ,' '), req_u.last_name) = ' ') THEN r.guestfullname
            ELSE concat( concat(req_u.first_name ,' '), req_u.last_name )
        END AS fullname,
        r.created_date,tmp1.asset_name, r.uploadfilemimetype, r.completedfilemimetype, r.uploaded_file, r.completion_file,
        r.complete_comments,
        concat( concat(au.first_name,' '), au.last_name) AS assigned_user_name, r.associatedrequestid
        , r.activity_log, r.rejection_comments, r.status_id, r.psa_id, r.fault_id
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
