import { GetServerSideProps, GetServerSidePropsContext } from "next";
import axios from "axios";

const createChecklistGetServerSideProps = (checklistType: string) => {

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
			const response = await axios.get(`http://localhost:3001/api/checklist/${checklistType}/${id}`, headers);
			if (response.status == 500) {
				return {
					props: {
						checklist: null
					},
					redirect : {
						destination: "/404"
					}
				}
			}
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