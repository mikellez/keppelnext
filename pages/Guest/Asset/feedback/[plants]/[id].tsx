import React, { useEffect, useState } from "react";
import instance from "../../../../../axios.config.js";
import { useRouter } from "next/router";

import {
  ModuleContent,
  ModuleDivider,
  ModuleFooter,
  ModuleHeader,
  ModuleMain,
  ModuleModal,
} from "../../../../../components";

import {
  CMMSBaseType,
  CMMSRequestTypes,
  CMMSFaultTypes,
  CMMSUser,
  CMMSPlantLoc,
} from "../../../../../types/common/interfaces";
import { GetServerSideProps, GetServerSidePropsContext } from "next";
import Link from "next/link";
import { RequestProps } from "../../../../../components/Request/RequestContainer";
import RequestGuestContainer from "../../../../../components/Request/RequestGuestContainer";
import FeedbackContainer from "../../../../../components/Guest/FeedbackContainer";
import ModuleSimplePopup from "../../../../../components/ModuleLayout/ModuleSimplePopup";
import { useCurrentUser } from "../../../../../components/SWR.ts"

// let user: boolean = false;

export default function RequestNew(props: RequestProps) {
  const router = useRouter();
  // const [userbool, setUserbool] = useState(false);
  const [modal, setModal] = useState(true);
  const user = useCurrentUser();

  return (
    <ModuleMain>
      <ModuleHeader title="Feedback" header="Feedback"></ModuleHeader>
      <ModuleContent>
        <FeedbackContainer requestData={props} user={user} />
        {/* <RequestGuestContainer requestData={props} user={userbool}/> */}
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
  // const getRequestTypes = instance.get<CMMSRequestTypes[]>(
  //   `/api/request/types`,
  //   headers
  // );
  // const getFaultTypes = instance.get<CMMSFaultTypes[]>(
  //   `/api/fault/types`,
  //   headers
  // );
  const getPlant = instance.get<any>(
    `/api/request/plant/${context.query.plants}`,
    headers
  );
  // const getAsset = instance.get<any>(
  //   `/api/request/asset/${context.query.id}`,
  //   headers
  // );
  const getPlantLoc = instance.get<CMMSPlantLoc>(
    `/api/plantLocation/${context.query.id}`,
    headers
  );

  const values = await Promise.all([
    // getRequestTypes,
    // getFaultTypes,
    getPlant,
    // getAsset,
    getPlantLoc,
  ]);

  // const r: CMMSRequestTypes[] = values[0].data;
  // const f: CMMSFaultTypes[] = values[1].data;
  const p: CMMSBaseType = values[0].data;
  const l: CMMSPlantLoc = values[1].data;

  interface GuestRequestProps {
    // requestTypes: CMMSRequestTypes[];
    // faultTypes: CMMSFaultTypes[];
    plant: any;
    // asset: any;
    plantLoc: CMMSPlantLoc;
  }

  let props: GuestRequestProps = {
    // requestTypes: r,
    // faultTypes: f,
    plant: p,
    // asset: a,
    plantLoc: l,
  };

  return {
    props: props,
  };
};
