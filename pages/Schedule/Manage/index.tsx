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
import { useRouter } from "next/router";
import { getUser } from "../../../components";
import TimelineSelect from "../../../components/Schedule/TimelineSelect";
import { getSchedules } from "../Timeline/[id]";
import CreateScheduleModal from "../../../components/Schedule/CreateScheduleModal";

interface TimelineInfo {
    id: number;
    name: string;
}

export default function ManageSchedule() {
    const [isHistory, setIsHistory] = useState<boolean>(false);
    const [timelineDropdown, setTimelineDropdown] = useState<TimelineInfo[]>();
    const [scheduleList, setScheduleList] = useState<ScheduleInfo[]>([]);
    const [displayModal, setDisplayModal] = useState<boolean>(false);
    const [timelineId, setTimelineId] = useState<number>();

    const router = useRouter();

    async function setSchedules(id: number) {
        getSchedules(id).then((schedules) => {
            if (schedules) {
                setScheduleList(schedules);
            }
        });
    }
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
            <TooltipBtn text="Manage pending schedules">
                <AiOutlineAudit size={21} />
            </TooltipBtn>
            <TooltipBtn onClick={() => setDisplayModal(true)} text="Schdedule info">
                <AiOutlineInfoCircle size={21} />
            </TooltipBtn>
            <TooltipBtn
                onClick={() => setIsHistory((prev) => !prev)}
                text={isHistory ? "View pending schedules" : "View past schedules"}
            >
                {isHistory ? <AiOutlineClockCircle size={21} /> : <AiOutlineHistory size={21} />}
            </TooltipBtn>

            <CreateScheduleModal
                isOpen={displayModal}
                closeModal={() => setDisplayModal(false)}
                option="Scheduler Details"
                timelineId={timelineId}
            />
        </ScheduleTemplate>
    );
}
