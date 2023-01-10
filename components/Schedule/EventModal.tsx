import React, { MouseEventHandler } from "react";
import Modal from 'react-modal';
import { EventInfo, dateFormat } from "./ScheduleTemplate";
import { GrClose } from "react-icons/gr";
import styles from "../../styles/Schedule.module.scss"


interface ModalProps {
    isOpen: boolean;
    closeModal: MouseEventHandler;
    event?: EventInfo;
};



export default function EventModal(props: ModalProps) {

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
                        // backgroundColor: "transparent",
                    },
                    content: {
                        backgroundColor: "#F7F7F7",
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
                            <td>{props.event.extendedProps.recurringPeriod}</td>
                        </tr>
                        <tr className={styles.eventModalTableRow}>
                            <th>Assigned To:</th>
                            <td>{props.event.extendedProps.assignedTo}</td>
                        </tr>
                        <tr className={styles.eventModalTableRow}>
                            <th>Remarks:</th>
                            <td>{props.event.extendedProps.remarks}</td>
                        </tr>
                    </table>
                </div>  
            </div>}
            
        </Modal>
    );
};