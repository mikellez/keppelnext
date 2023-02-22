import React, { useState, useEffect } from "react";
import { CMMSChecklist } from "../../types/common/interfaces";
import axios from "axios";

interface ChecklistSelectProps {
    onChange: React.ChangeEventHandler<HTMLSelectElement>;
    name?: string;
}

// Axios call to get all checklist templates
async function getChecklistTemplates() {
    return await axios
        .get<CMMSChecklist[]>("/api/checklist/templateNames")
        .then((res) => {
            return res.data;
        })
        .catch((err) => console.log(err.message));
}

const ChecklistSelect = (props: ChecklistSelectProps) => {
    // Store checklist templates in a state for dropdown
    const [checklistTemplates, setChecklistTemplates] = useState<CMMSChecklist[]>([]);

    // Calls an api on load to get the list of checklist templates
    useEffect(() => {
        getChecklistTemplates().then((checklist) => {
            if (checklist == null) {
                return console.log("no checklist");
            }
            setChecklistTemplates(checklist);
        });
    }, []);

    // Checklist dropdown options
    const checklistOptions = checklistTemplates.map((checklist) => (
        <option key={checklist.checklist_id} value={checklist.checklist_id}>
            {checklist.chl_name}
        </option>
    ));

    return (
        <select className="form-select" onChange={props.onChange} name={props.name}>
            <option hidden>Select checklist</option>
            {checklistOptions}
        </select>
    );
};

export default ChecklistSelect;