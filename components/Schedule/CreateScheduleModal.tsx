import React, { useEffect, useState } from "react";
import Modal from "react-modal";
import { ModalProps } from "./EventModal";
import TooltipBtn from "./TooltipBtn";
import { GrClose } from "react-icons/gr";
import styles from "../../styles/Schedule.module.scss";
import PlantSelect from "./PlantSelect";
import TimelineSelect from "./TimelineSelect";
import ModuleSimplePopup, { SimpleIcon } from "../ModuleLayout/ModuleSimplePopup";
import { useRouter } from "next/router";
import axios from "axios";
import { CMMSTimeline } from "../../types/common/interfaces";
import { ScheduleCreateOptions } from "../../pages/Schedule/Create";
import { getTimeline } from "../../pages/Schedule/Timeline/[id]";
import { getTimelinesByStatus } from "./TimelineSelect";

interface CreateScheduleModalProps extends ModalProps {
    title?: string;
    option?: ScheduleCreateOptions;
    timelineId?: number;
    isManage?: boolean;
}

// Create a new timeline
async function createTimeline(data: CMMSTimeline) {
    return await axios
        .post("/api/timeline", { data })
        .then((res) => {
            return res.data;
        })
        .catch((err) => console.log(err));
}

// Edit only certain timeline details
async function editTimeline(data: CMMSTimeline, id: number) {
    return await axios
        .patch("/api/timeline/" + id, { data })
        .then((res) => {
            return res.data;
        })
        .catch((err) => console.log(err));
}

// Get the most approved timelines for each plant
async function getApprovedTimeline(plantId: number) {
    const timelines = await getTimelinesByStatus(1);
    if (timelines) return timelines.filter(item => item.plantId === plantId)[0];
}

