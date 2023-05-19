
import React, { useEffect, useState } from "react";
import instance from '../../../../axios.config.js';
import { useRouter } from "next/router";

import {
    ModuleContent,
    ModuleDivider,
    ModuleFooter,
    ModuleHeader,
    ModuleMain,
} from "../../../../components";

import {
    CMMSBaseType,
    CMMSRequestTypes,
    CMMSFaultTypes,
    CMMSUser,
} from "../../../../types/common/interfaces";
import { GetServerSideProps, GetServerSidePropsContext } from "next";
import Link from "next/link";
import {RequestProps } from "../../../../components/Request/RequestContainer";
import RequestGuestContainer from "../../../../components/Request/RequestGuestContainer";

// import RequestGuestContainer from "../../../../components/Request/RequestGuestContainer.jsx";

export default function RequestNew(props: RequestProps) {
    const router = useRouter();

    return (
        <ModuleMain>
            <ModuleHeader title="New Request" header="Create New Request">
                <Link href="/Request" className="btn btn-secondary">
                    Back
                </Link>
            </ModuleHeader>
            <ModuleContent>
                <RequestGuestContainer requestData={props} plant ={+router.query.plants!} asset ={+router.query.id!}/>
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

    const values = await Promise.all([
        getRequestTypes, getFaultTypes]);

    const r: CMMSRequestTypes[] = values[0].data;
    const f: CMMSFaultTypes[] = values[1].data;


    interface GuestRequestProps {
        requestTypes: CMMSRequestTypes[];
        faultTypes: CMMSFaultTypes[];
    }

    let props: GuestRequestProps = { 
        requestTypes: r, faultTypes: f};

    return {
        props: props,
    };
};
