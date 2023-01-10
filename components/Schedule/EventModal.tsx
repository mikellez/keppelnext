import React, { MouseEventHandler, useState } from "react";
import Modal from 'react-modal';
import { EventInfo } from "./ScheduleTemplate";
import { GrClose } from "react-icons/gr";
import styles from "../../styles/Schedule.module.scss"


interface ModalProps {
    isOpen: boolean;
    closeModal: MouseEventHandler;
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
                        width: "80%", 
                        height: "80%", 
                        backgroundColor: "transparent"
                    },
                    content: {
                        backgroundColor: "#FFFFFF"
                    }
                }
            }
        >
            <div>
                <div className={styles.eventModalHeader}>
                    <h3 className={styles.eventModalTitle}>Event</h3>
                    <GrClose onClick={props.closeModal} size={20} className={styles.eventModalClose} />
                </div>  
            </div>

        </Modal>
    );
};