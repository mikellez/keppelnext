import React from "react";
import { CheckSection, CheckRow } from "../../types/common/classes";
import { ModuleDivider } from "../ModuleLayout/ModuleDivider";
import styles from "../../styles/Checklist.module.scss";

const ChecklistViewForm = ({sections}: {sections: CheckSection[]}) => {
    return (
        <div>
            {sections.map((section, index) => {
                return <ChecklistViewFormSection key={section.id} section={section} />
            })}
        </div>
    ); 
};

const ChecklistViewFormSection = ({section}: {section: CheckSection}) => {

    return (
        <div>
            <h5>{section.description}</h5>
            <div className={styles.checklistViewSection}>
            {
               section.rows.map((row, index) => {
                    return <ChecklistViewFormRow key={row.id} row={row} />
               })
            }
            </div>
            <ModuleDivider />
        </div>
    );
};

const ChecklistViewFormRow = ({row}: {row: CheckRow}) => {
    return (
        <React.Fragment>{row.checks.map(check => check.renderViewOnlyForm())}</React.Fragment>
    );
};

export default ChecklistViewForm;
