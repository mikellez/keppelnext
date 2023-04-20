interface CMMSBaseType {
  id: number;
  name: string;
}

interface CMMSAsset {
  psa_id: number;
  asset_name: string;
}

interface CMMSAssetDetails extends CMMSAsset {
  plant_name: string;
  system_name: string;
  system_asset: string;
  parent_asset: string;
  asset_type: string;
  asset_description: string;
  asset_location: string;
  brand: string;
  model_number: string;
  technical_specs: string;
  manufacture_country: string;
  warranty: string;
  remarks: string;
  uploaded_image: string;
  uploaded_files: string;
  plant_id: number;
  system_id: number;
  system_asset_id: number;
  system_asset_lvl5?: string;
  system_asset_lvl6?: string;
  system_asset_lvl7?: string;
}

interface CMMSAssetDetailsState {
  plant_id: number;
  system_id: number;
  system_asset_id: number;
  system_asset: string;
  asset_type_id: string;
  system_asset_name: string;
  system_asset_name_form: string;
  sub_component_1: string;
  sub_component_1_form: string;
  sub_component_2: string;
  description: string;
  location: string;
  brand: string;
  model_number: string;
  tech_specs: string;
  manufacture_country: string;
  warranty: string;
  remarks: string;
  image: string;
  files: string;
}
/*
interface CMMSAssetDetails2 {
  psa_id: number;

  plant_id: number;


  uploaded_image: Uint8Array | null;
  uploaded_files: Uint8Array[] | null;
}*/

interface CMMSAssetHistory {
  history_id: number;
  action: string;
  fields: string;
  date: Date;
  asset_id: number;
  name: string;
}

interface postData {
  plant_id?: number;
  system_id?: number;
  system_asset_id?: number;
  system_asset?: string;
  asset_type_id?: string;
  system_asset_name?: string;
  system_asset_name_form?: string;
  sub_component_1?: string;
  sub_component_1_form?: string;
  sub_component_2?: string;
  description?: string;
  location?: string;
  brand?: string;
  model_number?: string;
  tech_specs?: string;
  manufacture_country?: string;
  warranty?: string;
  remarks?: string;
  uploaded_image?: string;
  uploaded_files?: string;
}

interface CMMSAssetRequestHistory {
  status: string;
  action: string;
  date: string;
  role: string;
  name: string;
  caseId: string;
  priority: string;
  faultType: string;
}

interface CMMSAssetChecklistHistory {
  action: string;
  date: string;
  name: string;
  status: string;
  checklistId: string;
  checklistName: string;
}

interface CMMSUser {
  id: number;
  role_id?: number;
  role_name: string;
  name?: string;
  email?: string;
  fname?: string;
  lname?: string;
  username?: string;
}

interface CMMSEmployee extends CMMSUser {
  employee_id?: number;
  full_name: string;
}

interface CMMSRequest {
  request_id: string;
  request_name?: string;
  created_date: Date;
  fullname: string;
  fault_name: string;
  fault_id?: number;
  asset_name: string;
  psa_id?: number;
  req_id?: number;
  plant_name: string;
  plant_id?: number;
  priority: string;
  priority_id: number;
  status: string;
  status_id?: number;
  assigned_user_email: string;
  assigned_user_id: number;
  assigned_user_name: string;
  fault_description?: string;
  uploaded_file?: any;
  requesthistory?: string;
  complete_comments?: string;
  completion_file?: any;
  rejection_comments: string;
}

interface CMMSRequestTypes {
  req_id: number;
  request: string;
}

interface CMMSFaultTypes {
  fault_id: number;
  fault_type: string;
}

interface CMMSPlant {
  plant_id: number;
  plant_name: string;
  plant_description: string;
}

