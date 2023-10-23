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
  system_form: string;
  system_asset_id: number;
  system_asset: string;
  system_asset_form: string;
  asset_type_id: string;
  asset_type_form: string;
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
  user_id: number;
  user_name: string;
}

interface CMMSRequest {
  request_id: string;
  request_name?: string;
  created_date: Date;
  created_by: string;
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
  activity_log: {
    activity: string;
    activity_type: string;
    date: string;
    name: string;
    role: string;
    remarks?: string;
  }[];
  total?: number;
  associatedrequestid?: number;
  overdue_status: boolean;
  description_other?: string;
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

interface CMMSEvent {
  title: string;
  start?: Date | string;
  extendedProps?: { [key: string]: any };
}

interface CMMSScheduleEvent extends CMMSEvent {
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
    timeline_remarks: string;
    exclusionList?: number[];
    isSingle?: boolean;
    index?: number;
    status?: number;
    isNewSchedule?: boolean;
    advanceSchedule?: number;
  };
  color?: string;
  display?: string;
}

interface CMMSTimeline {
  id?: number;
  name: string;
  plantId: number;
  plantName?: string;
  description: string;
  status?: string;
  created_date? : Date;
  remarks?: string;
  activity_log?: { [key: string]: string }[];
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
  prevId?: number | null;
  isComplete?: boolean;
  status?: number;
  index?: number;
  mode?: string;
  advanceSchedule?: number;
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

interface CMMSContact {
  tele? : string;
  whatsapp? : string;
  number? : string;
  email? : string;
}

interface CMMSFeedback {
  id : number;
  created_date: Date;
  completed_date? : Date;
  createdbyuser: string;
  name? : string;
  created_user_id: string | null;
  created_user_email: string | null;
  fullname: string;
  plant_name: string;
  plant_id: number;
  completed_img: string;
  // rating: number;
  image: string;
  contact: CMMSContact;
  loc_room: string;
  loc_floor:string;
  status: string;
  status_id: number;
  assigned_user_email: string;
  assigned_user_id: number;
  assigned_user_name: string;
  description?: string;
  requesthistory?: string;
  remarks?: string;
  total?: number;
  datajson?: any;
  activity_log: { [key: string]: string }[];
}

interface CMMSChecklist {
  checklist_id: number;
  chl_name: string;
  description: string;
  status_id: number;
  overdue: string;
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
  chl_type?: string;
  created_date: Date | string;
  history: string;
  status: string;
  datajson?: any;
  activity_log: { [key: string]: string }[];
  overdue_status: boolean;
  completeremarks_req: string;
}

interface CMMSActivitylog {
  id: number;
  user_name: string;
  type: string;
  description: string;
  event_time: string;
}

interface CMMSMasterSubmission {
  [column_name: string]: string;
}

interface CMMSMasterField {
  column_label: string;
  column_name: string;
  type?: string;
  url?: string;
  value?: any;
  options?: any;
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
  overdue_status?: boolean;
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
  remarks?: string;
}

interface CMMSAddUser {
  firstName: string;
  lastName: string;
  username: string;
  password: string;
  employeeId: string;
  email: string;
  roleType: number;
  allocatedPlants: number[];
}

interface CMMSUserSettings {
  username: string;
  email: string;
  userId: number;
}

interface CMMSChangeOfPartsEvent extends CMMSEvent {
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
    status: string;
  };
  color?: string;
  display?: string;
}
interface CMMSUserInfo {
  id: number;
  name: string;
  role_id: number;
  role_name: string;
  allocated_plants: [string];
  employee_id: string;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  permissions: string[];
}

interface CMMSChangePassword {
  current_password: string;
  new_password: string;
  confirm_password: string;
  id: number;
}

interface CMMSWorkflow {
  id: number;
  type: string;
  fault_id: string;
  fault_type: string;
  plant_id: string;
  plant_name: string;
  is_assign_to: number;
  is_send_email: number;
  is_active: number;
  assignTo: string;
  user_id: number;
  user_email: string,
  user_name: string,
  created_at: string,
  created_date: Date,
}

interface CMMSPlantLoc {
  id: number,
  plant_id: number,
  plant_name: string,
  location: string,
  activity_log?: {[key: string]: string}[]
  created_date?: string
}

// interface CMMSLicense {
//   id : number
//   license_id : number
//   license_name : string
//   license_provider : string
//   license_type_id : number
//   license_type : string
//   license_details : string
//   plant_loc_id : number
//   loc_floor : string
//   loc_room : string 
//   linked_asset_id : number 
//   linked_asset : CMMSAsset
//   assigned_user_id : number 
//   assigned_user : string 
//   acquisition_date?: Date
//   expiry_date?: Data 
//   status_id: number
//   status : string
//   images? : string
//   // activity_log : json
// }



interface CMMSPlantLocation {
  plant_id: number,
  plant_name: string,
  loc_id: number,
  loc_floor: string,
  loc_room: string,
}

interface CMMSLicenseType {
  type_id: number,
  type: string,
}

interface CMMSLicense {
  id: number;
  license_name: string;
  license_provider: string;
  license_type_id: number;
  license_type : string;
  license_details: string;
  plant_id: number;
  plant_name: string;
  plant_loc_id: number;
  loc_floor: string;
  loc_room: string;
  linked_asset_id: number | null;
  linked_asset: string
  linked_asset_name:acquisition_date
  assigned_user_id: number | null;
  assigned_user:string;
  acquisition_date: Date | null
  expiry_date : Date|null
  status: string;
  status_id: number;
  activity_log : { [key: string]: string }[];
  images?: File[];

}


interface CMMSLicenseForm {
  license_id?: number;
  license_name: string;
  license_provider: string;
  license_type_id: number;
  license_details: string;
  plant_id: number;
  plant_loc_id: number;
  linked_asset_id: number | null;
  assigned_user_id: number | null;
  acquisition_date?: Date | string;
  expiry_date? : Date | string;
  status_id?: number;
  images: File[]
}

interface CMMSLogbookLabel {
  label_id: number;
  name: string; // Name of the label
  description?: string; // Description of label
  activity_log? : { [key: string]: string }[];
  created_date? : Date;
  allow_custom: boolean; // To allow for customization of the label description
}

export {
  CMMSActivitylog, CMMSAddUser, CMMSAsset, CMMSAssetChecklistHistory, CMMSAssetDetails, CMMSAssetDetailsState, CMMSAssetHistory,
  CMMSAssetRequestHistory, CMMSAssetType, CMMSBaseType, CMMSChangeOfParts, CMMSChangeOfPartsEvent, CMMSChangePassword, CMMSChecklist, CMMSDashboardData, CMMSEmployee, CMMSEvent, CMMSFaultTypes, CMMSFeedback, CMMSLicense, CMMSLicenseForm, CMMSLicenseType, CMMSMasterField, CMMSMasterSubmission, CMMSMasterTables, CMMSPlant, CMMSPlantLoc,
  CMMSPlantLocation, CMMSRequest,
  CMMSRequestTypes, CMMSSchedule, CMMSScheduleEvent, CMMSSubComponent1Name, CMMSSystem,
  CMMSSystemAsset, CMMSSystemAssetName, CMMSTimeline, CMMSUser, CMMSUserInfo, CMMSUserSettings, CMMSWorkflow, postData, CMMSLogbookLabel
};