export default function CreateScheduleModal(props: CreateScheduleModalProps) {
    // Store new timeline data in a state
    const [timelineData, setTimelineData] = useState<CMMSTimeline>();
    const [isMissingDetailsModalOpen, setIsMissingDetailsModaOpen] = useState<boolean>(false);
    const [isWarningModalOpen, setIsWarningModaOpen] = useState<boolean>(false);

    const router = useRouter();

    // Store the input field changes to state
    function changeTimelineData(
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) {
        setTimelineData((prevData) => {
            return {
                ...prevData,
                [event.target.name]:
                    event.target.name === "plantId"
                        ? parseInt(event.target.value)
                        : event.target.value,
            } as CMMSTimeline;
        });
    }

    function changeTimelineDataOnTimelineSelect(
        event: React.ChangeEvent<HTMLSelectElement>
    ) {
        getTimeline(parseInt(event.target.value)).then((result) => {
            if (result) setTimelineData(result);
        });
    };

    function changeTimelineDataOnPlantSelect(
        event: React.ChangeEvent<HTMLSelectElement>
    ) {
        getApprovedTimeline(parseInt(event.target.value)).then(result => {
            if (result) setTimelineData(result);
        })
    };

    // Close modal and empty all input fields
    function closeModal() {
        // Warn users on closing modal if they have unsaved changes
        if ((timelineData?.name || timelineData?.description || timelineData?.plantId) && !props.isManage && props.option != ScheduleCreateOptions.Drafts) {
            setIsWarningModaOpen(true);
        } else {
            props.closeModal();   
        }
        if (!props.isManage) setTimelineData({} as CMMSTimeline);
    }

    // Create a new timeline on form submit
    function handleSubmit() {
        // Check for unfilled form input
        if (!timelineData?.name || !timelineData?.description || !timelineData?.plantId) {
            setIsMissingDetailsModaOpen(true);
        } else {
            if (props.option === ScheduleCreateOptions.New) {
                createTimeline(timelineData).then((result) => {
                    router.push("/Schedule/Timeline/" + result);
                });
            } else if (props.option === ScheduleCreateOptions.Drafts) {
                editTimeline(timelineData, timelineData.id as number).then((result) => {
                    router.push("/Schedule/Timeline/" + result);
                });
            } else if (props.option === ScheduleCreateOptions.Approved) {
                // TODO
            }
        }
    }

    useEffect(() => {
        if (props.timelineId)
            getTimeline(props.timelineId).then((result) => {
                if (result) setTimelineData(result);
            });
    }, [props.timelineId, props.option]);

    return (
        <Modal
            ariaHideApp={false}
            isOpen={props.isOpen}
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
                    height: "60%",
                    width: "50%",
                    margin: "auto",
                    border: "2px solid #393E46",
                },
            }}
        >
            <div>
                <div className={styles.eventModalHeader}>
                        <h3>{props.title}</h3>
                    <GrClose size={20} onClick={closeModal} className={styles.eventModalClose} />
                </div>

                <div className={styles.modalForm}>

                    <label>
                        <p>Schedule Name</p>
                        {(props.option != ScheduleCreateOptions.Drafts ||
                            props.isManage) && (
                            <input
                                type="text"
                                maxLength={80}
                                className="form-control" 
                                onChange={(e) => changeTimelineData(e)}
                                name="name"
                                value={timelineData?.name ? timelineData.name : ""}
                                style={{ backgroundColor: props.isManage ? "#B2B2B2" : "white" }}
                                // placeholder="Schedule name"
                                readOnly={props.isManage}
                            />
                        )}
                        {props.option === ScheduleCreateOptions.Drafts && (
                            <TimelineSelect
                                status={3}
                                onChange={(e) => {
                                    changeTimelineDataOnTimelineSelect(e);
                                }}
                                name="name"
                                userCreated={true}
                            />
                        )}
                    </label>

                    <label>
                        <p>Plant</p>
                        {(props.option === ScheduleCreateOptions.New || props.option === ScheduleCreateOptions.Approved) && (
                            <PlantSelect
                                accessControl={true}
                                onChange={(e) => {
                                    if (props.option != ScheduleCreateOptions.Approved) return changeTimelineData(e);
                                    return changeTimelineDataOnPlantSelect(e);
                                }}
                                name="plantId"
                            />
                        )}
                        {(props.option === ScheduleCreateOptions.Drafts || props.isManage) && (
                            <input
                                type="text"
                                className="form-control"
                                style={{ backgroundColor: "#B2B2B2" }}
                                // placeholder="Plant"
                                value={timelineData?.plantName ? timelineData.plantName : ""}
                                readOnly
                            />
                        )}
                    </label>

                    <label>
                        <p>Description</p>
                        <textarea
                            className="form-control"
                            style={{ resize: "none", backgroundColor: props.isManage ? "#B2B2B2" : "white" }}
                            rows={3}
                            maxLength={250}
                            name="description"
                            onChange={(e) => changeTimelineData(e)}
                            value={timelineData?.description ? timelineData.description : ""}
                            // placeholder="Description"
                            readOnly={props.isManage}
                        ></textarea>
                    </label>

                    {props.children}
                    
                </div>
            
            </div>

            {!props.isManage && (
                <span className={styles.createScheduleModalBtnContainer} >
                    <TooltipBtn toolTip={false} onClick={handleSubmit}>
                        Confirm
                    </TooltipBtn>
                </span>
            )}

            <ModuleSimplePopup
                modalOpenState={isMissingDetailsModalOpen}
                setModalOpenState={setIsMissingDetailsModaOpen}
                title="Missing Details"
                text="Please ensure that you have filled in all the required entries."
                icon={SimpleIcon.Cross}
            />

            {(!props.isManage) && <ModuleSimplePopup 
                modalOpenState={isWarningModalOpen} 
                setModalOpenState={setIsWarningModaOpen} 
                title="Unsaved Changes" 
                text="Are you sure you want to discard this entry? Your progress will be lost." 
                icon={SimpleIcon.Exclaim}
                buttons={[
                    <TooltipBtn 
                        key="yes" 
                        toolTip={false} 
                        onClick= {() => {
                            props.closeModal();
                            setTimelineData({} as CMMSTimeline);
                            setIsWarningModaOpen(false);
                        }}
                    >Yes</TooltipBtn>]}
            />}

        </Modal>
    );
}
