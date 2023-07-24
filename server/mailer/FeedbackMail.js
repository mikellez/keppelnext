const Mail = require("./Mail");

class FeedbackMail extends Mail {
  constructor(recipient, subject, content, feedback, carbon_copy = null) {
    // console.log(feedback);
    const emailContent = `
            Dear ${feedback.name},<br></br>
            ${content}<br/>
        `;
    super(recipient, subject, emailContent, carbon_copy);
  }
}

class CreateFeedbackMail extends FeedbackMail {
  constructor(recipient, feedback, carbon_copy = null) {
    const emailContent = `
          Your feedback has been received on <strong>${
            feedback.created_date
          }</strong>.<br></br><br/><strong>Feedback Description:</strong> ${
      feedback.description ?? "NIL"
    }
        `;
    // console.log(feedback);
    super(recipient, "Feedback received", emailContent, feedback, carbon_copy);
  }
}

class AssignFeedbackMail extends FeedbackMail {
  constructor(recipient, feedback, carbon_copy = null) {
    const emailContent = `
    The feedback on <strong>${
      feedback.plant_name
    }</strong> has been assigned to you on <strong>${
      feedback.created_date
    }</strong>.<br></br><strong>Feedback ID:</strong> ${
      feedback.id
    }<br/><br/><strong>Feedback Description:</strong> ${
      feedback.description ?? "NIL"
    }
        `;
    // console.log(feedback);
    super(recipient, "Feedback Assigned", emailContent, feedback, carbon_copy);
  }
}

class CompletedFeedbackMail extends FeedbackMail {
  constructor(recipient, feedback, carbon_copy = null) {
    const emailContent = `
          The feedback on <strong>${
            feedback.plant_name
          }</strong> has been implemented on <strong>${
      feedback.completed_date
    }</strong>.<br></br><strong>Feedback ID:</strong> ${
      feedback.id
    }<br/><strong>Feedback Remarks:</strong> ${feedback.remarks ?? "NIL"}
        `;
    // console.log(feedback);
    super(recipient, "Feedback Completed", emailContent, feedback, carbon_copy);
  }
}

module.exports = {
  CreateFeedbackMail,
  CompletedFeedbackMail,
  AssignFeedbackMail,
};
