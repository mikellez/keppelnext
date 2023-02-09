
import useSWR from 'swr';
import axios from 'axios';

import { CMMSAsset, CMMSRequest } from '../types/common/interfaces'; 

function useRequest() {
	const requestFetcher = (url: string) => axios.get<CMMSRequest[]>(url).then((response) => {
		response.data.forEach((s) => {
			s.created_date = new Date(s.created_date)
		});
		return response.data;
	})
	.catch((e) => {
		throw new Error(e);
	});

	return useSWR<CMMSRequest[], Error>("/api/request", requestFetcher, {revalidateOnFocus: false});
}

function useAsset(plant_id: number|null) {
	const assetFetcher = (url: string) => axios.get<CMMSAsset[]>(url + plant_id).then((response) => response.data).catch((e) => {
		throw new Error(e);
	})

	return useSWR<CMMSAsset[], Error>(plant_id ? ["/api/asset/", plant_id.toString()] : null, assetFetcher, {revalidateOnFocus: false});
}

export {
    useRequest,
	useAsset
}