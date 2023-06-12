import React, { useContext } from  "react";
import { CheckSection, CheckRow } from "../../types/common/classes";
import { SectionsContext } from "../../pages/Checklist/Complete/[id]";
import { ModuleDivider } from "../ModuleLayout/ModuleDivider";
import styles from "../../styles/Checklist.module.scss";



const ChecklistEditableReassignedForm = ({sections}: {sections: CheckSection[]}) => {
    return (
        <div>
            {sections.map((section, index) => {
                return <ChecklistEditableReassignedFormSection key={section.id} section={section} sectionId={section.id} />
            })}
        </div>
    );
};

const ChecklistEditableReassignedFormSection = ({ section, sectionId }: { section: CheckSection, sectionId: string}
    ) => {

    return (
        <div>
            <h5>{section.description}</h5>
            <div>
            {
               section.rows.map((row, index) => {
                    return <ChecklistEditableReassignedFormRow key={row.id} row={row} rowId={row.id} sectionId={sectionId} />
               })
            }
            </div>
            <ModuleDivider />
        </div>
    );
};

const ChecklistEditableReassignedFormRow = ({ row, rowId, sectionId }: { row: CheckRow, rowId: string, sectionId: string }
    ) => {
    return (
        <div>
            <h6>{row.description}</h6>
                <div className={styles.checklistViewRow}>
                {
                    row.checks.map(check => 
                        <React.Fragment key={check.id}>
                            {check.renderReassignedEditableForm(rowId, sectionId)}
                        </React.Fragment>
                    )
                }
                </div>
        </div>
    );
};

const updateSpecificCheck = (
    sectionId: string, 
    rowId: string, 
    checkId: string, 
    value: string, 
    setSections: React.Dispatch<React.SetStateAction<CheckSection[]>>
) => {
    setSections((prevSections) => {
        const newSections = [...prevSections];
        newSections.forEach(section => {
            if (section.id === sectionId) {
                section.updateSection(rowId, checkId, value)
            }
        })
        return newSections;
    });
};

export default ChecklistEditableReassignedForm;
export { updateSpecificCheck }