
import useSWR from 'swr';
import axios from 'axios';

import { CMMSRequest } from '../types/common/interfaces'; 

function useRequest() {
	const requestFetcher = (url: string) => axios.get<CMMSRequest[]>(url).then((response) => {
		response.data.forEach((s) => {
			s.created_date = new Date(s.created_date)
		});
		return response.data;
	})
	.catch((e) => {
		console.log("error getting requests")
		console.log(e);
		throw new Error(e);
	});

	return useSWR<CMMSRequest[], Error>("/api/request", requestFetcher, {revalidateOnFocus: false});
}

export {
    useRequest
}