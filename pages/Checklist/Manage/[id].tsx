import React, { useState, useEffect } from "react";
import { ModuleContent, ModuleMain, ModuleHeader, ModuleFooter } from "../../../components";
import { ChecklistPageProps } from "../New";
import ChecklistDetails from "../../../components/Checklist/ChecklistDetails";
import { createChecklistGetServerSideProps } from "../../../types/common/props";
import { GetServerSideProps } from "next";
import ChecklistViewForm from "../../../components/Checklist/ChecklistViewForm";
import { CheckSection } from "../../../types/common/classes";
import TooltipBtn from "../../../components/TooltipBtn";
import axios from "axios";
import { useRouter } from "next/router";
import ModuleSimplePopup, {SimpleIcon} from "../../../components/ModuleLayout/ModuleSimplePopup";

const manageChecklist = async (id: number, action: string, remarks: string) => {
    return await axios({
        url: `/api/checklist/${action}/${id}`,
        method: "patch",
        data: {remarks: remarks}
    })
    .then(res => res.data)
    .catch(err => console.log(err))
};

const ManageChecklistPage = (props: ChecklistPageProps) => {
    const [sections, setSections] = useState<CheckSection[]>([]);
    const [remarks, setRemarks] = useState<string>("")
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

        manageChecklist(parseInt(router.query.id as string), action, remarks)
            .then(result => {
                setSuccessModal(true);
                setTimeout(() => {
                    router.push("/Checklist")
                }, 1000)
            })
    };

    useEffect(() => {

        if (props.checklist && props.checklist.datajson.length > 0) {
            const sectionsFromJSON = props.checklist.datajson.map((section: any) => {
                return CheckSection.fromJSON(JSON.stringify(section));
            });
            setSections(sectionsFromJSON);
        }
    }, [props.checklist]);

    return (
        <>
        <ModuleMain>
            <ModuleHeader header="Mange Checklist">
            </ModuleHeader>
            <ModuleContent>
                <ChecklistDetails checklist={props.checklist} />
            </ModuleContent>
            <ModuleContent>
                <ChecklistViewForm sections={sections} />
                <textarea
                    className="form-control"
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                ></textarea>
            </ModuleContent>
            <ModuleFooter>
                <TooltipBtn 
                    toolTip={false}
                    onClick={() => handleClick("reject")}
                    disabled={disableBtns}
                >Reject</TooltipBtn>
                <TooltipBtn 
                    toolTip={false} 
                    style={{backgroundColor: "#91BD3A", borderColor: "#91BD3A"}}
                    onClick={() => handleClick("approve")}
                    disabled={disableBtns}
                >Approve</TooltipBtn>
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
const getServerSideProps: GetServerSideProps = createChecklistGetServerSideProps("record", [4]);

export {
    getServerSideProps
}
