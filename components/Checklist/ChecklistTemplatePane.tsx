import React, { useState, useEffect } from "react";
import { CMMSChecklist } from "../../types/common/interfaces";
import { CheckSection } from "../../types/common/classes";
import styles from "../../styles/Checklist.module.scss"
import ChecklistViewForm from "./ChecklistViewForm";
import { ModuleDivider } from "../ModuleLayout/ModuleDivider";

const ChecklistTemplatePane = ({checklist}: {checklist: CMMSChecklist}) => {
    const [sections, setSections] = useState<CheckSection[]>([]);

    useEffect(() => {
        if (checklist && checklist.datajson.length > 0) {
            const sectionsFromJSON = checklist.datajson.map((section: any) => {
                return CheckSection.fromJSON(JSON.stringify(section));
            });
            setSections(sectionsFromJSON);
        } else setSections([]);
    }, [checklist]);
    
    return (
        checklist &&
        <div className={styles.checklistTemplatePaneContainer}>
            <p className={styles.checklistTemplatePaneTitle}>{checklist.chl_name}</p>
            <p className={styles.checklistTemplatePaneHeading}>Description</p>
            <p>{checklist.description}</p>
            <ModuleDivider />
            <ChecklistViewForm sections={sections} />
        </div>
    );
};

export default ChecklistTemplatePane;