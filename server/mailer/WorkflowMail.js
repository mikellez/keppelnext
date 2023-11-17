const Mail = require("./Mail");

class WorkflowMail extends Mail {
  constructor(recipient, subject, content, workflow, carbon_copy = null) {
    // console.log(workflow)
    const emailContent = `
            Dear ${workflow.user_name},</br></br>
            ${content}</br>
        `;
    super(recipient, subject, emailContent, carbon_copy);
  }
}

class AutoSendWorkflowMail extends WorkflowMail {
  constructor(recipient, workflow, carbon_copy = null) {
    const emailContent = `
          A fault request with type <strong>${
            workflow.fault_type
          }</strong> has been created at location <strong>${
      workflow.plant_name
    }</strong> on <strong>${
      //workflow.created_at
      moment(workflow.created_at).format(
        "MMMM Do YYYY, h:mm:ss a"
      )
    }</strong>.<br></br><strong>ID:</strong> ${
      workflow.request_id
    }<br/><strong>Fault Description:</strong> ${
      workflow.fault_description ?? "NIL"
    }
        `;
    // console.log(workflow)
    super(
      recipient,
      "Fault Request Created",
      emailContent,
      workflow,
      carbon_copy
    );
  }
}

module.exports = {
  AutoSendWorkflowMail,
};
