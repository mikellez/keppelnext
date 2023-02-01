interface CMMSBaseType {
	id: number
	name: string
}

interface CMMSUser {
	id: number
	role_id: number
	role_name: string
	name: string
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

export { CMMSBaseType, CMMSUser, CMMSRequest, CMMSRequestTypes, CMMSFaultTypes }