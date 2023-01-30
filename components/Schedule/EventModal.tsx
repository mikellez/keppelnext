import React, { MouseEventHandler, useState, useEffect } from "react";
import Modal from 'react-modal';
import { EventInfo, dateFormat, toPeriodString, UserInfo } from "./ScheduleTemplate";
import EventModalUser from "./EventModalUser";
import { GrClose } from "react-icons/gr";
import styles from "../../styles/Schedule.module.scss"


export interface ModalProps {
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
            const noOfAssigned = props.event.extendedProps.assignedIds.length;
                for (let i = 0; i  < noOfAssigned; i++) {
                    users.push({
                        id: props.event.extendedProps.assignedIds[i],
                        email: props.event.extendedProps.assignedEmails[i],
                        fname: props.event.extendedProps.assignedFnames[i],
                        lname: props.event.extendedProps.assignedLnames[i],
                        username: props.event.extendedProps.assignedUsernames[i],
                        role: props.event.extendedProps.assignedRoles[i],
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
                role={user.role} 
                fname={user.fname}
                lname={user.lname}
                username={user.username} 
                id={user.id} 
                email={user.email} 
            />
        );  
    });

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
                        border: "2px solid #393E46",
                    }
                }
            }
        >
            
            {props.event ? 
            <div>
                {/* Display event details on event select */}
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
                                <td className={styles.eventModalAssignedUsers}>{assignedUserElement}</td>
                            </tr>
                            <tr className={styles.eventModalTableRow}>
                                <th>Remarks:</th>
                                <td>{props.event.extendedProps.remarks}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>  
            </div>
            :
            <div>
                {/* Edit event details to create a new schedule */}
                <div className={styles.eventModalHeader}>
                    <h4 className={styles.eventModalTitle}>New Schedule</h4>
                    <GrClose onClick={props.closeModal} size={20} className={styles.eventModalClose} />
                </div>
                <div>
                    <table className={styles.eventModalTable}>
                        <tbody>
                            <tr className={styles.eventModalTableRow}>
                                <th>Checklist ID:</th>
                                <td></td>
                            </tr>
                            <tr className={styles.eventModalTableRow}>
                                <th>Plant:</th>
                                <td></td>
                            </tr>
                            <tr className={styles.eventModalTableRow}>
                                <th>Start Date:</th>
                                <td><input type="date" /></td>
                            </tr>
                            <tr className={styles.eventModalTableRow}>
                                <th>End Date:</th>
                                <td><input type="date" /></td>
                            </tr>
                            <tr className={styles.eventModalTableRow}>
                                <th>Recurring Period:</th>
                                <td></td>
                            </tr>
                            <tr className={styles.eventModalTableRow}>
                                <th>Assigned To:</th>
                                <td></td>
                            </tr>
                            <tr className={styles.eventModalTableRow}>
                                <th>Remarks:</th>
                                <td><textarea></textarea></td>
                            </tr>
                        </tbody>
                    </table>
                </div>  
            </div>
            }    
        </Modal>
    );
};