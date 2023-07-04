import React, { useEffect, useState } from "react";
import instance from "../../../types/common/axios.config";
import { useRouter } from "next/router";
import {
  ModuleContent,
  ModuleDivider,
  ModuleFooter,
  ModuleHeader,
  ModuleMain,
} from "../../../components";

import {
  CMMSBaseType,
  CMMSRequestTypes,
  CMMSFaultTypes,
  CMMSUser,
  CMMSRequest,
} from "../../../types/common/interfaces";
import { GetServerSideProps, GetServerSidePropsContext } from "next";
import Link from "next/link";
import RequestContainer, {
  AssignRequestProps,
  CMMSRequestPriority,
} from "../../../components/Request/RequestContainer";

export default function AssignRequestPage(props: AssignRequestProps) {
  const router = useRouter();

  return (
    <ModuleMain>
      <ModuleHeader title="Assign Request" header="Assign Request">
        <button
          className={"btn btn-secondary"}
          type="button"
          onClick={() => router.back()}
        >
          Back
        </button>
      </ModuleHeader>
      <ModuleContent>
        <RequestContainer assignRequestData={props} isNotAssign={false} />
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

  const getSpecificRequest = instance.get(
    `/api/request/` + context.params?.id,
    headers
  );

  const getPriority = instance.get(`/api/request/priority`, headers);

  const values = await Promise.all([getSpecificRequest, getPriority]);

  //   console.log("vales", values);
  const requestData: CMMSRequest = values[0].data;
  const priority: CMMSRequestPriority[] = values[1].data;

  // console.log(requestData);
  // console.log(priority);

  let props: AssignRequestProps = {
    requestData: requestData,
    priority: priority,
  };
  console.log(props);
  return {
    props: props,
  };
};
