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

enum Request_Status {
    Pending = 1,
    Assigned = 2,
    Completed = 3,
    Approved = 4,
    Rejected = 5,
    Cancelled = 6
}

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
    CanEditUserManagement = 'canEditUserManagement',
    CanDeleteUserManagement = 'canDeleteUserManagement',
    CanImpersonateUser = 'canImpersonateUser',
    Engineer = 'engineer',
    CanViewActivityLog = 'canViewActivityLog',
    CanViewWorkflow = 'canViewWorkflow',
    CanViewMaster = 'canViewMaster',
    CanCreateWorkflow = 'canCreateWorkflow',
    CanCreateMaster = 'canCreateMaster',
    CanEditMaster = 'canEditMaster',
    CanViewUserManagement = 'canViewUserManagement',
    CanDeleteMaster = 'canDeleteMaster',
    ExcludeCompleteRequestTicket = 'excludeCompleteRequestTicket',
    CanAccessAllPlants = 'canAccessAllPlants',
    Specialist = 'specialist',
    CanAssignRequestTicket = 'canAssignRequestTicket',
    CanManageRequestTicket = 'canManageRequestTicket',
    CanCreateAsset = 'canCreateAsset',
    CanEditAsset = 'canEditAsset',
    CanDeleteAsset = 'canDeleteAsset',
    CanAssignChecklist = 'canAssignChecklist',
    CanCreateChecklist = 'canCreateChecklist',
    CanManageChecklist = 'canManageChecklist',
    CanDeleteLogbookEntry = 'canDeleteLogbookEntry',
    CanAssignFeedback = 'canAssignFeedback',
    CanManageFeedback = 'canManageFeedback',
    CanCreateLicense = 'canCreateLicense',
    CanDeleteLicense = 'canDeleteLicense',
    CanAcquireLicense = 'canAcquireLicense',
    CanRenewLicense = 'canRenewLicense',
    CanEditLicense = 'canEditLicense',
    CanViewLicenseHistory = 'canViewLicenseHistory',
    CanEditChangeOfParts = 'canEditChangeOfParts',
    CanCreateSchedule = 'canCreateSchedule',
    CanManageSchedule = 'canManageSchedule',
    CanViewScheduleHistory = 'canViewScheduleHistory',
    CanViewDashboardTotal = 'canViewDashboardTotal',
    CanViewDashboardLicense = 'canViewDashboardLicense',
    CanViewDashboardFeedback = 'canViewDashboardFeedback',
    CanViewDashboardChangeOfParts = 'canViewDashboardChangeOfParts',
    CanCreateRequestTicket = 'canCreateRequestTicket',
    CanViewRequestTicket = 'canViewRequestTicket',
    CanCompleteRequestTicket = 'canCompleteRequestTicket',
    CanViewRequestHistory = 'canViewRequestHistory',
    CanCreateCorrectiveRequestTicket = 'canCreateCorrectiveRequestTicket',
    CanViewAsset = 'canViewAsset',
    CanCompleteChecklist = 'canCompleteChecklist',
    CanViewChecklist = 'canViewChecklist',
    CanViewChecklistHistory = 'canViewChecklistHistory',
    CanViewLogbookEntry = 'canViewLogbookEntry',
    CanCreateLogbookEntry = 'canCreateLogbookEntry',
    CanCreateFeedback = 'canCreateFeedback',
    CanViewFeedbackHistory = 'canViewFeedbackHistory',
    CanViewFeedback = 'canViewFeedback',
    CanViewLicense = 'canViewLicense',
    CanCompleteFeedback = 'canCompleteFeedback',
    CanGenerateQRCode = 'canGenerateQRCode',
    CanCreateChangeOfParts = 'canCreateChangeOfParts',
    CanCompleteChangeOfParts = 'canCompleteChangeOfParts',
    CanViewSchedule = 'canViewSchedule',
    CanViewChangeOfParts = 'canViewChangeOfParts',
    CanViewDashboardRequestTicket = 'canViewDashboardRequestTicket',
    CanViewDashboardChecklist = 'canViewDashboardChecklist',
  };

export {
    Role,
    Action,
    Checklist_Status,
    Request_Status,
    PermissionsRoles
}