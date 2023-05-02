import React, { useState } from "react";
import { ModuleContent, ModuleMain, ModuleHeader, ModuleFooter } from "../../../components";
import { ChecklistPageProps } from "../Form";
import { createChecklistGetServerSideProps } from "../../../types/common/props";
import { GetServerSideProps } from "next";
import Link from "next/link";
import TooltipBtn from "../../../components/TooltipBtn";
import instance from '../../axios.config.js';
import { useRouter } from "next/router";
import ModuleSimplePopup, { SimpleIcon } from "../../../components/ModuleLayout/ModuleSimplePopup";
import { HiOutlineDownload } from "react-icons/hi";
import ChecklistPreview from "../../../components/Checklist/ChecklistPreview";
import { downloadChecklistPDF } from "../View/[id]";

const manageChecklist = async (id: number, action: string, remarks: string) => {
    return await instance({
        url: `/api/checklist/${action}/${id}`,
        method: "patch",
        data: { remarks: remarks },
    })
        .then((res) => res.data)
        .catch((err) => console.log(err));
};

const ManageChecklistPage = (props: ChecklistPageProps) => {
    const [remarks, setRemarks] = useState<string>("");
    const [missingRemarksModal, setMissingRemarksModal] = useState<boolean>(false);
    const [successModal, setSuccessModal] = useState<boolean>(false);
    const [disableBtns, setDisableBtns] = useState<boolean>(false);
    const router = useRouter();

    const handleClick = (action: string) => {
        setDisableBtns(true);

        if (action === "reject" && remarks.trim() === "") {
            setMissingRemarksModal(true);
            setDisableBtns(false);
            return;
        }

        manageChecklist(parseInt(router.query.id as string), action, remarks).then((result) => {
            setSuccessModal(true);
            setTimeout(() => {
                router.push("/Checklist");
            }, 1000);
        });
    };

    return (
        <>
            <ModuleMain>
                <ModuleHeader header="Mange Checklist">
                    <TooltipBtn
                        text="Download PDF"
                        onClick={() => downloadChecklistPDF(parseInt(router.query.id as string))}
                    >
                        <HiOutlineDownload size={24} />
                    </TooltipBtn>
                    <Link href="/Checklist" className="btn btn-secondary">
                        Back
                    </Link>
                </ModuleHeader>
                <ChecklistPreview checklist={props.checklist} />
                <ModuleContent>
                    <label>Remarks</label>
                    <textarea
                        className="form-control"
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                        rows={2}
                        maxLength={100}
                        style={{ resize: "none" }}
                    ></textarea>
                </ModuleContent>
                <ModuleFooter>
                    <TooltipBtn
                        toolTip={false}
                        onClick={() => handleClick("reject")}
                        disabled={disableBtns}
                    >
                        Reject
                    </TooltipBtn>
                    <TooltipBtn
                        toolTip={false}
                        style={{ backgroundColor: "#91BD3A", borderColor: "#91BD3A" }}
                        onClick={() => handleClick("approve")}
                        disabled={disableBtns}
                    >
                        Approve
                    </TooltipBtn>
                </ModuleFooter>
            </ModuleMain>

            <ModuleSimplePopup
                setModalOpenState={setMissingRemarksModal}
                modalOpenState={missingRemarksModal}
                text="Please fill in the remarks"
                title="Missing remarks"
                icon={SimpleIcon.Exclaim}
            />

            <ModuleSimplePopup
                setModalOpenState={setSuccessModal}
                modalOpenState={successModal}
                text="Success"
                title="Your action has been recorded"
                icon={SimpleIcon.Check}
            />
        </>
    );
};

export default ManageChecklistPage;
const getServerSideProps: GetServerSideProps = createChecklistGetServerSideProps([4]);

export { getServerSideProps };
