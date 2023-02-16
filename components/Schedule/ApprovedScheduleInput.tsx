import React from "react";
import RecurrenceSelect from "./RecurrenceSelect";
import AssignToSelect from "./AssignToSelect";
import styles from "../../styles/Schedule.module.scss";
import { AssignedUserOption } from "./AssignToSelect";
import { ActionMeta, MultiValue } from "react-select";
import { minDate } from "./ScheduleModal";

interface ApprovedScheduleInputProps {
    checklistName: string;
    startDate: Date;
    endDate: Date;
    remarks: string;
    plantId: number;
    scheduleId: number;
    onChange: React.ChangeEventHandler<HTMLInputElement | HTMLSelectElement>;
    onAssignedChange: (value: MultiValue<AssignedUserOption>, action: ActionMeta<AssignedUserOption>) => void;
    isComplete?: boolean;
}

const inputRowStyles = {
    fontSize: "12px",
    minHeight: "40px",
    width: "100%",
}

export default function ApprovedScheduleInput(props: ApprovedScheduleInputProps) {

    return (
        // <div className={styles.approvedScheduleInputContainer}>
        <tr 
            className={styles.approvedScheduleInputRow} 
            style={{
                borderBottom: !props.isComplete ? "2px solid #FF0000" : "#ddd",
            }}
        >
            <td ><p style={inputRowStyles}>{props.checklistName}</p></td>

            <td><input 
                className="form-control" 
                name={props.scheduleId + "-startDate"} 
                min={minDate}
                value={props.startDate.toISOString().slice(0, 10)} 
                type="date" 
                onChange={props.onChange} 
                style={inputRowStyles}
            /></td>

            <td><input 
                className="form-control" 
                name={props.scheduleId + "-endDate"}
                min={minDate}
                value={props.endDate.toISOString().slice(0, 10)} 
                type="date" 
                onChange={props.onChange} 
                style={{...inputRowStyles}}
            /></td>

            <td><RecurrenceSelect 
                startDate={props.startDate} 
                endDate={props.endDate} 
                name={props.scheduleId + "-recurringPeriod"}
                onChange={props.onChange}  
                style={inputRowStyles} 
            /></td>

            <td ><AssignToSelect 
                plantId={props.plantId}  
                onChange={props.onAssignedChange}
                style={inputRowStyles}
                name={props.scheduleId.toString()}
            /></td>

            <td><input 
                className="form-control" 
                name={props.scheduleId + "-remarks"}
                value={props.remarks} 
                type="text" 
                onChange={props.onChange} 
                style={inputRowStyles}
            /></td>
        </tr>
        // </div>
    )
}