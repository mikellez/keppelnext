const Mail = require('./Mail');

class WorkflowMail extends Mail {

    constructor(recipient, subject, content, workflow, carbon_copy = null) {
      console.log(workflow)
        const emailContent = `
            Dear ${workflow.user_name},</br></br>
            ${content}</br>
        `;
        super(recipient, subject, emailContent, carbon_copy);
    };
};

class AutoSendWorkflowMail extends WorkflowMail {
  
    constructor(recipient, workflow, carbon_copy = null) {
        const emailContent = `
          A fault request with type ${workflow.fault_type} has been created at location ${workflow.plant_name} on ${workflow.created_at}.<br></br><strong>Fault Description:</strong> ${workflow.fault_description ?? 'NIL'}
        `;
        console.log(workflow)
        super(recipient, "Fault Request Created", emailContent, workflow, carbon_copy);
    };
}

module.exports = { 
  AutoSendWorkflowMail, 
};