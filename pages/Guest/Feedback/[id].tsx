import React, { useEffect, useState } from "react";
import instance from "../../../axios.config.js";
import { useRouter } from "next/router";

import {
  ModuleContent,
  ModuleDivider,
  ModuleFooter,
  ModuleHeader,
  ModuleMain,
  ModuleModal,
} from "../../../components";

import {
  CMMSBaseType,
  CMMSRequestTypes,
  CMMSFaultTypes,
  CMMSUser,
  CMMSPlantLoc,
} from "../../../types/common/interfaces.js";
import { GetServerSideProps, GetServerSidePropsContext } from "next";
// import { RequestProps } from "../../../components/Request/RequestContainer.jsx";
import FeedbackContainer from "../../../components/Guest/FeedbackContainer";
import { useCurrentUser } from "../../../components/SWR.ts";

// let user: boolean = false;


interface CreateFeedbackProps {

  // plant: any;
  plantLoc: CMMSPlantLoc;
}

export default function RequestNew(props: CreateFeedbackProps) {
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
  
//   const getPlant = instance.get<any>(
//     `/api/request/plant/${context.query.plants}`,
//     headers
//   );
  
  const plantLoc = await instance.get<CMMSPlantLoc>(
    `/api/plantLocation/${context.query.id}`,
    headers
  );

//   const values = await Promise.all([
//     getPlant,
//     getPlantLoc,
//   ]);

//   const p: CMMSBaseType = values[0].data;
//   const l: CMMSPlantLoc = values[1].data;

  

  let props: CreateFeedbackProps = {
    plantLoc: plantLoc.data,
  };

  return {
    props: props,
  };
};
