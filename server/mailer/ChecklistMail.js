const Mail = require('./Mail');

class ChecklistMail extends Mail {

    constructor(recipient, subject, content, checklist, carbon_copy = null) {
        // const assetLists = checklist.assets.split(', ')
        // const assetElements = assetLists.length > 0 ? 
        //     `
        //         ${assetLists.map(asset => {
        //             return `
        //                 <ul>${asset}</ul>
        //             `
        //         })}
        //     ` : `NIL`;
        const emailContent = `
            <strong>Checklist Details: </strong></br>
            <table>
                <tbody>
                    <tr>
                        <td>ID:</td>
                        <td>${checklist.id}</td>
                    </tr>
                    <tr>
                        <td>Name:</td>
                        <td>${checklist.name}</td>
                    </tr>
                    <tr>
                        <td>Description:</td>
                        <td>${checklist.description}</td>
                    </tr>
                    <tr>
                        <td>Plant:</td>
                        <td>${checklist.plant}</td>
                    </tr>
                    <tr>
                        <td>Assets:</td>
                        <td>
                            ${checklist.assets}
                        </td>
                    </tr>
                    <tr>
                        <td>Assigned To:</td>
                        <td>${checklist.assignedTo}</td>
                    </tr>
                    <tr>
                        <td>Sign Off:</td>
                        <td>${checklist.signoff}</td>
                    </tr>
                    <tr>
                        <td>Created By:</td>
                        <td>${checklist.createdBy}</td>
                    </tr>
                    <tr>
                        <td>Created On:</td>
                        <td>${checklist.date}</td>
                    </tr>
                    <tr>
                        <td>Status:</td>
                        <td>${checklist.status}</td>
                    </tr>
                </tbody>
            </table></br>
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

class CreateChecklistMail extends ChecklistMail {
    constructor(recipient, checklist, content = "", carbon_copy = null) {
        const emailContent = content;
        super(recipient, "New Checklist Created", emailContent, checklist, carbon_copy);
    }; 
};

class CompleteChecklistMail extends ChecklistMail {
    constructor(recipient, checklist, content = "", carbon_copy = null) {
        const emailContent = content;
        super(recipient, "Checklist Completed", emailContent, checklist, carbon_copy);
    }; 
};


module.exports = { 
    ApproveChecklistMail, 
    RejectChecklistMail, 
    ReminderChecklistMail, 
    CreateChecklistMail,
    CompleteChecklistMail
};