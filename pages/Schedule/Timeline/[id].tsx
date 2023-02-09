import React, { useState, useEffect } from "react";
import ScheduleTemplate, { ScheduleInfo } from "../../../components/Schedule/ScheduleTemplate";
import { FiSend, FiPlusSquare } from "react-icons/fi";
import { RiDeleteBin6Line } from "react-icons/ri";
import TooltipBtn from "../../../components/Schedule/TooltipBtn";
import styles from "../../styles/Schedule.module.scss";
import axios from "axios";
import { useRouter } from "next/router";
import { CMMSTimeline } from "../../../types/common/interfaces";
import { ThreeDots } from "react-loading-icons";
import { changeTimelineStatus } from "../Manage";
import ModuleSimplePopup, { SimpleIcon} from "../../../components/ModuleLayout/ModuleSimplePopup";
import { getTimelinesByStatus } from "../../../components/Schedule/TimelineSelect";

// Get timeline details
export async function getTimeline(id: number) {
    return await axios
        .get<CMMSTimeline>("/api/timeline/status/3/" + id)
        .then((res) => {
            return res.data;
        })
        .catch((err) => {
            console.log(err.response);
            return err.response.status;
        });
}

// Get timeline specific schedules
export async function getSchedules(id: number) {
    return axios
        .get<ScheduleInfo[]>("/api/timeline/schedules/" + id)
        .then((res) => {
            return res.data;
        })
        .catch((err) => {
            console.log(err.status)
        });
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

    useEffect(() => {
        setIsLoading(true);
        if (timelineId) {
            const id = parseInt(timelineId as string);
            getTimeline(id).then((result) => {
                if (result && result.status === 3) {
                    setTimelineData(result);
                    getSchedules(id).then((schedules) => {
                        if (schedules) {
                            setScheduleList(schedules);
                        }
                    });
                } 
                else router.replace("/404");
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
            changeTimelineStatus(4, parseInt(timelineId as string)).then(result => {
                setSubmitModal(true);
            });
            getTimelinesByStatus(4).then(result => {
                if (result) {
                    const pendingTimeline = result.filter(item => item.plantId === timelineData?.plantId)[0];
                    if (pendingTimeline) setInvalidModal(true);
                    return;
                };
                changeTimelineStatus(4, parseInt(timelineId as string)).then(result => {
                    setSubmitModal(true);
                    setTimeout(() => {
                        router.replace("/Schedule/Create")
                    }, 500);
                });
            })
        }
    }

    if (isLoading) {
        return (
            <div style={{ width: "100%", textAlign: "center" }}>
                <ThreeDots fill="black" />
            </div>
        );
    } 
    else if (isLoading == false 
        ) {
        return (
            <ScheduleTemplate
                title="Draft Schedule"
                header="Create Schedule"
                schedules={scheduleList}
            >
                <TooltipBtn text="Delete this draft">
                    <RiDeleteBin6Line size={22} />
                </TooltipBtn>
                <TooltipBtn text="Submit for approval" onClick={submitTimeline} >
                    <FiSend size={22} />
                </TooltipBtn>
                <TooltipBtn text="Schedule a maintenance">
                    <FiPlusSquare size={22} />
                </TooltipBtn>

                <ModuleSimplePopup 
                    modalOpenState={submitModal} 
                    setModalOpenState={setSubmitModal} 
                    title="Sucess"
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

            </ScheduleTemplate>
        );
    }
}
