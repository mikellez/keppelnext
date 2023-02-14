import React, { useEffect, useState } from "react";
import Modal from "react-modal";
import ModuleModal, { ModalProps } from "../ModuleLayout/ModuleModal";
import { CMMSTimeline, CMMSSchedule } from "../../types/common/interfaces";
import ChecklistSelect from "../Checklist/ChecklistSelect";
import RecurrenceSelect from "./RecurrenceSelect";
import styles from "../../styles/Schedule.module.scss";

interface ScheduleMaintenanceModalProps extends ModalProps {
    timeline: CMMSTimeline
};

export default function ScheduleMaintenanceModal(props: ScheduleMaintenanceModalProps) {
    const [newSchedule, setNewSchedule] = useState<CMMSSchedule>({} as CMMSSchedule);

    // Set the min date to to tomorrow
    const today = new Date();
    const minDate = new Date (today.setDate(today.getDate() + 1)).toISOString().slice(0, 10);

    // Update the state of newSchedule on change of input fields
    function updateSchedule(event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement | HTMLSelectElement>) {
        setNewSchedule(prev => {
            const value = event.target.type === "date" ? new Date(event.target.value) : (event.target.name === "checklistId" || event.target.name === "recurringPeriod") ? parseInt(event.target.value) : event.target.value
            return {
                ...prev,
                [event.target.name]: value,
            }
        })
    };

    useEffect(() => {
        setNewSchedule({ plantId: props.timeline.plantId } as CMMSSchedule)
    }, [props.timeline]);

    console.log(newSchedule)

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
                                            value={newSchedule.startDate ? newSchedule.startDate.toISOString().slice(0, 10) : today.toISOString().slice(0, 10)}
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
                                            value={newSchedule.endDate ? newSchedule.endDate.toISOString().slice(0, 10) : today.toISOString().slice(0, 10)}
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
                                    <th>Assigned To:</th>
                                    <td></td>
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
        </ModuleModal>
    )
}