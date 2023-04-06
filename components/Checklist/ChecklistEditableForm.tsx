import React from  "react";
import { CheckSection, CheckRow } from "../../types/common/classes";

const ChecklistEditableForm = ({ sections } : { sections: CheckSection[] }) => {
    
    

    return (
        <div>
            {sections.map((section, index) => {
                return <ChecklistEditableFormSection key={index} section={section} />
            })}
        </div>
    )
};

const ChecklistEditableFormSection = ({ section }: { section: CheckSection }) => {

    return (
        <div>
            {
               section.rows.map((row, index) => {
                    return <ChecklistEditableFormRow key={index} row={row} />
               })
            }
        </div>
    )
}

const ChecklistEditableFormRow = ({ row }: { row: CheckRow }) => {

    return (
        <div>
            {
                row.checks.map((check, index) => {
                    return <React.Fragment key={check.id}>{check.render(() => {}, () => {})}</React.Fragment>
                })
            }
        </div>
    )
}

export default ChecklistEditableForm;