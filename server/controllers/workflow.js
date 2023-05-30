const db = require("../../db");

const listWorkflow = async (req, res, next) => {
  const sql = `SELECT * FROM keppel.workflow`;

  db.query(
    sql,
    (err, result) => {
      if (err) return res.status(500).json({ errormsg: err });
      res.status(200).json(result.rows);
    }
  );
}

const runWorkflowRequest = async (req, res, next) => {

  const sql = `UPDATE 
      keppel.request a
    SET 
      assigned_user_id = b.user_id
    FROM 
      keppel.workflow b
    WHERE 
      a.fault_id = b.fault_id
      AND a.plant_id = b.plant_id
      AND b."isActive" = 1
       AND (a.assigned_user_id is null or a.assigned_user_id::text = '');
    `;

  db.query(
    sql,
    (err, result) => {
      if (err) return res.status(500).json({ errormsg: err });
      res.status(200).json(result.rows);
    }
  );
}

const create = async (req, res, next) => {
  const { type, plant, faultType, action, assignTo, sendEmail } = req.body;

  let isAssignTo = 0;
  let isSendEmail = 0;
  const activity_log = JSON.stringify('');

  console.log('body', req.body)

  if(action === "assign-to") {
    isAssignTo = 1;
  } else if(action === "send-email") { 
    isSendEmail = 1;
  }

  const sql = `INSERT INTO keppel.workflow(
    type, fault_id, plant_id, is_assign_to, is_send_email, is_active, user_id, user_email, activity_log, created_at
  ) VALUES (
    $1,$2,$3,$4,$5,$6,$7,$8,$9,now()
  )`;

  db.query(
    sql,
    [
      type,
      plant,
      faultType,
      isAssignTo,
      isSendEmail,
      1,
      assignTo,
      sendEmail,
      activity_log
    ],
    (err, result) => {
      if (err) return res.status(500).json({ errormsg: err });
      res.status(200).json(result.rows);
    }
  );
}

module.exports = {
  listWorkflow,
  runWorkflowRequest,
  create
}