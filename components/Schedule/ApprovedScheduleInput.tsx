import React from "react";
import RecurrenceSelect from "./RecurrenceSelect";
import AssignToSelect from "./AssignToSelect";
import styles from "../../styles/Schedule.module.scss";
import { AssignedUserOption } from "./AssignToSelect";
import { ActionMeta, MultiValue, SingleValue } from "react-select";
import { minDate } from "./ScheduleModal";
import { CMMSSchedule } from "../../types/common/interfaces";
import Schedule from "../../pages/Schedule";

interface ApprovedScheduleInputProps {
    plantId: number;
    schedule: CMMSSchedule;
    onChange: React.ChangeEventHandler<HTMLInputElement | HTMLSelectElement>;
    onAssignedChange: (
        value: MultiValue<AssignedUserOption> | SingleValue<AssignedUserOption>,
        action: ActionMeta<AssignedUserOption>
    ) => void;
}

const inputRowStyles = {
    fontSize: "12px",
    minHeight: "40px",
    width: "100%",
};

export default function ApprovedScheduleInput(props: ApprovedScheduleInputProps) {
    return (
        <tr
            className={styles.approvedScheduleInputRow}
            style={{
                borderBottom: !props.schedule.isComplete ? "2px solid #FF0000" : "#ddd",
            }}
        >
            <td>
                <p style={inputRowStyles}>{props.schedule.checklistName}</p>
            </td>

            <td>
                <input
                    className="form-control"
                    name={props.schedule.scheduleId + "-startDate"}
                    min={minDate}
                    value={new Date(props.schedule.startDate).toISOString().slice(0, 10)}
                    type="date"
                    onChange={props.onChange}
                    style={inputRowStyles}
                    onKeyDown={(e) => e.preventDefault()}
                />
            </td>

            <td>
                <input
                    className="form-control"
                    name={props.schedule.scheduleId + "-endDate"}
                    min={minDate}
                    value={new Date(props.schedule.endDate).toISOString().slice(0, 10)}
                    type="date"
                    onChange={props.onChange}
                    style={{ ...inputRowStyles }}
                    onKeyDown={(e) => e.preventDefault()}
                />
            </td>

            <td>
                <RecurrenceSelect
                    startDate={new Date(props.schedule.startDate)}
                    endDate={new Date(props.schedule.endDate)}
                    name={props.schedule.scheduleId + "-recurringPeriod"}
                    onChange={props.onChange}
                    style={inputRowStyles}
                    value={props.schedule.recurringPeriod}
                />
            </td>

            <td>
                <AssignToSelect
                    plantId={props.plantId}
                    onChange={props.onAssignedChange}
                    style={inputRowStyles}
                    name={props.schedule.scheduleId!.toString()}
                    defaultIds={props.schedule.assignedIds}
                    isSingle
                />
            </td>

            <td>
                <input
                    className="form-control"
                    name={props.schedule.scheduleId + "-remarks"}
                    value={props.schedule.remarks}
                    type="text"
                    onChange={props.onChange}
                    style={inputRowStyles}
                />
            </td>
        </tr>
    );
}
