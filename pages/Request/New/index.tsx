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
} from "../../../types/common/interfaces";
import { GetServerSideProps, GetServerSidePropsContext } from "next";
import Link from "next/link";
import RequestContainer, {
  CMMSRequestPriority,
  RequestProps,
} from "../../../components/Request/RequestContainer";

export default function RequestNew(props: RequestProps) {
  const router = useRouter();

  return (
    <ModuleMain>
      <ModuleHeader title="New Request" header="Create New Request">
        <button
          className={"btn btn-secondary"}
          type="button"
          onClick={() => router.back()}
        >
          Back
        </button>
      </ModuleHeader>
      <ModuleContent>
        <RequestContainer requestData={props} isNotAssign={true} />
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

  const getPriority = instance.get(`/api/request/priority`, headers);

  const values = await Promise.all([getUser, getRequestTypes, getFaultTypes, getPriority]);

  const u: CMMSUser = values[0].data;
  const r: CMMSRequestTypes[] = values[1].data;
  const f: CMMSFaultTypes[] = values[2].data;
  const p: CMMSRequestPriority[] = values[3].data;

  let props: RequestProps = { user: u, requestTypes: r, faultTypes: f,  priority: p};

  return {
    props: props,
  };
};
