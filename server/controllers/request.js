const db = require("../../db");

const getRequests = async (req, res, next) => {
    db.query(`SELECT r.request_id , ft.fault_type AS fault_name, pm.plant_name,pm.plant_id,
    rt.request, ro.role_name, sc.status,r.fault_description, rt.request as request_type,
    pri.priority,
    CASE 
      WHEN (concat( concat(req_u.first_name ,' '), req_u.last_name) = ' ') THEN r.guestfullname
      ELSE concat( concat(req_u.first_name ,' '), req_u.last_name )
    END AS fullname,
    r.created_date,tmp1.asset_name, r.uploadfilemimetype , r.complete_comments,
    concat( concat(au.first_name,' '), au.last_name) as assigned_user_name, r.associatedrequestid
    , r.requesthistory, r.rejection_comments
  FROM    
      keppel.users u
      JOIN keppel.user_access ua on u.user_id = ua.user_id
      join keppel.request r on ua.allocatedplantids like concat(concat('%',r.plant_id::text) , '%')
    left join keppel.users req_u on r.user_id = req_u.user_id
    left join keppel.fault_types ft on r.fault_id = ft.fault_id
    left join keppel.plant_master pm on pm.plant_id = r.plant_id 
    left join keppel.request_type rt on rt.req_id = r.req_id
    left join keppel.priority pri on pri.p_id = r.priority_id
    left join keppel.role ro on ro.role_id = r.role_id
    left join keppel.status_pm sc on sc.status_id = r.status_id
    left join keppel.users au on au.user_id = r.assigned_user_id
    left join (select psa_id ,  concat( system_asset , ' | ' , plant_asset_instrument )   as asset_name 
                  from  keppel.system_assets   as t1 ,keppel.plant_system_assets as t2
                  where t1.system_asset_id = t2.system_asset_id_lvl4) tmp1 on tmp1.psa_id = r.psa_id
  where ua.user_id = 17 and ( 
    (ua.role_name = 'Operation Specialist' and  r.assigned_user_id = u.user_id and sc.status !='PENDING') or
        (sc.status ='PENDING') or
        (ua.role_name != 'Operation Specialist')
    )
  order by r.created_date desc, r.status_id desc;`, (err, result) => {
        if(err) return res.status(500).json({msg: err});

        res.status(200).json(result.rows);
    });
}

module.exports = {
    getRequests
}