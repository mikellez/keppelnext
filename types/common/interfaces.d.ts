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

interface CMMSRequestTypes {
	req_id: number
	request: string
}

interface CMMSFaultTypes {
	fault_id: number
	fault_type: string
}

export { CMMSBaseType, CMMSUser, CMMSRequestTypes, CMMSFaultTypes }