interface CMMSScheduleEvent {
  title: string;
  start?: Date | string;
  extendedProps: {
    plant: string;
    plantId?: number;
    scheduleId: number;
    checklistId: number;
    timelineId: number;
    date?: Date;
    startDate: Date | string;
    endDate: Date | string;
    recurringPeriod: number;
    assignedIds: number[];
    assignedEmails: string[];
    assignedFnames: string[];
    assignedLnames: string[];
    assignedUsernames: string[];
    assignedRoles: string[];
    remarks: string;
    exclusionList?: number[];
    isSingle?: boolean;
    index?: number;
    status?: number;
  };
}

interface CMMSTimeline {
  id?: number;
  name: string;
  plantId: number;
  plantName?: string;
  description: string;
  status?: number;
}

interface CMMSSchedule {
  scheduleId?: number;
  checklistId: number;
  checklistName?: string;
  date?: Date;
  startDate: Date;
  endDate: Date;
  recurringPeriod: number;
  assignedIds: number[];
  remarks: string;
  plantId: number;
  plantName?: string;
  timelineId: number;
  reminderRecurrence: number;
  prevId?: number;
  isComplete?: boolean;
  status?: number;
  index?: number;
}

interface CMMSSystem {
  system_id: number;
  system_name: string;
}

interface CMMSSystemAsset {
  system_asset_id: number;
  system_asset: string;
}

interface CMMSAssetType {
  asset_id: number;
  asset_type: string;
}

interface CMMSSystemAssetName {
  system_asset_lvl6: string;
}
interface CMMSSubComponent1Name {
  system_asset_lvl7: string;
}

interface CMMSChecklist {
  checklist_id: number;
  chl_name: string;
  description: string;
  status_id: number;
  createdbyuser: string;
  created_by_user_id: string | null;
  created_by_user_email: string | null;
  assigneduser: string;
  assigned_user_email: string | null;
  assigned_user_id?: number;
  signoffuser: string;
  signoff_user_id?: number;
  signoff_user_email: string | null;
  plant_name: string;
  plant_id: number;
  linkedassets: string | null;
  linkedassetids: string | null;
  chl_type?: "Template";
  created_date: Date | string;
  history: string;
  status: string;
  datajson?: any;
}

interface CMMSActivitylog {
  id: number;
  user_id: string;
  description: string;
  event_time: string;
}

interface CMMSMasterSubmission {
  [column_name: string]: string;
}

interface CMMSMasterField {
  column_label: string;
  column_name: string;
}

interface CMMSMasterTables {
  [tableName: string]: {
    internalName: string;
    id: string;
    name: string;
    fields: CMMSMasterField[];
  };
}

interface CMMSDashboardData {
  id: number;
  name: string;
  value: number;
  fill: string;
}

interface CMMSChangeOfParts {
  copId: number;
  psaId: number;
  asset: string;
  plant: string;
  plantId: number;
  changedDate: Date | null;
  scheduledDate: Date;
  description: string;
  assignedUserId: number;
  assignedUser: string; 
}

interface CMMSChangeOfPartsEvent {
  title: string;
  start?: Date | string;
  extendedProps: {
    description: string;
    assignedUserId: number;
    assignedUser: string;
    psaId: number;
    asset: string;
    copId: number;
    plant: string;
    plantId: number;
  };
}

export {
  CMMSBaseType,
  CMMSUser,
  CMMSEmployee,
  CMMSRequest,
  CMMSRequestTypes,
  CMMSFaultTypes,
  CMMSPlant,
  CMMSScheduleEvent,
  CMMSTimeline,
  CMMSSchedule,
  CMMSAsset,
  CMMSAssetDetails,
  CMMSAssetHistory,
  CMMSAssetRequestHistory,
  CMMSAssetChecklistHistory,
  CMMSChecklist,
  CMMSMasterSubmission,
  CMMSMasterField,
  CMMSMasterTables,
  CMMSActivitylog,
  CMMSDashboardData,
  CMMSSystem,
  CMMSSystemAsset,
  CMMSAssetType,
  CMMSSystemAssetName,
  CMMSAssetDetailsState,
  postData,
  CMMSAssetDetails,
  CMMSSubComponent1Name,
  CMMSChangeOfParts,
  CMMSChangeOfPartsEvent,
};
