import useSWR from "swr";
import instance from "../axios.config";

import {
  CMMSAsset,
  CMMSRequest,
  CMMSChecklist,
  CMMSActivitylog,
  CMMSSystemAsset,
  CMMSSystemAssetName,
  CMMSSubComponent1Name,
  CMMSChangeOfParts,
} from "../types/common/interfaces";

import { RequestProps } from "../pages/Request";
import { ChecklistProps } from "../pages/Checklist";

function useRequest(
  request_type: "pending" | "assigned" | "review" | "approved",
  page: number
) {
  const requestFetcher = (url: string) =>
    instance
      .get<{ rows: CMMSRequest[]; total: number }>(url)
      .then((response) => {
        response.data.rows.forEach((s: CMMSRequest) => {
          s.created_date = new Date(s.created_date);
        });
        return response.data;
      })
      .catch((e) => {
        throw new Error(e);
      });

  return useSWR<{ rows: CMMSRequest[]; total: number }, Error>(
    [`/api/request/${request_type}?page=${page}`],
    requestFetcher,
    { revalidateOnFocus: false }
  );
}

function useRequestFilter(props: RequestProps, page: number) {
  const requestFetcher = (url: string) =>
    instance
      .get<{ rows: CMMSRequest[]; total: number }>(url)
      .then((response) => {
        if (response?.data?.rows === undefined) return { rows: [], total: 0 };

        response.data.rows.forEach((s) => {
          s.created_date = new Date(s.created_date);
        });
        return response.data;
      })
      .catch((e) => {
        throw new Error(e);
      });

  return useSWR<{ rows: CMMSRequest[]; total: number }, Error>(
    `/api/request/filter/${props?.status || 0}/${props?.plant || 0}/${props.datetype || 'all'}/${props?.date || 'all'}/${page}`,
    requestFetcher,
    { revalidateOnFocus: false }
  );
}

function useAsset(plant_id: number | null) {
  const assetFetcher = (url: string) =>
    instance
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

function useChecklist(
  checklist_type: "pending" | "assigned" | "record" | "approved",
  page: number
) {
  const checklistFetcher = (url: string) =>
    instance
      .get<{ rows: CMMSChecklist[]; total:number}>(url)
      .then((response) => response.data)
      .catch((e) => {
        throw new Error(e);
      });

  return useSWR<{ rows: CMMSChecklist[]; total:number}, Error>(
    [`/api/checklist/${checklist_type}?page=${page}`],
    checklistFetcher,
    { revalidateOnFocus: false }
  );
}

function useChecklistFilter(props: ChecklistProps, page: number) {
  const checklistFetcher = (url: string) =>
    instance
      .get<{ rows: CMMSChecklist[]; total: number }>(url)
      .then((response) => response.data)
      .catch((e) => {
        throw new Error(e);
      });

  return useSWR<{ rows: CMMSChecklist[]; total: number }, Error>(
    `/api/checklist/filter/${props?.status || 0}/${props?.plant || 0}/${props?.datetype || 'all'}/${props?.date || 'all'}/${page}`,
    checklistFetcher,
    { revalidateOnFocus: false }
  );
}
function useAccountlog(url: string) {
  const accountlogFetcher = (url: string) =>
    instance
      .get<any[]>(url)
      .then((response) =>
        response.data.map((singleLog) => {
          return {
            id: singleLog.event_time,
            user_name: singleLog.user_name,
            type: singleLog.type,
            description: singleLog.description,
            event_time: singleLog.event_time,
          };
        })
      )
      .catch((e) => {
        throw new Error(e);
      });

  return useSWR<CMMSActivitylog[], Error>(
    url,
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
    email: string;
    username: string;
    employee_id: string
  }

  const userFetcher = (url: string) =>
    instance
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
    instance
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
    instance
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
    instance
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

function useChangeOfParts(
  copId: number | null,
  options?: {
    plant_id?: number;
    psa_id?: number;
    type: "completed" | "scheduled" | null;
  }
) {
  const changeOfPartsFetcher = async (url: string) => {
    let apiURL = copId ? `${url}/${copId}` : url;

    if (options) {
      if (options.plant_id && options.type)
        apiURL += `?plant_id=${options.plant_id}&type=${options.type}`;
      else if (options.plant_id) apiURL += `?plant_id=${options.plant_id}`;
      else if (options.type) apiURL += `?type=${options.type}`;
      else if (options.psa_id && copId === null)
        apiURL += `?psa_id=${options.psa_id}`;
    }

    return await instance
      .get<CMMSChangeOfParts[]>(apiURL)
      .then((response) => response.data)
      .catch((e) => {
        throw new Error(e);
      });
  };

  return useSWR<CMMSChangeOfParts[], Error>(
    ["/api/changeOfParts", copId, options],
    changeOfPartsFetcher,
    { revalidateOnFocus: false }
  );
}

export {
  useRequest,
  useAsset,
  useChecklist,
  useCurrentUser,
  useAccountlog,
  useSystemAsset,
  useSystemAssetName,
  useSubComponent1Name,
  useChangeOfParts,
  useChecklistFilter,
  useRequestFilter,
};
