import React, { useState, useEffect } from "react";
import { ModuleContent, ModuleMain, ModuleHeader, ModuleFooter } from "../../../components";
import { ChecklistPageProps } from "../New";
import ChecklistDetails from "../../../components/Checklist/ChecklistDetails";
import { createChecklistGetServerSideProps } from "../../../types/common/props";
import { GetServerSideProps } from "next";
import ChecklistViewForm from "../../../components/Checklist/ChecklistViewForm";
import { CheckSection } from "../../../types/common/classes";
import TooltipBtn from "../../../components/TooltipBtn";
import { ToolPanelComponent } from "ag-grid-community/dist/lib/components/framework/componentTypes";


const ManageChecklistPage = (props: ChecklistPageProps) => {
    const [sections, setSections] = useState<CheckSection[]>([]);

    useEffect(() => {
        if (props.checklist && props.checklist.datajson.length > 0) {
            const sectionsFromJSON = props.checklist.datajson.map((section: any) => {
                return CheckSection.fromJSON(JSON.stringify(section));
            });
            setSections(sectionsFromJSON);
        }
    }, [props.checklist]);

    return (
        <ModuleMain>
            <ModuleHeader header="Mange Checklist">
            </ModuleHeader>
            <ModuleContent>
                <ChecklistDetails checklist={props.checklist} />
            </ModuleContent>
            <ModuleContent>
                <ChecklistViewForm sections={sections} />
            </ModuleContent>
            <ModuleFooter>
                <TooltipBtn 
                    toolTip={false}
                >Reject</TooltipBtn>
                <TooltipBtn 
                    toolTip={false} 
                    style={{backgroundColor: "#91BD3A", borderColor: "#91BD3A"}}
                >Approve</TooltipBtn>
            </ModuleFooter>
        </ModuleMain>
    );
};

export default ManageChecklistPage;
const getServerSideProps: GetServerSideProps = createChecklistGetServerSideProps("record", [4]);

export {
    getServerSideProps
}
