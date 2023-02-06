interface CMMSBaseType {
	id: number
	name: string
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
    start?: Date;
    extendedProps: {
        plant: string;
        scheduleId: number;
        checklistId: number;
        startDate: Date;
        endDate: Date;
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


export { CMMSBaseType, CMMSUser, CMMSRequest, CMMSRequestTypes, CMMSFaultTypes, CMMSPlant, CMMSScheduleEvent }