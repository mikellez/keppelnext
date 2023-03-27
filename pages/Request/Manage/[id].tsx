import React from "react";
import {
    ModuleContent,
    ModuleDivider,
    ModuleFooter,
    ModuleHeader,
    ModuleMain,
} from "../../../components";
import Link from "next/link";
import RequestPreview, { RequestPreviewProps } from "../../../components/Request/RequestPreview";
import axios from "axios";
import { CMMSRequest } from "../../../types/common/interfaces";
import { useRouter } from "next/router";
import { getServerSideProps } from "../Complete/[id]";
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

export { getServerSideProps };
