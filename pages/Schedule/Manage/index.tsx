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

interface TimelineInfo {
    id: number;
    name: string;
}

export default function ManageSchedule() {
    const [isHistory, setIsHistory] = useState<boolean>(false);
    const [timelineDropdown, setTimelineDropdown] = useState<TimelineInfo[]>();
    const [scheduleList, setScheduleList] = useState<ScheduleInfo[]>([]);

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
                <TimelineSelect
                    status={5}
                    onChange={(e) => {
                        setSchedules(parseInt(e.target.value));
                    }}
                    name="name"
                />
            ) : (
                <TimelineSelect
                    status={4}
                    onChange={(e) => {
                        setSchedules(parseInt(e.target.value));
                    }}
                    name="name"
                />
            )}
            <TooltipBtn text="Manage pending schedules">
                {" "}
                <AiOutlineAudit size={21} />{" "}
            </TooltipBtn>
            {isHistory && (
                <TooltipBtn text="Schdedule info">
                    {" "}
                    <AiOutlineInfoCircle size={21} />{" "}
                </TooltipBtn>
            )}
            <TooltipBtn
                onClick={() => setIsHistory((prev) => !prev)}
                text={isHistory ? "View pending schedules" : "View past schedules"}
            >
                {isHistory ? <AiOutlineClockCircle size={21} /> : <AiOutlineHistory size={21} />}
            </TooltipBtn>
        </ScheduleTemplate>
    );
}
