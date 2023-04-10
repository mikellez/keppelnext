import { GetServerSideProps, GetServerSidePropsContext } from "next";
import { CMMSChecklist } from "./interfaces";
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

export {
    createChecklistGetServerSideProps,
}