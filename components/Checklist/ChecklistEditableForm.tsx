import React, { useContext } from  "react";
import { CheckSection, CheckRow } from "../../types/common/classes";
import { SectionsContext } from "../../pages/Checklist/Complete/[id]";
import { ModuleDivider } from "../ModuleLayout/ModuleDivider";
import styles from "../../styles/Checklist.module.scss";


const ChecklistEditableForm = (
   
) => {
    const { sections } = useContext(SectionsContext);
    console.log(sections);
    
    return (
        <div>
            {sections.map((section, index) => {
                return <ChecklistEditableFormSection key={section.id} section={section} sectionId={section.id} />
            })}
        </div>
    );
};

const ChecklistEditableFormSection = (
    { section, sectionId }: { section: CheckSection, sectionId: string }
) => {

    return (
        <div>
            <h5>{section.description}</h5>
            <div>
            {
               section.rows.map((row, index) => {
                    return <ChecklistEditableFormRow key={row.id} row={row} rowId={row.id} sectionId={sectionId} />
               })
            }
            </div>
            <ModuleDivider />
        </div>
    );
};

const ChecklistEditableFormRow = (
    { row, rowId, sectionId }: { row: CheckRow, rowId: string, sectionId: string }
) => {
    return (
        <div>
            <h6>{row.description}</h6>
            <div className={styles.checklistViewRow}>
            {
                row.checks.map((check, i) => 
                    <React.Fragment key={check.id}>
                        {check.renderEditableForm(rowId, sectionId, i + 1)}
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

export default ChecklistEditableForm;
export { updateSpecificCheck }