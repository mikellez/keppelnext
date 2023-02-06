import React, { useState } from 'react';
import Modal from 'react-modal';
import { ModalProps } from './EventModal';
import TooltipBtn from './TooltipBtn';
import { GrClose } from 'react-icons/gr';
import styles from "../../styles/Schedule.module.scss"
import PlantSelect from './PlantSelect';
import ModuleSimplePopup from '../ModuleLayout/ModuleSimplePopup';
import axios from 'axios';

interface NewTimelineData {
    name: string,
    plantId: number,
    description: string,
};

interface CreateScheduleModalProps extends ModalProps {
    title: string;
};


async function createTimeline(data: NewTimelineData) {
    return await axios.post("")
        .then(res => {
            return 
        })
        .catch(err => {
            console.log(err);
        })
};

export default function CreateScheduleModal(props: CreateScheduleModalProps) {
    // Store new timeline data in a state
    const [newTimelineData, setNewTimelineData] = useState<NewTimelineData>();
    const [isModalOpen, setIsModaOpen] = useState<boolean>(false);

    // Store the input field changes to state
    function changeNewTimelineData(event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
        setNewTimelineData((prevData) => {
            return {
                ...prevData,
                [event.target.name]: event.target.name === "plantId" ? parseInt(event.target.value) : event.target.value,
            } as NewTimelineData;
        });
    };

    // Close modal and empty all input fields
    function closeModal() {
        props.closeModal();
        setNewTimelineData(undefined);
    };

    // Create a new timeline on form submit
    function handleSubmit() {
        // Check for unfilled form input
        if (!newTimelineData?.name || !newTimelineData.description || !newTimelineData?.plantId) {
            setIsModaOpen(true);
        } else {
            createTimeline(newTimelineData).then()
        }
    };

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
                    <GrClose size={20} onClick={closeModal} className={styles.eventModalClose} /> 
                </div>
                <div className={styles.modalForm}>
                    <input 
                        type="text" 
                        className="form-control" 
                        onChange={(e) => changeNewTimelineData(e)}
                        name="name"
                        value={newTimelineData?.name}
                        placeholder="Schedule name"/>
                    <PlantSelect accessControl={true} onChange={(e) => changeNewTimelineData(e)} name="plantId" />
                    <textarea 
                        className="form-control" 
                        style={{resize: "none"}} 
                        rows={8} 
                        maxLength={500} 
                        name="description"
                        onChange={(e) => changeNewTimelineData(e)}
                        value={newTimelineData?.description}
                        placeholder="Description"></textarea>
                </div>           
            </div>
            <span style={{
                    position: "absolute",
                    bottom: "1.2rem",
                    right: "1.2rem",
                }}>
                    <TooltipBtn toolTip={false} onClick={handleSubmit}> Confirm </TooltipBtn>
            </span>
            <ModuleSimplePopup 
                modalOpenState={isModalOpen} 
                setModalOpenState={setIsModaOpen} 
                title="Missing Details" 
                text="Please ensure that you have filled in all the required entries." 
            />
        </Modal>
    );
};