import React, { useContext } from  "react";
import { CheckSection, CheckRow } from "../../types/common/classes";
import { SectionsContext } from "../../pages/Checklist/Complete/[id]";

const ChecklistEditableForm = (
   
) => {
    const { sections } = useContext(SectionsContext);
    console.log(sections)
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
            {
               section.rows.map((row, index) => {
                    return <ChecklistEditableFormRow key={row.id} row={row} rowId={row.id} sectionId={sectionId} />
               })
            }
        </div>
    );
};

const ChecklistEditableFormRow = (
    { row, rowId, sectionId }: { row: CheckRow, rowId: string, sectionId: string }
) => {

    return (
        <div>
            {
                row.checks.map((check, index) => {
                    return <React.Fragment key={check.id}>{check.renderEditableForm(rowId, sectionId)}</React.Fragment>
                })
            }
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