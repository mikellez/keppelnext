import React from "react";
import { CMMSChecklist } from "../../types/common/interfaces";
import { ChecklistPageProps } from "../../pages/Checklist/New";


const ChecklistDetails = (props: ChecklistPageProps) => {
    console.log(props)
    return (
        <div>
            <h4>{props.checklist?.chl_name}</h4>
        </div>
    );
};

export default ChecklistDetails;