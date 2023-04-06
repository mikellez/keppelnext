import React from  "react";
import { CheckSection, CheckRow } from "../../types/common/classes";

const ChecklistEditableForm = (
    { sections, setSections } : 
    { sections: CheckSection[], setSections: React.Dispatch<React.SetStateAction<CheckSection[]>> }
) => {
    
    const updateSections = (e: React.ChangeEvent) => {
        console.log(e.target)
    }

    return (
        <div>
            {sections.map((section, index) => {
                return <ChecklistEditableFormSection key={index} section={section} onChange={updateSections} />
            })}
        </div>
    )
};

const ChecklistEditableFormSection = (
    { section, onChange }: { section: CheckSection, onChange: React.ChangeEventHandler }
) => {

    return (
        <div>
            {
               section.rows.map((row, index) => {
                    return <ChecklistEditableFormRow key={index} row={row} onChange={onChange} />
               })
            }
        </div>
    )
}

const ChecklistEditableFormRow = (
    { row, onChange }: { row: CheckRow, onChange: React.ChangeEventHandler }
) => {

    return (
        <div>
            {
                row.checks.map((check, index) => {
                    return <React.Fragment key={check.id}>{check.renderEditableForm(onChange)}</React.Fragment>
                })
            }
        </div>
    )
}

export default ChecklistEditableForm;