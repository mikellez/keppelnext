import useSWR from "swr";
import {
  CMMSAsset,
  CMMSRequest,
  CMMSChecklist,
  CMMSActivitylog,
  CMMSSystemAsset,
  CMMSSystemAssetName,
  CMMSSubComponent1Name,
  CMMSChangeOfParts,
  CMMSWorkflow,
  CMMSFeedback,
} from "../types/common/interfaces";
import { RequestProps } from "../pages/Request";
import { ChecklistProps } from "../pages/Checklist";
import instance from "../types/common/axios.config";
import { FeedbackFormProps } from "../pages/Feedback";

function useRequest(
  request_type: "pending" | "assigned" | "review" | "approved",
  page: number,
  search: string = "",
  fields: string[]
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
  const fieldsString = fields.join(",");

  return useSWR<{ rows: CMMSRequest[]; total: number }, Error>(
    [
      `/api/request/${request_type}?page=${page}&search=${search}&expand=${fieldsString}`,
    ],
    requestFetcher,
    { revalidateOnFocus: false }
  );
}

function useSpecificRequest(request_id: number) {
  const requestFetcher = (url: string) =>
    instance
      .get<CMMSRequest>(url)
      .then((response) => {
        response.data.created_date = new Date(response.data.created_date);
        return response.data;
      })
      .catch((e) => {
        throw new Error(e);
      });
  return useSWR<CMMSRequest, Error>(
    [`/api/request/${request_id}`],
    requestFetcher,
    { revalidateOnFocus: false }
  );
}

function useRequestFilter(
  props: RequestProps, 
  page: number,
  fields: string[]
) {
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
    `/api/request/${props.viewType ?? 'pending'}/${props?.plant || 0}/${
      props.datetype || "all"
    }/${props?.date || "all"}?page=${page}&expand=${fields.join(",")}`,
    requestFetcher,
    { revalidateOnFocus: false }
  );
}

function useFeedback(
  request_type: "pending" | "assigned" | "completed",
  page: number
) {
  const feedbackFetcher = (url: string) =>
    instance
      .get<{ rows: CMMSFeedback[]; total: number }>(url)
      .then((response) => {
        response.data.rows.forEach((s: CMMSFeedback) => {
          s.created_date = new Date(s.created_date);
        });
        return response.data;
      })
      .catch((e) => {
        throw new Error(e);
      });

  return useSWR<{ rows: CMMSFeedback[]; total: number }, Error>(
    [`/api/Feedback/${request_type}?page=${page}`],
    feedbackFetcher,
    { revalidateOnFocus: false }
  );
}
function useFeedbackFilter(props: FeedbackFormProps, page: number) {
  const feedbackFetcher = (url: string) =>
    instance
      .get<{ rows: CMMSFeedback[]; total: number }>(url)
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

  return useSWR<{ rows: CMMSFeedback[]; total: number }, Error>(
    `/api/feedback/filter/${props.feedbackData.status || 0}/${
      props.feedbackData.plant_id || 0
    }/${page}`,
    feedbackFetcher,
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
  page: number,
  search: string = "",
  fields: string[]
) {
  const checklistFetcher = (url: string) =>
    instance
      .get<{ rows: CMMSChecklist[]; total: number }>(url)
      .then((response) => response.data)
      .catch((e) => {
        throw new Error(e);
      });

  return useSWR<{ rows: CMMSChecklist[]; total: number }, Error>(
    [`/api/checklist/${checklist_type}?page=${page}&search=${search}&expand=${fields.join(",")}`],
    checklistFetcher,
    { revalidateOnFocus: false }
  );
}

function useChecklistFilter(
  props: ChecklistProps, 
  page: number,
  fields: string[]
) {
  const checklistFetcher = (url: string) =>
    instance
      .get<{ rows: CMMSChecklist[]; total: number }>(url)
      .then((response) => response.data)
      .catch((e) => {
        throw new Error(e);
      });

  return useSWR<{ rows: CMMSChecklist[]; total: number }, Error>(
    `/api/checklist/${props.viewType ?? 'pending'}/${props?.plant || 0}/${
      props?.datetype || "all"
    }/${props?.date || "all"}?page=${page}&expand=${fields.join(",")}`,
    checklistFetcher,
    { revalidateOnFocus: false }
  );
}
function useAccountlog(url: string) {
  const accountlogFetcher = (url: string) =>
    instance
      .get(url)
      .then((response) => {
        const logs = response.data.logs.map((singleLog:any) => {
          return {
            id: singleLog.event_time,
            user_name: singleLog.user_name,
            type: singleLog.type,
            description: singleLog.description,
            event_time: singleLog.event_time,
          };
        });
        return { logs, totalPages: response.data.totalPages };
      })
      .catch((e) => {
        throw new Error(e);
      });

  return useSWR<{ logs: CMMSActivitylog[]; totalPages: number }, Error>(
    url,
    accountlogFetcher,
    {
      revalidateOnFocus: false,
    }
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
    employee_id: string;
    permissions: string[];
  }

  const userFetcher = (url: string) =>
    instance
      .get<CMMSCurrentUser>(url)
      .then((response) => response.data)
      .catch((e) => {
        throw new Error(e);
      });

  const { data, error } = useSWR<CMMSCurrentUser, Error>("/api/user", userFetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });

  const userPermission = (permission: string) => {
    if (!data) return false;

    const excludePermission = permission.replace("can", "exclude");
    const ableAccess = data.permissions.includes(permission);

    if(ableAccess && data.permissions.includes(excludePermission)) return false;

    return ableAccess;
  };

  return {
    data,
    error,
    userPermission
  }
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
  limit: number,
  page : number,
  options?: {
    plant_id?: number;
    psa_id?: number;
    type: "completed" | "scheduled" | null;
    
  },
  
) {
  const changeOfPartsFetcher = async (url: string) => {
    let apiURL = copId ? `${url}/${copId}` : url;
    apiURL += "&"
    if (options) {
      if (options.plant_id && options.type)
        apiURL += `plant_id=${options.plant_id}&type=${options.type}`;
      else if (options.plant_id) {
        apiURL += `plant_id=${options.plant_id}`
      }
      else if (options.type) {
        apiURL += `type=${options.type}`
      }
      else if (options.psa_id && copId === null){
        apiURL += `psa_id=${options.psa_id}`;

      }
    } 

    return await instance
      .get<CMMSChangeOfParts[]>(apiURL)
      .then((response) => {
        // console.log(apiURL + "finding the query")
        return response.data})
      .catch((e) => {
        console.log(e + "in swr")
        throw new Error(e);
      });
  };

  return useSWR<CMMSChangeOfParts[], Error>(
    [`/api/changeOfParts/${options?.type}?limit=${limit}&offset=${
      (page - 1) * limit}`, copId, options],
    changeOfPartsFetcher,
    { revalidateOnFocus: false }
  );
}

function useWorkflow(page: number) {
  const workflowFetcher = (url: string) =>
    instance
      .get<{ rows: CMMSWorkflow[]; total: number }>(url)
      .then((response) => {
        response.data.rows.forEach((s: CMMSWorkflow) => {
          s.created_date = new Date(s.created_date);
        });
        return response.data;
      })
      .catch((e) => {
        throw new Error(e);
      });

  return useSWR<{ rows: CMMSWorkflow[]; total: number }, Error>(
    [`/api/workflows?page=${page}`],
    workflowFetcher,
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
  useWorkflow,
  useFeedback,
  useFeedbackFilter,
  useSpecificRequest,
};
