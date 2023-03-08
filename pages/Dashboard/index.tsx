import React from "react";

import { GetServerSideProps, GetServerSidePropsContext } from "next";
import axios from "axios";
import ManagerDashboad from "./Manager";
import EngineerDashboad from "./Engineer";
import SpecialistDashboad from "./Specialist";

export default function Dashboad({role_id}: {role_id: number}) {
	if(role_id === 1 || role_id === 2)
		return <ManagerDashboad/>

	if(role_id === 3)
		return <EngineerDashboad/>

	return <SpecialistDashboad/>
};

export const getServerSideProps: GetServerSideProps = async(context: GetServerSidePropsContext) => {
	const headers = {
		withCredentials: true,
		headers: {
			Cookie: context.req.headers.cookie
		}
	}

	const userInfo = await axios.get<any>("http://localhost:3001/api/user", headers);
	console.log(userInfo.data)
	if(userInfo.status === 400)
		return { notFound: true }

	let props = {
		role_id: userInfo.data.role_id
	}

	return {
		props: props
	}
}