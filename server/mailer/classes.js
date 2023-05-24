const Mail = require('./Mail');

class ApproveChecklistMail extends Mail {
    constructor(recipient, options, carbon_copy = null) {
        const content = `
            <strong>Approved</strong> Checklist ${options.checklist_id}
        `;
        super(recipient, "Checklist Approved", content, carbon_copy);
    };
};

class RejectChecklistMail extends Mail {
    constructor(recipient, options, carbon_copy = null) {
        const content = `
            <strong>Rejected</strong> Checklist ${options.checklist_id}
        `;
        super(recipient, "Checklist Rejected", content, carbon_copy);
    };
};

class ReminderChecklistMail extends Mail {
    constructor(recipient, options, carbon_copy = null) {
        const content = `
            <strong>Reminder</strong> Checklist ${options.checklist_id}
        `;
        super(recipient, "Reminder", content, carbon_copy);
    };
};

class CreatedChecklistMail extends Mail {
    constructor(recipient, options, carbon_copy = null) {
        const content = `
            <strong>Details: </strong></br>
            <p>ID: ${options.id}</p></br>
            <p>Name: ${options.name}</p></br>
            <p>Description: ${options.description}</p></br>
            <p>Plant: ${options.plant}</p></br>
            <p>Assets: ${options.assets}</p></br>
            <p>Assigned To: ${options.assignedTo}</p></br>
            <p>Sign Off: ${options.signoff}</p></br>
            <p>Created By: ${options.createdBy}</p></br>
            <p>Created On: ${options.date}</p></br>
        `;
        super(recipient, "New Checklist", content, carbon_copy);
    }; 
};

module.exports = { 
    ApproveChecklistMail, 
    RejectChecklistMail, 
    ReminderChecklistMail, 
    CreatedChecklistMail 
};