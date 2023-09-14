enum Role {
    Admin = 1,
    Manager = 2,
    Engineer = 3,
    Specialist = 4,
};

enum Action {
    Approve = "approve",
    Reject = "reject",
    ApproveReassign = "reassignApprove",
    RejectReassign = "reassignReject",
};

enum Checklist_Status {
    Closed = 0,
    Pending = 1,
    Assigned = 2,
    Reassigned = 3,
    Work_Done = 4,
    Approved = 5,
    Rejected = 6,
    Cancelled = 7,
    Reassignment_Request = 8,
    Pending_Cancellation = 9,
    Rejected_Cancellation = 10,
    Approved_Cancellation = 11,
};

enum PermissionsRoles {
    Admin = 'admin',
    Manager = 'manager',
    Engineer = 'engineer',
    Specialist = 'specialist',
    Can_Assign_Request_Ticket = 'canAssignRequestTicket',
    Can_Manage_Request_Ticket = 'canManageRequestTicket',
    Create_Checklist = 'createChecklist',
    Assign_Checklist = 'assignChecklist',
    Manage_Checklist = 'manageChecklist',
    Can_Create_Request_Ticket = 'canCreateRequestTicket',
    Can_View_Request_Ticket = 'canViewRequestTicket',
    Can_Complete_Request_Ticket = 'canCompleteRequestTicket',
    Can_View_Request_History = 'canViewRequestHistory',
    Can_Create_Corrective_Request_Ticket = 'canCreateCorrectiveRequestTicket',
    View_Checklist = 'viewChecklist',
    Complete_Checklist = 'completeChecklist',
    View_Checklist_History = 'viewChecklistHistory',
  };

export {
    Role,
    Action,
    Checklist_Status,
    PermissionsRoles
}