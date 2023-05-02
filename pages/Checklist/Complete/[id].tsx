import React, { useState, useEffect, createContext } from "react";
import {
    ModuleContent,
    ModuleMain,
    ModuleHeader,
    ModuleFooter,
    ModuleDivider,
} from "../../../components";
import { GetServerSideProps, GetServerSidePropsContext } from "next";
import ChecklistDetails from "../../../components/Checklist/ChecklistDetails";
import TooltipBtn from "../../../components/TooltipBtn";
import { ChecklistPageProps } from "../Form";
import { createChecklistGetServerSideProps } from "../../../types/common/props";
import { CheckSection } from "../../../types/common/classes";
import ChecklistEditableForm from "../../../components/Checklist/ChecklistEditableForm";
import ModuleSimplePopup, { SimpleIcon } from "../../../components/ModuleLayout/ModuleSimplePopup";
import { HiOutlineDownload } from "react-icons/hi";
import { useRouter } from "next/router";
import axios from "axios";
import Link from "next/link";
import { downloadChecklistPDF } from "../View/[id]";

export const SectionsContext = createContext({
    sections: [] as CheckSection[],
    setSections: (() => {}) as React.Dispatch<React.SetStateAction<CheckSection[]>>,
});

const submitCompletedChecklist = async (data: CheckSection[], id: number) => {
    return await axios({
        url: "/api/checklist/complete/" + id,
        method: "patch",
        data: {
            datajson: JSON.stringify(data.map((section) => section.toJSON())),
        },
    })
        .then((res) => res.data)
        .catch((err) => console.log(err));
};

const CompleteChecklistPage = (props: ChecklistPageProps) => {
    const [sections, setSections] = useState<CheckSection[]>([]);
    const [disableSubmit, setDisableSubmit] = useState<boolean>(false);
    const [successModal, setSuccessModal] = useState<boolean>(false);
    const [incompleteModal, setIncompleteModal] = useState<boolean>(false);

    const router = useRouter();

    useEffect(() => {
        if (props.checklist && props.checklist.datajson.length > 0) {
            const sectionsFromJSON = props.checklist.datajson.map((section: any) => {
                return CheckSection.fromJSON(JSON.stringify(section));
            });
            setSections(sectionsFromJSON);
        }
    }, [props.checklist]);

    const handleSubmit = () => {
        setDisableSubmit(false);

        if (!isCompleteChecklist()) {
            setIncompleteModal(true);
            setDisableSubmit(false);
            return;
        }

        submitCompletedChecklist(sections, parseInt(router.query.id as string)).then((result) => {
            setSuccessModal(true);
            setTimeout(() => {
                router.push("/Checklist");
            }, 1000);
        });
    };

    console.log(sections);

    const isCompleteChecklist = () => {
        return sections.every((section) => section.isComplete());
    };

    return (
        <>
            <ModuleMain>
                <ModuleHeader header="Complete Checklist">
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
                <ModuleContent>
                    <ChecklistDetails checklist={props.checklist} />
                </ModuleContent>
                <ModuleDivider />
                <ModuleContent>
                    <SectionsContext.Provider value={{ sections, setSections }}>
                        <ChecklistEditableForm />
                    </SectionsContext.Provider>
                </ModuleContent>
                <ModuleFooter>
                    <TooltipBtn toolTip={false} onClick={handleSubmit} disabled={disableSubmit}>
                        Submit
                    </TooltipBtn>
                </ModuleFooter>
            </ModuleMain>

            <ModuleSimplePopup
                modalOpenState={successModal}
                setModalOpenState={setSuccessModal}
                icon={SimpleIcon.Check}
                title="Completed"
                text="Checklist is successfully completed"
            />

            <ModuleSimplePopup
                modalOpenState={incompleteModal}
                setModalOpenState={setIncompleteModal}
                icon={SimpleIcon.Exclaim}
                title="Incomplete checklist"
                text="Please ensure that all fields have been filled"
            />
        </>
    );
};

export default CompleteChecklistPage;
const getServerSideProps: GetServerSideProps = createChecklistGetServerSideProps([2, 3]);

export { getServerSideProps };
