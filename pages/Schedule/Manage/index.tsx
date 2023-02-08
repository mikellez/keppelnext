import React, { useState, useEffect } from "react";
import ScheduleTemplate, { ScheduleInfo } from "../../../components/Schedule/ScheduleTemplate";
import {
    AiOutlineHistory,
    AiOutlineAudit,
    AiOutlineClockCircle,
    AiOutlineInfoCircle,
} from "react-icons/ai";
import TooltipBtn from "../../../components/Schedule/TooltipBtn";
import styles from "../../../styles/Schedule.module.scss";
import axios from "axios";
import TimelineSelect from "../../../components/Schedule/TimelineSelect";
import { getSchedules } from "../Timeline/[id]";
import CreateScheduleModal from "../../../components/Schedule/CreateScheduleModal";
import ModuleSimplePopup, { SimpleIcon } from "../../../components/ModuleLayout/ModuleSimplePopup";

// Function to change the status of a timeline
export async function changeTimelineStatus(newStatus: number, timelineId: number) {
    return await axios.post(`/api/timeline/status/${newStatus}/${timelineId}`)
        .then(res => {
            return res.data;
        })
        .catch(err => {
            console.log(err);
        });
};

export default function ManageSchedule() {
    const [isHistory, setIsHistory] = useState<boolean>(false);
    const [scheduleList, setScheduleList] = useState<ScheduleInfo[]>([]);
    const [manageModal, setManageModal] = useState<boolean>(false);
    const [isPopup, setIsPopup] = useState<boolean>(false);
    const [timelineId, setTimelineId] = useState<number>();
    const [remarks, setRemarks] = useState<string>("");

    async function setSchedules(id: number) {
        getSchedules(id).then((schedules) => {
            if (schedules) {
                setScheduleList(schedules);
            }
        });
    }

    // Called when the approve/reject buttons have been clicked
    function handleManage(newStatus: number) {
        if (remarks === "" && newStatus != 1) {
            //Prompt for remarks
            setIsPopup(true);
        } else {
            changeTimelineStatus(newStatus, timelineId as number).then(result => {
                // Close and clear modal fields
                setManageModal(false);
                setTimelineId(0);
            });
        }
    };

    return (
        <ScheduleTemplate title="Manage Schedule" header="Manage Schedule" schedules={scheduleList}>
            {isHistory ? (
                <div style={{ width: "150px" }}>
                    <TimelineSelect
                        status={5}
                        onChange={(e) => {
                            setTimelineId(parseInt(e.target.value));
                            if (timelineId) setSchedules(timelineId);
                        }}
                        name="name"
                    />
                </div>
            ) : (
                <div style={{ width: "150px" }}>
                    <TimelineSelect
                        status={4}
                        onChange={(e) => {
                            setTimelineId(parseInt(e.target.value));
                            if (timelineId) setSchedules(timelineId);
                        }}
                        name="name"
                    />
                </div>
            )}

            {isHistory ? 
                <TooltipBtn text="Schdedule info" onClick={() => setManageModal(true)}  disabled={!timelineId}>
                    <AiOutlineInfoCircle size={21} />
                </TooltipBtn> 
                : 
                <TooltipBtn text="Manage pending schedules" onClick={() => {setManageModal(true)}} disabled={!timelineId}>
                    <AiOutlineAudit size={21} />
                </TooltipBtn>
            }

            <TooltipBtn
                onClick={() => {
                    setIsHistory((prev) => !prev);
                    setTimelineId(0);
                }}
                text={isHistory ? "View pending schedules" : "View past schedules"}
            >
                {isHistory ? <AiOutlineClockCircle size={21} /> : <AiOutlineHistory size={21} />}
            </TooltipBtn>

            <CreateScheduleModal
                isOpen={manageModal}
                closeModal={() => setManageModal(false)}
                title={isHistory ? "Schedule Details" : "Manage Schedule"}
                timelineId={timelineId}
                isManage
            >{!isHistory && 
                <div>
                    <label>
                        <p>Remarks</p>
                        <textarea 
                        className="form-control" 
                        rows={2} maxLength={150} 
                        style={{resize: "none"}}
                        onChange={(e) => setRemarks(e.target.value)}
                        ></textarea>
                    </label>
                    <div className={styles.createScheduleModalBtnContainer}>
                        <TooltipBtn toolTip={false} onClick={() => handleManage(1)}> Approve </TooltipBtn>
                        <TooltipBtn toolTip={false} onClick={() => handleManage(3)}> Reject </TooltipBtn>
                    </div>
                </div>
            }</CreateScheduleModal>

            <ModuleSimplePopup 
                modalOpenState={isPopup} 
                setModalOpenState={setIsPopup} 
                title="Missing Remarks" 
                text="Please write some remarks so that the engineers know why the schedule is rejected."
                icon={SimpleIcon.Exclaim}
            />

        </ScheduleTemplate>
    );
}
