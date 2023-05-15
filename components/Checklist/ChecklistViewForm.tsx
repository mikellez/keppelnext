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
            <div>
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
        <div>
            <h6>{row.description}</h6>
                <div className={styles.checklistViewRow}>
                {
                    row.checks.map(check => 
                        <React.Fragment key={check.id}>
                            {check.renderViewOnlyForm()}
                        </React.Fragment>
                    )
                }
                </div>
        </div>
    );
};

export default ChecklistViewForm;
