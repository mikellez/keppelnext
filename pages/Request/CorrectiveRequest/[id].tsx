import { GetServerSideProps, GetServerSidePropsContext } from "next";
import { useRouter } from "next/router";
import {
  ModuleContent,
  ModuleHeader,
  ModuleMain
} from "../../../components";
import RequestContainer, {
  CMMSRequestPriority,
  RequestProps,
} from "../../../components/Request/RequestContainer";
import instance from "../../../types/common/axios.config";
import {
  CMMSFaultTypes,
  CMMSRequest,
  CMMSRequestTypes,
  CMMSUser,
} from "../../../types/common/interfaces";

interface CorrenctiveRequestProps {
  requestData: RequestProps;
  linkedRequestData: CMMSRequest;
}

export default function CorrenctiveRequest(props: CorrenctiveRequestProps) {
  const router = useRouter();

  return (
    <ModuleMain>
      <ModuleHeader header="Create Corrective Request">
        <button
          className={"btn btn-secondary"}
          type="button"
          onClick={() => router.back()}
        >
          Back
        </button>
      </ModuleHeader>
      <ModuleContent>
        <RequestContainer
          requestData={props.requestData}
          linkedRequestData={props.linkedRequestData}
          isNotAssign={true}
        />
      </ModuleContent>
    </ModuleMain>
  );
}

export const getServerSideProps: GetServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const headers = {
    withCredentials: true,
    headers: {
      Cookie: context.req.headers.cookie,
    },
  };
  const getUser = instance.get<CMMSUser>(`/api/user`, headers);
  const getRequestTypes = instance.get<CMMSRequestTypes[]>(
    `/api/request/types`,
    headers
  );
  const getFaultTypes = instance.get<CMMSFaultTypes[]>(
    `/api/fault/types`,
    headers
  );
  const getSpecificRequest = instance.get(
    `/api/request/` + context.params?.id,
    headers
  );
  const getPriority = instance.get(
    `/api/request/priority`, 
    headers);

  const values = await Promise.all([
    getUser,
    getRequestTypes,
    getFaultTypes,
    getSpecificRequest,
    getPriority
  ]);

  const u: CMMSUser = values[0].data;
  const r: CMMSRequestTypes[] = values[1].data;
  const f: CMMSFaultTypes[] = values[2].data;
  const l: CMMSRequest = values[3].data;
  const p: CMMSRequestPriority[] = values[4].data;

  let props: CorrenctiveRequestProps = {
    requestData: { user: u, requestTypes: r, faultTypes: f,  priority: p },
    linkedRequestData: l,
  };

  return {
    props: props,
  };
};
