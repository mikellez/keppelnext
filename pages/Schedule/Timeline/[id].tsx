import React, { useState, useEffect } from "react";
import ScheduleTemplate, { ScheduleInfo } from "../../../components/Schedule/ScheduleTemplate";
import { FiSend, FiPlusSquare } from "react-icons/fi";
import { RiDeleteBin6Line } from "react-icons/ri";
import TooltipBtn from "../../../components/TooltipBtn";
import styles from "../../styles/Schedule.module.scss";
import instance from "../../../axios.config.js";
import { useRouter } from "next/router";
import { CMMSTimeline } from "../../../types/common/interfaces";
import { ThreeDots } from "react-loading-icons";
import { changeTimelineStatus } from "../Manage";
import ModuleSimplePopup, { SimpleIcon } from "../../../components/ModuleLayout/ModuleSimplePopup";
import { getTimelinesByStatus } from "../../../components/Schedule/TimelineSelect";
import ScheduleModal from "../../../components/Schedule/ScheduleModal";

// Get timeline details
export async function getTimeline(id: number): Promise<CMMSTimeline> {
    return await instance
        .get("/api/timeline/" + id)
        .then((res) => {
            return res.data;
        })
        .catch((err) => {
            console.log(err.response);
            return err.response.status;
        });
}

// Get schedules by timeline id
export async function getSchedules(id: number) {
    return instance
        .get<ScheduleInfo[]>("/api/timeline/schedules/" + id)
        .then((res) => {
            return res.data;
        })
        .catch((err) => {
            console.log(err.status);
        });
}

// Delete a timeline
async function deleteTimeline(id: number) {
    return await instance
        .delete("/api/timeline/" + id)
        .then((res) => {
            return res.data;
        })
        .catch((err) => console.log(err));
}

// Check if the timeline is valid for the user
async function validateTimeline(id: number) {
    const currentTimeline = await getTimeline(id);
    if (!currentTimeline) return;

    const validTimelines = await getTimelinesByStatus(3, true);

    if (validTimelines) {
        for (const timeline of validTimelines) {
            if (timeline.id === currentTimeline.id) return timeline;
        }
    }
}

export default function Timeline() {
    const router = useRouter();
    const timelineId = router.query.id;
    const [isLoading, setIsLoading] = useState<boolean>();
    const [timelineData, setTimelineData] = useState<CMMSTimeline>();
    const [scheduleList, setScheduleList] = useState<ScheduleInfo[]>([]);
    const [submitModal, setSubmitModal] = useState<boolean>(false);
    const [emptyModal, setEmptyModal] = useState<boolean>(false);
    const [invalidModal, setInvalidModal] = useState<boolean>(false);
    const [scheduleModal, setScheduleModal] = useState<boolean>(false);
    const [deleteModal, setDeleteModal] = useState<boolean>(false);

    useEffect(() => {
        setScheduleModal(false);
        setIsLoading(true);
        if (timelineId) {
            const id = parseInt(timelineId as string);
            validateTimeline(id).then((result) => {
                if (!result) router.replace("/404");
                else {
                    setTimelineData(result);
                    getSchedules(id).then((schedules) => {
                        if (schedules) {
                            setScheduleList(schedules);
                            console.log(schedules);
                        }
                    });
                }
                setTimeout(() => {
                    setIsLoading(false);
                }, 1000);
            });
        }
    }, [timelineId, router]);

    function submitTimeline() {
        if (scheduleList.length === 0) {
            setEmptyModal(true);
        } else {
            // getTimelinesByStatus(4).then(result => {
            //     if (result && result.filter(item => item.plantId === timelineData?.plantId)[0]) {
            //         setInvalidModal(true);
            //     } else {
            changeTimelineStatus(4, parseInt(timelineId as string)).then((result) => {
                setSubmitModal(true);
                setTimeout(() => {
                    router.replace("/Schedule/Create");
                }, 500);
            });
            //     }
            // })
        }
    }

    if (isLoading) {
        return (
            <div style={{ width: "100%", textAlign: "center" }}>
                <ThreeDots fill="black" />
            </div>
        );
    } else if (isLoading == false) {
        return (
            <>
                <ScheduleTemplate
                    title="Draft Schedule"
                    header="Create Schedule"
                    schedules={scheduleList}
                >
                    <TooltipBtn
                        text="Delete this draft"
                        onClick={() => {
                            setDeleteModal(true);
                        }}
                    >
                        <RiDeleteBin6Line size={22} />
                    </TooltipBtn>

                    <TooltipBtn text="Submit for approval" onClick={submitTimeline}>
                        <FiSend size={22} />
                    </TooltipBtn>

                    <TooltipBtn
                        text="Schedule a maintenance"
                        onClick={() => {
                            setScheduleModal(true);
                        }}
                    >
                        <FiPlusSquare size={22} />
                    </TooltipBtn>
                </ScheduleTemplate>
                <ModuleSimplePopup
                    modalOpenState={submitModal}
                    setModalOpenState={setSubmitModal}
                    title="Success"
                    text="Your schedule has been submitted for your supervisor's approval."
                    icon={SimpleIcon.Check}
                />

                <ModuleSimplePopup
                    modalOpenState={emptyModal}
                    setModalOpenState={setEmptyModal}
                    title="Empty Schedule"
                    text="You cannot submit an empty schedule for approval. Please schedule a maintenance."
                    icon={SimpleIcon.Cross}
                />

                <ModuleSimplePopup
                    modalOpenState={invalidModal}
                    setModalOpenState={setInvalidModal}
                    title="Queue Full"
                    text="There is already another schedule that is pending for approval."
                    icon={SimpleIcon.Exclaim}
                />

                <ScheduleModal
                    isOpen={scheduleModal}
                    closeModal={() => setScheduleModal(false)}
                    title="Schedule Maintenance"
                    timeline={timelineData as CMMSTimeline}
                />

                <ModuleSimplePopup
                    modalOpenState={deleteModal}
                    setModalOpenState={setDeleteModal}
                    title="Delete Schedule"
                    text="Are you sure you want to delete this schedule? This action cannot be undone"
                    icon={SimpleIcon.Exclaim}
                    buttons={
                        <TooltipBtn
                            toolTip={false}
                            onClick={() => {
                                return deleteTimeline(parseInt(timelineId as string)).then(
                                    (res) => {
                                        router.replace("/Schedule/Create");
                                    }
                                );
                            }}
                        >
                            Confirm
                        </TooltipBtn>
                    }
                />
            </>
        );
    }
}
