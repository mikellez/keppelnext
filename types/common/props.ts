import { GetServerSideProps, GetServerSidePropsContext } from "next";
import { CMMSChecklist, CMMSChangeOfParts, CMMSAssetDetails } from "./interfaces";
import axios from "axios";

const createChecklistGetServerSideProps = (checklistType: string, allowedStatuses?: number[]) => {

	const x: GetServerSideProps = async (context: GetServerSidePropsContext) => {
		const headers = {
			withCredentials: true,
			headers: {
				Cookie: context.req.headers.cookie,
			},
		};

        let checklist = null;

		if (context.query.id) {
			const { id }  = context.query;
			const response = await axios.get<CMMSChecklist>(`http://localhost:3001/api/checklist/${checklistType}/${id}`, headers);
			if (
				response.status == 500 || 
				(allowedStatuses && !allowedStatuses.includes(response.data.status_id))
			) {
				return {
					props: {
						checklist: null
					},
					redirect : {
						destination: "/404"
					}
				}
			}
			console.log(response.data)
			checklist = response.data
		}

		return {
			props: {
				checklist: checklist
			}
		}	
	};

	return x;
};

const createChangeOfPartsServerSideProps = (specificCOP: boolean, conditionalFunc?: Function) => {
	
	const getServerSideProps: GetServerSideProps = async (context: GetServerSidePropsContext) => {

		const headers = {
			withCredentials: true,
			headers: {
				Cookie: context.req.headers.cookie,
			},
		};

		const url = specificCOP && context.params?.id ? 
			`http://localhost:3001/api/changeOfParts/${context.params!.id}` : 
			specificCOP && context.query.copId? 
			`http://localhost:3001/api/changeOfParts/${context.query!.copId}` :
			specificCOP && context.query.assetId?
			`http://localhost:3001/api/assetDetails/${context.query!.assetId}` :
			"http://localhost:3001/api/changeOfParts";
	
		const response = await axios.get<CMMSChangeOfParts[] | CMMSAssetDetails[]>(url, headers);

		if (conditionalFunc && conditionalFunc(response) == false) {
			return {
				redirect: {
					destination: "/403",
				},
				props: {}
			}
		}
	
		return {
			props: {
				changeOfParts: context.query.assetId ? 
								[{psaId: (response.data[0] as CMMSAssetDetails).psa_id, 
								plantId: (response.data[0] as CMMSAssetDetails).plant_id}] as CMMSChangeOfParts[]
								: (response.data as CMMSChangeOfParts[])
			}
		};
	};

	return getServerSideProps;
};

export {
    createChecklistGetServerSideProps,
	createChangeOfPartsServerSideProps,
}