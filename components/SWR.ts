import useSWR from "swr";
import axios from "axios";

import {
  CMMSAsset,
  CMMSRequest,
  CMMSChecklist,
  CMMSActivitylog,
  CMMSSystemAsset,
  CMMSSystemAssetName,
  CMMSSubComponent1Name,
} from "../types/common/interfaces";

import { RequestProps } from '../pages/Request';
import { ChecklistProps } from '../pages/Checklist';

function useRequest(
  request_type: "pending" | "assigned" | "review" | "approved",
	page: number
) {
  const requestFetcher = (url: string) =>
    axios
      .get<{ rows: CMMSRequest[], total: number }>(url)
      .then((response) => {
        response.data.rows.forEach((s: CMMSRequest) => {
          s.created_date = new Date(s.created_date);
        });
        return response.data;
      })
      .catch((e) => {
        throw new Error(e);
      });

  return useSWR<{ rows: CMMSRequest[], total: number }, Error>(
    [`/api/request/${request_type}?page=${page}`],
    requestFetcher,
    { revalidateOnFocus: false }
  );
}

function useRequestFilter(props: RequestProps, page:number) {
	const requestFetcher = (url: string) => 
		axios
		.get<{ rows: CMMSRequest[], total: number}>(url)
		.then((response) => {
			if(response?.data?.rows === undefined) return {rows: [], total: 0};

			response.data.rows.forEach((s) => {
				s.created_date = new Date(s.created_date)
			});
			return response.data;
		})
		.catch((e) => {
			throw new Error(e);
		});

	return useSWR<{ rows: CMMSRequest[], total: number}, Error>(
		`/api/request/filter/${props.status}/${props.plant}/${props.datetype}/${props.date}/${page}`, 
		requestFetcher, 
		{revalidateOnFocus: false});
}

function useAsset(plant_id: number | null) {
  const assetFetcher = (url: string) =>
    axios
      .get<CMMSAsset[]>(url + plant_id)
      .then((response) => response.data)
      .catch((e) => {
        throw new Error(e);
      });

  return useSWR<CMMSAsset[], Error>(
    plant_id ? ["/api/asset/", plant_id.toString()] : null,
    assetFetcher,
    { revalidateOnFocus: false }
  );
}

function useChecklist(checklist_type: "assigned" | "record" | "approved", page:number) {
  const checklistFetcher = (url: string) =>
    axios
      .get<CMMSChecklist[]>(url + checklist_type + `?page=${page}`)
      .then((response) => response.data)
      .catch((e) => {
        throw new Error(e);
      });

  return useSWR<CMMSChecklist[], Error>(
    [`/api/checklist/${checklist_type}?page=${page}`],
    checklistFetcher,
    { revalidateOnFocus: false }
  );
}
function useChecklistFilter(props: ChecklistProps, page: number) {
	const checklistFetcher = (url: string) => 
		axios
		.get<{ rows: CMMSChecklist[], total: number}>(url)
		.then((response) => response.data)
		.catch((e) => {
			throw new Error(e);
		})

	return useSWR<{ rows: CMMSChecklist[], total: number}, Error>(
		`/api/checklist/filter/${props.status}/${props.plant}/${props.datetype}/${props.date}/${page}`, 
		checklistFetcher, 
		{revalidateOnFocus: false }
	);
}
function useAccountlog() {
  const accountlogFetcher = (url: string) =>
    axios
      .get<any[]>(url)
      .then((response) =>
        response.data.map((singleLog) => {
          return {
            id: singleLog.id,
            user_id: singleLog.user_id,
            description: singleLog.description,
            event_time: singleLog.event_time,
          };
        })
      )
      .catch((e) => {
        throw new Error(e);
      });

  return useSWR<CMMSActivitylog[], Error>(
    "/api/activity/account_log",
    accountlogFetcher,
    { revalidateOnFocus: false }
  );
}

function useCurrentUser() {
  interface CMMSCurrentUser {
    id: number;
    name: string;
    role_id: number;
    role_name: string;
    allocated_plants: number[];
  }

  const userFetcher = (url: string) =>
    axios
      .get<CMMSCurrentUser>(url)
      .then((response) => response.data)
      .catch((e) => {
        throw new Error(e);
      });

  return useSWR<CMMSCurrentUser, Error>("/api/user", userFetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });
}

function useSystemAsset(system_id: number | null) {
  const systemAssetFetcher = (url: string) =>
    axios
      .get<CMMSSystemAsset[]>(url + system_id)
      .then((response) => response.data)
      .catch((e) => {
        throw new Error(e);
      });

  return useSWR<CMMSSystemAsset[], Error>(
    system_id ? ["/api/asset/system/", system_id] : null,
    systemAssetFetcher,
    { revalidateOnFocus: false }
  );
}
function useSystemAssetName(
  plant_id: number | null,
  system_id: number | null,
  system_asset_id: number | null
) {
  const systemAssetFetcher = (url: string) =>
    axios
      .get<CMMSSystemAssetName[]>(
        url + plant_id + "/" + system_id + "/" + system_asset_id
      )
      .then((response) => response.data)
      .catch((e) => {
        throw new Error(e);
      });

  return useSWR<CMMSSystemAssetName[], Error>(
    system_id
      ? ["/api/asset/system/", plant_id, system_id, system_asset_id]
      : null,
    systemAssetFetcher,
    { revalidateOnFocus: false }
  );
}
function useSubComponent1Name(
  plant_id: number | null,
  system_id: number | null,
  system_asset_id: number | null,
  system_asset_name_id: string | null
) {
  const systemAssetFetcher = (url: string) =>
    axios
      .get<CMMSSubComponent1Name[]>(
        url +
          plant_id +
          "/" +
          system_id +
          "/" +
          system_asset_id +
          "/" +
          system_asset_name_id
      )
      .then((response) => response.data)
      .catch((e) => {
        throw new Error(e);
      });

  return useSWR<CMMSSubComponent1Name[], Error>(
    system_id
      ? [
          "/api/asset/system/",
          plant_id,
          system_id,
          system_asset_id,
          system_asset_name_id,
        ]
      : null,
    systemAssetFetcher,
    { revalidateOnFocus: false }
  );
}

export {
  useRequest,
  useRequestFilter,
	useAsset,
	useChecklist,
	useChecklistFilter,
	useCurrentUser,
	useAccountlog,
	useSystemAsset,
	useSystemAssetName,
	useSubComponent1Name
}
