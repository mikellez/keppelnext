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
} from "../../../../../types/common/interfaces";
import { GetServerSideProps, GetServerSidePropsContext } from "next";
import Link from "next/link";
import { RequestProps } from "../../../../../components/Request/RequestContainer";
import RequestGuestContainer from "../../../../../components/Request/RequestGuestContainer";
import FeedbackContainer from "../../../../../components/Guest/FeedbackContainer";
import ModuleSimplePopup from "../../../../../components/ModuleLayout/ModuleSimplePopup";

let user: boolean = false;

export default function RequestNew(props: RequestProps) {
  const router = useRouter();
  const [userbool, setUserbool] = useState(false);
  const [modal, setModal] = useState(true);
  console.log(props);
  useEffect(() => {
    instance
      .get<CMMSUser>(`/api/user`)
      .then((response) => {
        console.log(response.data);
        console.log(1);
        setUserbool(true);
        console.log(userbool);
        return true;
      })
      .catch((e) => {
        console.log(e);
        console.log(2);
        console.log(userbool);
        return false;
      });
  }, []);

  return (
    <ModuleMain>
      <ModuleHeader title="Feedback" header="Feedback"></ModuleHeader>
      <ModuleContent>
        {modal && (
          <ModuleSimplePopup
            modalOpenState={modal}
            setModalOpenState={() => setModal(true)}
            title="Please login if you have an account."
            icon={4}
            buttons={
              <div>
                <button className="btn btn-primary">Login</button>
                <button className="btn btn-primary">Use Guest Account</button>
              </div>
            }
          ></ModuleSimplePopup>
          //   <ModuleModal isOpen={modal} closeModal={() => setModal(true)}>
          //     <p>Please login if you have an account.</p>

          //   </ModuleModal>
        )}
        <FeedbackContainer requestData={props} user={userbool} />
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
  const getRequestTypes = instance.get<CMMSRequestTypes[]>(
    `/api/request/types`,
    headers
  );
  const getFaultTypes = instance.get<CMMSFaultTypes[]>(
    `/api/fault/types`,
    headers
  );
  const getPlant = instance.get<any>(
    `/api/request/plant/${context.query.plants}`,
    headers
  );
  const getAsset = instance.get<any>(
    `/api/request/asset/${context.query.id}`,
    headers
  );

  const values = await Promise.all([
    getRequestTypes,
    getFaultTypes,
    getPlant,
    getAsset,
  ]);

  const r: CMMSRequestTypes[] = values[0].data;
  const f: CMMSFaultTypes[] = values[1].data;
  const p: CMMSBaseType = values[2].data;
  const a: CMMSBaseType = values[3].data;

  interface GuestRequestProps {
    requestTypes: CMMSRequestTypes[];
    faultTypes: CMMSFaultTypes[];
    plant: any;
    asset: any;
  }

  let props: GuestRequestProps = {
    requestTypes: r,
    faultTypes: f,
    plant: p,
    asset: a,
  };

  return {
    props: props,
  };
};
