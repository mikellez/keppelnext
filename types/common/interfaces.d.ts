interface CMMSBaseType {
	id: number
	name: string
}

interface CMMSAsset {
	psa_id: number
	asset_name: string
}

interface CMMSUser {
	id: number
	role_id?: number
	role_name: string
	name?: string
	email?: string
	fname?: string
	lname?: string
	username?: string
}

interface CMMSRequest {
	request_id: string;
	created_date: Date;
	fullname: string;
	fault_name: string;
	asset_name: string;
	plant_name: string;
	priority: string;
	status: string;
}

interface CMMSRequestTypes {
	req_id: number
	request: string
}

interface CMMSFaultTypes {
	fault_id: number
	fault_type: string
}

interface CMMSPlant {
    plant_id: number;
    plant_name: string;
    plant_description: string;
};

interface CMMSScheduleEvent {
	title: string;
    start?: Date | string;
    extendedProps: {
        plant: string;
        scheduleId: number;
        checklistId: number;
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
    };
};

interface CMMSTimeline {
	id?: number;
    name: string,
    plantId: number,
	plantName?: string,
    description: string,
	status?: number,
};

interface CMMSSchedule {
	checklistId: number;
	startDate: Date;
	endDate: Date,
	recurringPeriod: number;
	assignedIds: number[];
	remarks: string[];
	plantId: number;
}

interface CMMSChecklist {
	checklist_id: number;
	chl_name: string;
	description: string;
	status_id: number;
	createdbyuser: string;
	assigneduser: string;
	signoffuser: string;
	plant_name: string;
	plant_id: number;
	linkedassets: string | null;
	linkedassetids: string | null;
	chl_type: "Template";
	created_date: Date;
	history: string;
}

interface CMMSMasterSubmission {
	[column_name: string]: string;
}

interface CMMSMasterField {
	column_label: string
	column_name: string
}

interface CMMSMasterTables {
	[tableName: string]: {
		internalName: string
		id: string
		name: string
		fields: CMMSMasterField[]
	}
}

export { CMMSBaseType, CMMSUser, CMMSRequest, CMMSRequestTypes, CMMSFaultTypes, CMMSPlant, CMMSScheduleEvent, CMMSTimeline, CMMSSchedule, CMMSAsset, CMMSChecklist, CMMSMasterSubmission, CMMSMasterField, CMMSMasterTables };