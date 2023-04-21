import React from "react";
import {
    ModuleContent,
    ModuleDivider,
    ModuleFooter,
    ModuleHeader,
    ModuleMain,
} from "../../../components";
import Link from "next/link";
import RequestContainer, {RequestProps} from "../../../components/Request/RequestContainer";
import { GetServerSideProps, GetServerSidePropsContext } from "next";
import axios from "axios";
import { CMMSUser, CMMSRequestTypes, CMMSRequest, CMMSFaultTypes } from "../../../types/common/interfaces";

interface CorrenctiveRequestProps {
    requestData: RequestProps;
    linkedRequestData: CMMSRequest;
};

export default function CorrenctiveRequest(props: CorrenctiveRequestProps) {
    return (
        <ModuleMain>
            <ModuleHeader header="Create Corrective Request">
                <Link href="/Request" className="btn btn-secondary">
                    Back
                </Link>
            </ModuleHeader>
            <ModuleContent>
                <RequestContainer requestData={props.requestData} linkedRequestData={props.linkedRequestData} />
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
    const getUser = axios.get<CMMSUser>(`http://${process.env.SERVER}:${process.env.PORT}/api/user`, headers);
    const getRequestTypes = axios.get<CMMSRequestTypes[]>(
        `http://${process.env.SERVER}:${process.env.PORT}/api/request/types`,
        headers
    );
    const getFaultTypes = axios.get<CMMSFaultTypes[]>(
        `http://${process.env.SERVER}:${process.env.PORT}/api/fault/types`,
        headers
    );
    const getSpecificRequest = axios.get(
        `http://${process.env.SERVER}:${process.env.PORT}/api/request/` + context.params?.id,
        headers
    );
    const values = await Promise.all([getUser, getRequestTypes, getFaultTypes, getSpecificRequest]);

    const u: CMMSUser = values[0].data;
    const r: CMMSRequestTypes[] = values[1].data;
    const f: CMMSFaultTypes[] = values[2].data;
    const l: CMMSRequest = values[3].data;

    let props: CorrenctiveRequestProps = { requestData: {user: u, requestTypes: r, faultTypes: f}, linkedRequestData: l };

    return {
        props: props,
    };
};