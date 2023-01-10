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

export { CMMSBaseType, CMMSUser }