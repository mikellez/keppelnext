import React, { useEffect, useState } from "react";
import axios from "axios";
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
  return (
    <ModuleMain>
      <ModuleHeader title="Assign Request" header="Assign Request">
        <Link href="/Request" className="btn btn-secondary">
          Back
        </Link>
      </ModuleHeader>
      <ModuleContent>
        <RequestContainer assignRequestData={props} />
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

  const getSpecificRequest = axios.get(
    "http://localhost:3001/api/request/" + context.params?.id,
    headers
  );

  const getPriority = axios.get(
    "http://localhost:3001/api/request/priority",
    headers
  );

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
