import React from "react";
import {
    ModuleContent,
    ModuleDivider,
    ModuleFooter,
    ModuleHeader,
    ModuleMain,
} from "../../../components";
import Link from "next/link";
import RequestPreview, { RequestPreviewProps, RequestAction } from "../../../components/Request/RequestPreview";
import axios from "axios";
import { CMMSRequest } from "../../../types/common/interfaces";
import { useRouter } from "next/router";
import { GetServerSideProps, GetServerSidePropsContext } from "next";
import { HiOutlineDownload } from "react-icons/hi";
import TooltipBtn from "../../../components/TooltipBtn";

export default function CompleteRequest(props: RequestPreviewProps) {

    return (
        <ModuleMain>
            <ModuleHeader title="New Request" header="Manage Request">
                <TooltipBtn text="Download PDF">
                    <HiOutlineDownload size={20} />
                </TooltipBtn>
                <Link href="/Request" className="btn btn-secondary">
                    Back
                </Link>
            </ModuleHeader>
            <ModuleContent>
                <RequestPreview request={props.request} />
            </ModuleContent>
        </ModuleMain>
    );
};

export const getServerSideProps: GetServerSideProps = async (context: GetServerSidePropsContext) => {

    const getSpecificRequest = await axios.get<CMMSRequest>(
        "http://localhost:3001/api/request/" + context.params?.id,
    );

    if (!getSpecificRequest.data || ![3].includes(getSpecificRequest.data.status_id as number)) {
        return { 
            redirect: {
                destination: "/404",
            },
            props:{},
        }
    }
    
    return { props: {request: getSpecificRequest.data, action: RequestAction.manage} };
};
