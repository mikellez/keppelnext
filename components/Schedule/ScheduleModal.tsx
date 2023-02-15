import React, { useEffect, useState } from "react";
import ModuleModal, { ModalProps } from "../ModuleLayout/ModuleModal";
import { CMMSTimeline, CMMSSchedule } from "../../types/common/interfaces";
import ChecklistSelect from "../Checklist/ChecklistSelect";
import RecurrenceSelect from "./RecurrenceSelect";
import AssignToSelect, { AssignedUserOption } from "./AssignToSelect";
import TooltipBtn from "./TooltipBtn";
import styles from "../../styles/Schedule.module.scss";
import ModuleSimplePopup, { SimpleIcon } from "../ModuleLayout/ModuleSimplePopup";
import { useRouter } from "next/router";
import axios from "axios";

interface ScheduleMaintenanceModalProps extends ModalProps {
    timeline: CMMSTimeline
};

// Makes a post request to schedule a new maintenance
async function ScheduleMaintenance(schedule: CMMSSchedule) {
    return await axios.post("/api/insertSchedule", { schedule })
        .then(res => {
            console.log(res);
        })
        .catch(err => {
            console.log(err);
        })
}

export default function ScheduleMaintenanceModal(props: ScheduleMaintenanceModalProps) {
    const [newSchedule, setNewSchedule] = useState<CMMSSchedule>({} as CMMSSchedule);
    const [successModal, setSuccessModal] = useState<boolean>(false);
    const [failureModal, setFailureModal] = useState<boolean>(false);

    const router = useRouter();

    // Set the min date to to tomorrow
    const today = new Date();
    const minDate = new Date (today.setDate(today.getDate() + 1)).toISOString().slice(0, 10);

    // Update the state of newSchedule on change of input fields
    function updateSchedule(event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement | HTMLSelectElement>) {
        setNewSchedule(prev => {
            const value = event.target.type === "date" ? 
            new Date(event.target.value) : 
            (event.target.name === "checklistId" || event.target.name === "recurringPeriod" || event.target.name === "reminderRecurrence") ? 
            parseInt(event.target.value) : 
            event.target.value
            return {
                ...prev,
                [event.target.name]: value,
            }
        })
    };

    // Submit the new schedule for maintenance on submit click
    function handleSubmit() {
        // Check for missing entries
        if (!newSchedule.checklistId || 
            !newSchedule.startDate || 
            !newSchedule.endDate || 
            !newSchedule.checklistId ||
            !newSchedule.recurringPeriod ||
            !newSchedule.reminderRecurrence ||
            !newSchedule.assignedIds ||
            !newSchedule.remarks
        ) {
            setFailureModal(true);
        } else {
            ScheduleMaintenance(newSchedule).then(result => {
            setSuccessModal(true);
            setTimeout(() => {
                router.replace("/Schedule/Timeline/" + props.timeline.id);
            }, 1000);
            });
        }
    };

    useEffect(() => {
        setNewSchedule({ 
            plantId: props.timeline.plantId, 
            timelineId: props.timeline.id,
        } as CMMSSchedule)
    }, [props.timeline]);

    return (
        <ModuleModal isOpen={props.isOpen} title={props.title} closeModal={props.closeModal}>
           <table className={styles.eventModalTable}>
                            <tbody>
                                <tr className={styles.eventModalTableRow}>
                                    <th>Checklist Name:</th>
                                    <td><ChecklistSelect onChange={updateSchedule} name="checklistId" /></td>
                                </tr>
                                <tr className={styles.eventModalTableRow}>
                                    <th>Plant:</th>
                                    <td>{props.timeline.plantName}</td>
                                </tr>
                                <tr className={styles.eventModalTableRow}>
                                    <th>Start Date:</th>
                                    <td>
                                        <input 
                                            className="form-control" 
                                            type="date" 
                                            min={minDate} 
                                            name="startDate"
                                            value={newSchedule.startDate ? newSchedule.startDate.toISOString().slice(0, 10) : minDate}
                                            onChange={updateSchedule}
                                        />
                                    </td>
                                </tr>
                                <tr className={styles.eventModalTableRow}>
                                    <th>End Date:</th>
                                    <td>
                                        <input 
                                            className="form-control" 
                                            type="date" 
                                            min={minDate} 
                                            name="endDate"
                                            value={newSchedule.endDate ? newSchedule.endDate.toISOString().slice(0, 10) : minDate}
                                            onChange={updateSchedule}
                                        />
                                    </td>
                                </tr>
                                <tr className={styles.eventModalTableRow}>
                                    <th>Recurring Period:</th>
                                    <td>
                                        <RecurrenceSelect 
                                            startDate={newSchedule.startDate}
                                            endDate={newSchedule.endDate}
                                            name="recurringPeriod" 
                                            onChange={updateSchedule}
                                        />
                                    </td>
                                </tr>
                                <tr className={styles.eventModalTableRow}>
                                    <th>Reminder Frequency:</th>
                                    <td>
                                        <select className="form-select" name="reminderRecurrence" onChange={updateSchedule} >
                                            <option hidden>Select the Reminder Frequency</option>
                                            <option value={1}>1 Day Before</option>
                                            <option value={0}>No Reminders</option>
                                        </select>
                                    </td>
                                </tr>
                                <tr className={styles.eventModalTableRow}>
                                    <th>Assigned To:</th>
                                    <td><AssignToSelect
                                        onChange={(value, action) => {
                                            setNewSchedule(prev => {
                                                const newData = {...prev};
                                                const ids: number[] = [];
                                                value.forEach((option: AssignedUserOption) => {
                                                   ids.push(option.value)
                                                })
                                                newData.assignedIds = ids;
                                                return newData;
                                            }) 
                                        }}
                                        plantId={props.timeline.plantId}
                                     /></td>
                                </tr>
                                <tr className={styles.eventModalTableRow}>
                                    <th>Remarks:</th>
                                    <td>
                                        <textarea 
                                            className="form-control"
                                            maxLength={100}
                                            name="remarks"
                                            value={newSchedule.remarks}
                                            onChange={updateSchedule}
                                        ></textarea>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                        <TooltipBtn toolTip={false} onClick={handleSubmit}>Create</TooltipBtn>

                        <ModuleSimplePopup 
                            modalOpenState={successModal} 
                            setModalOpenState={setSuccessModal} 
                            title="Success"
                            text="New maintanace successfully scheduled!"
                            icon={SimpleIcon.Check}
                        />

                        <ModuleSimplePopup 
                            modalOpenState={failureModal} 
                            setModalOpenState={setFailureModal} 
                            title="Incomplete Maintenance"
                            text="Please fill in the missing details for the maintenance."
                            icon={SimpleIcon.Cross}
                        />
        </ModuleModal>
    )
}