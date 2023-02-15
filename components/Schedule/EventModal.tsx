import React, { useState, useEffect, PropsWithChildren } from "react";
import Modal from "react-modal";
import { useRouter } from "next/router";
import { dateFormat, toPeriodString } from "./ScheduleTemplate";
import { CMMSScheduleEvent, CMMSUser } from "../../types/common/interfaces";
import EventModalUser from "./EventModalUser";
import { GrClose } from "react-icons/gr";
import TooltipBtn from "./TooltipBtn";
import ModuleSimplePopup, { SimpleIcon } from "../ModuleLayout/ModuleSimplePopup";
import styles from "../../styles/Schedule.module.scss";
import axios from "axios";

interface CustomMouseEventHandler extends React.MouseEventHandler {
    (event: React.MouseEvent | void): void;
}

export interface ModalProps extends PropsWithChildren {
    isOpen: boolean;
    closeModal: CustomMouseEventHandler;
    event?: CMMSScheduleEvent;
    delete?: boolean
}

// Delete individual schedules during the draft phase
async function deleteSchedule(id: number) {
    return await axios.delete("/api/schedule/" + id).then(res => {
        return res;
    })
    .catch(err => console.log(err));
};

export default function EventModal(props: ModalProps) {
    // Store the assigned users as a state
    const [assignedUsers, setAssignedUsers] = useState<CMMSUser[]>([]);
    const [deleteModal, setDeleteModal] = useState<boolean>(false);

    const router = useRouter();

    function handleDelete() {
        if (props.event) {
            deleteSchedule(props.event.extendedProps.scheduleId).then(result => {
                setDeleteModal(true);
                setTimeout(() => { 
                    router.replace("/Schedule/Timeline/" + props.event?.extendedProps.timelineId);
                }, 1000);
            });
        }   
    };

    useEffect(() => {
        setDeleteModal(false);
        if (props.event) {
            const users: CMMSUser[] = [];
            const noOfAssigned = props.event.extendedProps.assignedIds.length;
            for (let i = 0; i < noOfAssigned; i++) {
                users.push({
                    id: props.event.extendedProps.assignedIds[i],
                    email: props.event.extendedProps.assignedEmails[i],
                    fname: props.event.extendedProps.assignedFnames[i],
                    lname: props.event.extendedProps.assignedLnames[i],
                    username: props.event.extendedProps.assignedUsernames[i],
                    role_name: props.event.extendedProps.assignedRoles[i],
                });
            }
            setAssignedUsers(users);
        }
    }, [props.event]);

    const assignedUserElement = assignedUsers.map((user, index) => {
        return (
            // <span key={user.id} className={styles.eventModalAssignedUser}>{index + 1}. {user.name}</span>
            <EventModalUser
                key={user.id}
                serial={index + 1}
                role_name={user.role_name}
                fname={user.fname as string}
                lname={user.lname as string}
                username={user.username as string}
                id={user.id}
                email={user.email as string}
            />
        );
    });

    return (
        <Modal
            isOpen={props.isOpen}
            ariaHideApp={false}
            onRequestClose={props.closeModal}
            style={{
                overlay: {
                    zIndex: 10000,
                    margin: "auto",
                    width: "100%",
                    height: "100%",
                    backgroundColor: "rgba(0,0,0,0.4)",
                },
                content: {
                    backgroundColor: "#F0F0F0",
                    height: "50%",
                    width: "50%",
                    margin: "auto",
                    border: "2px solid #393E46",
                },
            }}
        >
            {props.event && <div>
                {/* Display event details on event select */}
                <div className={styles.eventModalHeader}>
                    <h4 className={styles.eventModalTitle}>{props.event.title}</h4>
                    <GrClose
                        onClick={props.closeModal}
                        size={20}
                        className={styles.eventModalClose}
                    />
                </div>
                <div>
                    <table className={styles.eventModalTable}>
                        <tbody>
                            <tr className={styles.eventModalTableRow}>
                                <th>Schedule ID:</th>
                                <td>{props.event.extendedProps.scheduleId}</td>
                            </tr>
                            <tr className={styles.eventModalTableRow}>
                                <th>Checklist ID:</th>
                                <td>{props.event.extendedProps.checklistId}</td>
                            </tr>
                            <tr className={styles.eventModalTableRow}>
                                <th>Plant:</th>
                                <td>{props.event.extendedProps.plant}</td>
                            </tr>
                            <tr className={styles.eventModalTableRow}>
                                <th>Start Date:</th>
                                <td>
                                    {dateFormat(props.event.extendedProps.startDate as Date)}
                                </td>
                            </tr>
                            <tr className={styles.eventModalTableRow}>
                                <th>End Date:</th>
                                <td>{dateFormat(props.event.extendedProps.endDate as Date)}</td>
                            </tr>
                            <tr className={styles.eventModalTableRow}>
                                <th>Recurring Period:</th>
                                <td>
                                    {toPeriodString(props.event.extendedProps.recurringPeriod)}
                                </td>
                            </tr>
                            <tr className={styles.eventModalTableRow}>
                                <th>Assigned To:</th>
                                <td className={styles.eventModalAssignedUsers}>
                                    {assignedUserElement}
                                </td>
                            </tr>
                            <tr className={styles.eventModalTableRow}>
                                <th>Remarks:</th>
                                <td>{props.event.extendedProps.remarks}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                {props.delete && 
                <TooltipBtn toolTip={false} onClick={handleDelete} >Delete</TooltipBtn>}
            </div>}
            
            <ModuleSimplePopup 
                modalOpenState={deleteModal} 
                setModalOpenState={setDeleteModal} 
                title="Maintenance Deleted"
                text="Schedule Maintenance has been successfully deleted."
                icon={SimpleIcon.Check}
            />
        </Modal>
    );
}

