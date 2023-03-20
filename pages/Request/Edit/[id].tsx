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
} from "../../../types/common/interfaces";
import { GetServerSideProps, GetServerSidePropsContext } from "next";
import Link from "next/link";
import RequestContainer from "../../../components/Request/RequestContainer";
import { RequestProps } from "../New";

export default function EditRequestPage(props: RequestProps) {
    const router = useRouter();
    const requestId = router.query.id;

    return (
        <ModuleMain>
            <ModuleHeader title="New Request" header="Create New Request">
                <Link href="/Request" className="btn btn-secondary">
                    Back
                </Link>
            </ModuleHeader>
            <ModuleContent>
                <RequestContainer isEdit={false} requestData={props} />
            </ModuleContent>
        </ModuleMain>
    );
};

export const getServerSideProps: GetServerSideProps = async (
    context: GetServerSidePropsContext
) => {
    const headers = {
        withCredentials: true,
        headers: {
            Cookie: context.req.headers.cookie,
        },
    };

    const getUser = axios.get<CMMSUser>("http://localhost:3001/api/user", headers);
    const getRequestTypes = axios.get<CMMSRequestTypes[]>(
        "http://localhost:3001/api/request/types",
        headers
    );
    const getFaultTypes = axios.get<CMMSFaultTypes[]>(
        "http://localhost:3001/api/fault/types",
        headers
    );

    const values = await Promise.all([getUser, getRequestTypes, getFaultTypes]);

    const u: CMMSUser = values[0].data;
    const r: CMMSRequestTypes[] = values[1].data;
    const f: CMMSFaultTypes[] = values[2].data;

    let props: RequestProps = { user: u, requestTypes: r, faultTypes: f };

    return {
        props: props,
    };
};