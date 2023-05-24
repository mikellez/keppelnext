const Mail = require('./Mail');

class ChecklistMail extends Mail {

    constructor(recipient, subject, content, checklist, carbon_copy = null) {
        const emailContent = `
            <strong>Details: </strong></br>
            <p>ID: ${checklist.id}</p></br>
            <p>Name: ${checklist.name}</p></br>
            <p>Description: ${checklist.description}</p></br>
            <p>Plant: ${checklist.plant}</p></br>
            <p>Assets: ${checklist.assets}</p></br>
            <p>Assigned To: ${checklist.assignedTo}</p></br>
            <p>Sign Off: ${checklist.signoff}</p></br>
            <p>Created By: ${checklist.createdBy}</p></br>
            <p>Created On: ${checklist.date}</p></br>
            <p>Status: ${checklist.status}</p></br>
            ${content}</br>
        `;
        super(recipient, subject, emailContent, carbon_copy);
    };

};

class ApproveChecklistMail extends ChecklistMail {
    constructor(recipient, checklist, content = "", carbon_copy = null) {
        const emailContent = content;
        super(recipient, "Checklist Approved", emailContent, checklist, carbon_copy);
    }; 
};

class RejectChecklistMail extends ChecklistMail {
    constructor(recipient, checklist, content = "", carbon_copy = null) {
        const emailContent = content;
        super(recipient, "Checklist Rejected", emailContent, checklist, carbon_copy);
    }; 
};

class ReminderChecklistMail extends ChecklistMail {
    constructor(recipient, checklist, content = "", carbon_copy = null) {
        const emailContent = content;
        super(recipient, "Reminder for Checklist", emailContent, checklist, carbon_copy);
    }; 
};

class CreatedChecklistMail extends ChecklistMail {
    constructor(recipient, checklist, content = "", carbon_copy = null) {
        const emailContent = content;
        super(recipient, "New Checklist", emailContent, checklist, carbon_copy);
    }; 
};


module.exports = { 
    ApproveChecklistMail, 
    RejectChecklistMail, 
    ReminderChecklistMail, 
    CreatedChecklistMail 
};