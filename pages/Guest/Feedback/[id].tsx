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
import { useCurrentUser } from "../../../components/SWR";

// let user: boolean = false;

interface CreateFeedbackProps {
  // plant: any;
  plantLoc: CMMSPlantLoc;
}

export default function FeedbackNew(props: CreateFeedbackProps) {
  const router = useRouter();
  // const [modal, setModal] = useState(true);
  const [windowWidth, setWindowWidth] = useState<number>(0);
  const user = useCurrentUser();
  useEffect(() => {
    // console.log(window.innerWidth);
    setWindowWidth(window.innerWidth);
  }, []);

  return (
    <ModuleMain>
      <ModuleHeader
        title="Feedback"
        header="Feedback"
        mobile={windowWidth <= 768}
      ></ModuleHeader>
      <ModuleContent>
        <FeedbackContainer
          requestData={props}
          user={user}
          windowWidth={windowWidth}
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

  //   const getPlant = instance.get<any>(
  //     /api/request/plant/${context.query.plants},
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
