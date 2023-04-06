import React, { useState, useEffect } from "react";
import { ModuleContent, ModuleMain, ModuleHeader, ModuleFooter } from "../../../components";
import { GetServerSideProps, GetServerSidePropsContext } from "next";
import ChecklistDetails from "../../../components/Checklist/ChecklistDetails";
import TooltipBtn from "../../../components/TooltipBtn";
import { ChecklistPageProps } from "../New";
import { createChecklistGetServerSideProps } from "../../../types/common/props";
import { CheckSection } from "../../../types/common/classes";
import ChecklistEditableForm from "../../../components/Checklist/ChecklistEditableForm";


const CompleteChecklistPage = (props: ChecklistPageProps) => {
    const [sections, setSections] = useState<CheckSection[]>([]);

    useEffect(() => {
        if (props.checklist && props.checklist.datajson.length > 0) {
            const sectionsFromJSON = props.checklist.datajson.map((section: any) => {
                return CheckSection.fromJSON(JSON.stringify(section));
            });
            setSections(sectionsFromJSON)
        }
    }, [props.checklist]);

    return (
        <ModuleMain>
            <ModuleHeader header="Complete Checklist">
            </ModuleHeader>
            <ModuleContent>
                <ChecklistDetails checklist={props.checklist} />
            </ModuleContent>
            <ModuleContent>
                <ChecklistEditableForm sections={sections} setSections={setSections} />
            </ModuleContent>
            <ModuleFooter>
                <TooltipBtn toolTip={false}>Submit</TooltipBtn>
            </ModuleFooter>
        </ModuleMain>
    );
};

export default CompleteChecklistPage;
const getServerSideProps: GetServerSideProps = createChecklistGetServerSideProps("record");

export {
    getServerSideProps
}

