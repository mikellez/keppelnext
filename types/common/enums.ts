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
    admin = 'admin',
    manager = 'manager',
    engineer = 'engineer',
    specialist = 'specialist',
    canAssignRequestTicket = 'canAssignRequestTicket',
    canManageRequestTicket = 'canManageRequestTicket',
    createChecklist = 'createChecklist',
    assignChecklist = 'assignChecklist',
    manageChecklist = 'manageChecklist',
    canCreateRequestTicket = 'canCreateRequestTicket',
    canViewRequestTicket = 'canViewRequestTicket',
    canCompleteRequestTicket = 'canCompleteRequestTicket',
    canViewRequestHistory = 'canViewRequestHistory',
    canCreateCorrectiveRequestTicket = 'canCreateCorrectiveRequestTicket',
    viewChecklist = 'viewChecklist',
    completeChecklist = 'completeChecklist',
    viewChecklistHistory = 'viewChecklistHistory',
  };

export {
    Role,
    Action,
    Checklist_Status,
    PermissionsRoles
}