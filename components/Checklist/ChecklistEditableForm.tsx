import React, { useContext } from  "react";
import { CheckSection, CheckRow } from "../../types/common/classes";
import { SectionsContext } from "../../pages/Checklist/Complete/[id]";

const ChecklistEditableForm = (
   
) => {
    const { sections, setSections } = useContext(SectionsContext);

    return (
        <div>
            {sections.map((section, index) => {
                return <ChecklistEditableFormSection key={section.id} section={section} sectionId={section.id} />
            })}
        </div>
    )
};

const ChecklistEditableFormSection = (
    { section, sectionId }: { section: CheckSection, sectionId: string }
) => {

    return (
        <div>
            {
               section.rows.map((row, index) => {
                    return <ChecklistEditableFormRow key={row.id} row={row} rowId={row.id} sectionId={sectionId} />
               })
            }
        </div>
    )
}

const ChecklistEditableFormRow = (
    { row, rowId, sectionId }: { row: CheckRow, rowId: string, sectionId: string }
) => {

    const { sections, setSections } = useContext(SectionsContext);

    const updateSections = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSections((prevSections) => {
            const newSections = [...prevSections];
            newSections.forEach(section => {
                if (section.id === sectionId) {
                    section.updateSection(rowId, e.target.name, e.target.value)
                }
            })
            return newSections;
        });
    };

    console.log(sections)

    return (
        <div>
            {
                row.checks.map((check, index) => {
                    return <React.Fragment key={check.id}>{check.renderEditableForm(updateSections)}</React.Fragment>
                })
            }
        </div>
    )
}

export default ChecklistEditableForm;