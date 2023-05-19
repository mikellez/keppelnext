const Mail = require('./Mail');

class ApproveMail extends Mail {
    constructor(recipient, subject, options) {
        const content = `
            <strong>Approved</strong> Checklist ${options.checklist_id}
        `;
        super(recipient, subject, content);
    };
};

class RejectMail extends Mail {
    constructor(recipient, subject, options) {
        const content = `
            <strong>Rejected</strong> Checklist ${options.checklist_id}
        `;
        super(recipient, subject, content);
    };
};

class ReminderMail extends Mail {
    constructor(recipient, subject, options) {
        const content = `
            <strong>Reminder</strong> Checklist ${options.checklist_id}
        `;
        super(recipient, subject, content);
    };
};

module.exports = { ApproveMail, RejectMail, ReminderMail };