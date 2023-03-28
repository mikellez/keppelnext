import React, { useState } from "react";
import {
    ModuleContent,
    ModuleDivider,
    ModuleFooter,
    ModuleHeader,
    ModuleMain,
} from "../../../components";
import ModuleSimplePopup, { SimpleIcon } from "../../../components/ModuleLayout/ModuleSimplePopup";
import Link from "next/link";
import RequestPreview, { RequestPreviewProps, RequestAction } from "../../../components/Request/RequestPreview";
import axios from "axios";
import { CMMSRequest } from "../../../types/common/interfaces";
import { useRouter } from "next/router";
import { GetServerSideProps, GetServerSidePropsContext } from "next";
import { HiOutlineDownload } from "react-icons/hi";
import TooltipBtn from "../../../components/TooltipBtn";

const manageRequest = async (id: number, status: number) => {
    return await axios.patch(`/api/request/${id}/${status}`)
        .then(res => {
            return res.data
        })
        .catch(err => console.log(err));
};

export default function CompleteRequest(props: RequestPreviewProps) {
    const [modal, setModal] = useState<boolean>(false);
    const router = useRouter();
    const { id } = router.query;

    const handleClick = (status: number) => {
        manageRequest(parseInt(id as string), status).then(result => {
            setModal(true);
            router.push("/Request");
        })
    };

    return (
        <>
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
                    <RequestPreview request={props.request} action={RequestAction.manage} />
                    <TooltipBtn onClick={() => handleClick(4)} toolTip={false}>
                        Approve
                    </TooltipBtn>
                    <TooltipBtn onClick={() => handleClick(5)} toolTip={false}>
                        Reject
                    </TooltipBtn>
                </ModuleContent>
            </ModuleMain>
            <ModuleSimplePopup
                modalOpenState={modal}
                setModalOpenState={setModal}
                text="Your action has been successfully recorded"
                title="Success"
                icon={SimpleIcon.Check}
            />
        </>
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
