const db = require("../../db");
const { AutoSendWorkflowMail } = require("../mailer/WorkflowMail");

const ITEMS_PER_PAGE = 10;

const listWorkflow = async (req, res, next) => {
  const sql = `SELECT 
      w.id, w.type, w.fault_id, w.plant_id, w.is_assign_to, w.is_send_email, w.is_active, w.user_id, w.created_at,
      u.user_name, u.user_email, p.plant_name, ft.fault_type
    FROM 
      keppel.workflow w
      JOIN keppel.user_access u ON w.user_id = u.user_id
      JOIN keppel.plant_master p ON w.plant_id = p.plant_id
      JOIN keppel.fault_types ft ON w.fault_id = ft.fault_id
      `;

  const page = req.query.page || 1;
  const offsetItems = (+page - 1) * ITEMS_PER_PAGE;
  const totalRows = await global.db.query(sql);
  const totalPages = Math.ceil(+totalRows.rowCount / ITEMS_PER_PAGE);

  const query = sql + ` LIMIT ${ITEMS_PER_PAGE} OFFSET ${offsetItems}`;

  global.db.query(query, (err, result) => {
    if (err) return res.status(500).json({ errormsg: err });
    res.status(200).json({ rows: result.rows, total: totalPages });
  });
};

const runWorkflowAssign = async (req, res, next) => {
  const sql = `
    WITH updated_ids AS (
      UPDATE keppel.request AS a
      SET 
        assigned_user_id = subquery.user_id,
        status_id = 2
      FROM (
        SELECT  
          rw.id, a.request_id, b.user_id
        FROM 
          keppel.request_workflow AS rw 
        JOIN 
          keppel.request AS a ON a.request_id = rw.request_id 
        JOIN 
          keppel.workflow AS b ON a.fault_id = b.fault_id AND a.plant_id = b.plant_id
        WHERE 
          rw.is_active = 1
          AND rw.set_assign = 1
          AND rw.done = 0
          AND b.is_assign_to = 1
          AND (a.assigned_user_id IS NULL OR a.assigned_user_id::text = '')
      ) AS subquery
      WHERE 
        a.request_id = subquery.request_id
      RETURNING subquery.id, subquery.request_id
    )
    UPDATE keppel.request_workflow AS rw
    SET done = 1
    FROM updated_ids
    WHERE rw.request_id = updated_ids.request_id
      AND rw.is_active = 1
      AND rw.set_assign = 1
      AND rw.done = 0;

  `;

  global.db.query(sql, (err, result) => {
    if (err) return res.status(500).json({ errormsg: err });
    res.status(200).json(result.rows);
  });
};

const autoSendEmail = (workflow) => {
  //TODO: construct email content, and send email
  for (let i = 0; i < workflow.length; i++) {
    const mail = new AutoSendWorkflowMail([workflow[i].user_email], {
      request_id: workflow[i].request_id,
      user_name: workflow[i].user_name,
      fault_type: workflow[i].fault_type,
      fault_description: workflow[i].fault_description,
      plant_name: workflow[i].plant_name,
      created_at: workflow[i].created_date,
    });

    mail.send();
  }
};

const runWorkflowEmail = async (req, res, next) => {
  //TODO: list of emails to send
  const sql = `
    WITH rwtemp AS (
        SELECT  
          a.request_id, b.user_id, rw.id, ft.fault_type, a.fault_description, p.plant_name, u.user_name, u.user_email, a.created_date
        FROM 
          keppel.request_workflow AS rw 
        JOIN 
          keppel.request AS a ON a.request_id = rw.request_id 
        JOIN 
          keppel.workflow AS b ON a.fault_id = b.fault_id AND a.plant_id = b.plant_id
        JOIN 
          keppel.user_access u ON b.user_id = u.user_id
        JOIN 
          keppel.plant_master p ON b.plant_id = p.plant_id
        JOIN 
          keppel.fault_types ft ON b.fault_id = ft.fault_id
        WHERE 
          rw.is_active = 1
          AND rw.set_email = 1
          AND rw.done = 0
          AND b.is_send_email = 1 
    )
    UPDATE keppel.request_workflow AS rw
    SET done = 1
    FROM rwtemp
    WHERE rw.id = rwtemp.id
    RETURNING rwtemp.id, rwtemp.request_id, rwtemp.user_id, rwtemp.fault_type, rwtemp.fault_description, rwtemp.plant_name, rwtemp.user_name, rwtemp.user_email, rwtemp.created_date;

  `;

  global.db.query(sql, (err, result) => {
    if (err) return res.status(500).json({ errormsg: err });

    autoSendEmail(result.rows);

    res.status(200).json(result.rows);
  });
};

const createWorkflow = async (req, res, next) => {
  const { type, plant, faultType, action, assignTo, sendEmail } = req.body;

  let isAssignTo = 0;
  let isSendEmail = 0;
  let user_id = 0;
  const activity_log = JSON.stringify("");

  // console.log("body", req.body);

  if (action === "assign-to") {
    isAssignTo = 1;
    user_id = assignTo;
  } else if (action === "send-email") {
    isSendEmail = 1;
    user_id = sendEmail;
  }

  const sql = `INSERT INTO keppel.workflow(
    type, fault_id, plant_id, is_assign_to, is_send_email, is_active, user_id, activity_log, created_at
  ) VALUES (
    $1,$2,$3,$4,$5,$6,$7,$8,now()
  )`;

  global.db.query(
    sql,
    [type, plant, faultType, isAssignTo, isSendEmail, 1, user_id, activity_log],
    (err, result) => {
      if (err) return res.status(500).json({ errormsg: err });
      res.status(200).json(result.rows);
    }
  );
};

const updateWorkflow = async (req, res, next) => {
  const { id } = req.params;
  const { is_active } = req.body;

  const sql = `UPDATE keppel.workflow SET is_active = $1 WHERE id = $2`;

  global.db.query(sql, [+is_active, id], (err, result) => {
    if (err) return res.status(500).json({ errormsg: err });
    res.status(200).json(result.rows);
  });
};

const deleteWorkflow = async (req, res, next) => {
  const { id } = req.params;

  const sql = `DELETE FROM keppel.workflow WHERE id = $1`;

  global.db.query(sql, [id], (err, result) => {
    if (err) return res.status(500).json({ errormsg: err });
    res.status(200).json(result.rows);
  });
};

module.exports = {
  listWorkflow,
  runWorkflowAssign,
  runWorkflowEmail,
  createWorkflow,
  updateWorkflow,
  deleteWorkflow,
};
