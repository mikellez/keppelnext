import React, { useState } from 'react';
import Modal from 'react-modal';
import { ModalProps } from './EventModal';
import TooltipBtn from './TooltipBtn';
import { GrClose } from 'react-icons/gr';
import styles from "../../styles/Schedule.module.scss"
import PlantSelect from './PlantSelect';
import TimelineSelect from './TimelineSelect';
import ModuleSimplePopup from '../ModuleLayout/ModuleSimplePopup';
import { useRouter } from 'next/router';
import axios from 'axios';
import { CMMSTimeline } from '../../types/common/interfaces';
import { ScheduleCreateOptions } from '../../pages/Schedule/Create';
import { getTimeline } from '../../pages/Schedule/Timeline/[id]';

interface CreateScheduleModalProps extends ModalProps {
    option: ScheduleCreateOptions
};

// Create a new timeline
async function createTimeline(data: CMMSTimeline) {
    return await axios.post("/api/timeline", { data })
        .then(res => {
            return res.data;
        })
        .catch(err => console.log(err))
};

// Edit only certain timeline details
async function editTimeline(data: CMMSTimeline, id: number) {
    return await axios.patch("/api/timeline/" + id, { data })
        .then(res => {
            return res.data;
        })
        .catch(err => console.log(err))
};

export default function CreateScheduleModal(props: CreateScheduleModalProps) {
    // Store new timeline data in a state
    const [TimelineData, setTimelineData] = useState<CMMSTimeline>();
    const [isModalOpen, setIsModaOpen] = useState<boolean>(false);

    const router = useRouter();

    // Store the input field changes to state
    function changeTimelineData(event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
        setTimelineData((prevData) => {
            return {
                ...prevData,
                [event.target.name]: event.target.name === "plantId" ? parseInt(event.target.value) : event.target.value,
            } as CMMSTimeline;
        });   
    };

    function changeTimelineDataOnSelect(event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
        getTimeline(parseInt(event.target.value)).then(result => {
            if (result) setTimelineData(result)
        });
    };

    // Close modal and empty all input fields
    function closeModal() {
        props.closeModal();
        setTimelineData({} as CMMSTimeline);
    };

    // Create a new timeline on form submit
    function handleSubmit() {
        // Check for unfilled form input
        if (!TimelineData?.name || !TimelineData?.description || !TimelineData?.plantId) {
            setIsModaOpen(true);
        } else {
            if (props.option === ScheduleCreateOptions.New) {
                createTimeline(TimelineData).then(result => {
                    router.push("/Schedule/Timeline/" + result);
                });
            } else if (props.option === ScheduleCreateOptions.Drafts) {
                editTimeline(TimelineData, TimelineData.id as number).then(result => {
                    router.push("/Schedule/Timeline/" + result);
                });
            }
        }
    };
console.log(TimelineData)
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
                    <h3>{"Create from " + props.option.toLocaleLowerCase()}</h3> 
                    <GrClose size={20} onClick={closeModal} className={styles.eventModalClose} /> 
                </div>
                <div className={styles.modalForm}>
                    {props.option === ScheduleCreateOptions.New && 
                        <input 
                            type="text" 
                            className="form-control" 
                            onChange={(e) => changeTimelineData(e)}
                            name="name"
                            value={TimelineData?.name ? TimelineData.name : ""}
                            placeholder="Schedule name"
                        />
                    }
                    {props.option === ScheduleCreateOptions.Drafts&&
                       <TimelineSelect
                            status={3}
                            onChange={(e) => {changeTimelineDataOnSelect(e)}}
                            name="name"
                       />
                    }
                    {props.option === ScheduleCreateOptions.New && 
                        <PlantSelect 
                            accessControl={true} 
                            onChange={(e) => changeTimelineData(e)} 
                            name="plantId" 
                        />
                    }
                    {props.option === ScheduleCreateOptions.Drafts && 
                        <input 
                            type="text" 
                            className="form-control"
                            placeholder="Plant"
                            value={TimelineData?.plantName ? TimelineData.plantName : ""}
                            readOnly
                        />
                    }
                    <textarea 
                        className="form-control" 
                        style={{resize: "none"}} 
                        rows={8} 
                        maxLength={500} 
                        name="description"
                        onChange={(e) => changeTimelineData(e)}
                        value={TimelineData?.description ? TimelineData.description : ""}
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