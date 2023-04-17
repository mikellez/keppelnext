import React, { useState, useEffect } from "react";
import { CheckSection } from "../../types/common/classes";
import { ModuleContent, ModuleDivider } from "../";
import { ChecklistPageProps } from "../../pages/Checklist/New";
import ChecklistDetails from "./ChecklistDetails";
import ChecklistViewForm from "./ChecklistViewForm";

const ChecklistPreview = (props: ChecklistPageProps) => {
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
        <>
            <ModuleContent>
                <ChecklistDetails checklist={props.checklist} />
            </ModuleContent>
            <ModuleDivider />
            <ModuleContent>
                <ChecklistViewForm sections={sections} />
            </ModuleContent>
        </>
    );
};

export default ChecklistPreview;
