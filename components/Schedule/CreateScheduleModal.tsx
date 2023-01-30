import React from 'react';
import Modal from 'react-modal';
import { ModalProps } from './EventModal';
import TooltipBtn from './TooltipBtn';
import { GrClose } from 'react-icons/gr';
import styles from "../../styles/Schedule.module.scss"


interface CreateScheduleModalProps extends ModalProps {
    title: string;
};

export default function CreateScheduleModal(props: CreateScheduleModalProps) {
    return (
        <Modal
            ariaHideApp={false}
            isOpen={props.isOpen}
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
                        height: "60%",
                        width: "50%",
                        margin: "auto",
                        border: "2px solid #393E46",
                    }
                }
            } 
        >
            <div>    
                <div className={styles.eventModalHeader}>
                    <h3>{props.title}</h3> 
                    <GrClose size={20} onClick={props.closeModal} className={styles.eventModalClose} /> 
                </div>
                <div className={styles.modalForm}>
                    <input type="text" className="form-control" placeholder="Schedule name"/>
                    <select className="form-control">
                        <option hidden>Select a plant</option>
                    </select>
                    <textarea className="form-control" rows={8} maxLength={500} placeholder="Description"></textarea>
                </div>           
            </div>
            <span style={{
                    position: "absolute",
                    bottom: "1.2rem",
                    right: "1.2rem",
                }}>
                    <TooltipBtn toolTip={false}> Confirm </TooltipBtn>
            </span>
        </Modal>
    );
};