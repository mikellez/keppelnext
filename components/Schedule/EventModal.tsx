import React, { MouseEventHandler, useState, useEffect } from "react";
import Modal from 'react-modal';
import { EventInfo, dateFormat, toPeriodString, getUser, UserInfo } from "./ScheduleTemplate";
import { GrClose } from "react-icons/gr";
import styles from "../../styles/Schedule.module.scss"


interface ModalProps {
    isOpen: boolean;
    closeModal: MouseEventHandler;
    event?: EventInfo;
};



export default function EventModal(props: ModalProps) {
    // Store the assigned users as a state
    const [assignedUsers, setAssignedUsers] = useState<UserInfo[]>([]);

    useEffect(() => {
        if (props.event) {
            const users : UserInfo[] = [];
            props.event.extendedProps.assignedTo.forEach((id) => {
                getUser(id).then((x) => {
                    if(x != null) {
                        users.push(x)
                    }   
                });
            });
            setAssignedUsers(users);
        }
    }, [props.event]);

    const assignedUserElement = assignedUsers.map(user => <span key={user.id}>{user.name}</span>)

    return (
        <Modal
            isOpen={props.isOpen}
            ariaHideApp={false}
            onRequestClose={props.closeModal}
            style={
                {
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
                    }
                }
            }
        >
            {props.event && 
            <div>
                <div className={styles.eventModalHeader}>
                    <h4 className={styles.eventModalTitle}>{props.event.title}</h4>
                    <GrClose onClick={props.closeModal} size={20} className={styles.eventModalClose} />
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
                                <td>{dateFormat(props.event.extendedProps.startDate)}</td>
                            </tr>
                            <tr className={styles.eventModalTableRow}>
                                <th>End Date:</th>
                                <td>{dateFormat(props.event.extendedProps.endDate)}</td>
                            </tr>
                            <tr className={styles.eventModalTableRow}>
                                <th>Recurring Period:</th>
                                <td>{toPeriodString(props.event.extendedProps.recurringPeriod)}</td>
                            </tr>
                            <tr className={styles.eventModalTableRow}>
                                <th>Assigned To:</th>
                                <td>{assignedUserElement}</td>
                            </tr>
                            <tr className={styles.eventModalTableRow}>
                                <th>Remarks:</th>
                                <td>{props.event.extendedProps.remarks}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>  
            </div>}    
        </Modal>
    );
};