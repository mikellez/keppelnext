import React, { useState, useEffect } from 'react';
import ScheduleTemplate, { ScheduleInfo } from '../../../components/Schedule/ScheduleTemplate';
import { FiSend, FiPlusSquare } from 'react-icons/fi';
import TooltipBtn from '../../../components/Schedule/TooltipBtn';
import styles from "../../styles/Schedule.module.scss";
import axios from 'axios';
import { useRouter } from 'next/router';
import { CMMSTimeline } from '../../../types/common/interfaces';
import { ThreeDots } from 'react-loading-icons'

// Get timeline details
export async function getTimeline(id: number) {
    return await axios.get<CMMSTimeline>("/api/timeline/" + id)
        .then(res => {
            return res.data
        })
        .catch(err => console.log(err))
};

// Get timeline specific schedules
async function getSchedules(id: number) {
    return axios.get<ScheduleInfo[]>("/api/timeline/schedules/" + id) 
        .then(res => {
            return res.data
        })
        .catch(err => console.log(err))
};

export default function Timeline() {
    const router = useRouter();
    const timelineId = router.query.id;
    const [isValid, setIsValid] = useState<boolean>();
    const [isLoading, setIsLoading] = useState<boolean>();
    const [scheduleList, setScheduleList] = useState<ScheduleInfo[]>([]);

    useEffect(() => {
        setIsLoading(true);
        if (timelineId) {
            const id = parseInt(timelineId as string)
            getTimeline(id)
                .then(result => {
                    if (result && result.status === 3) {
                        getSchedules(id).then(schedules => {
                            if (schedules) {
                                setScheduleList(schedules)
                            };
                            setIsValid(true)
                        })       
                    }
                    else setIsValid (false);
                    setTimeout(() => {
                        setIsLoading(false);
                    }, 1000)
                }) 
        }
    }, [timelineId])

    if (isLoading) {
        return (
            <div style={{width: "100%", textAlign: "center"}}>
                <ThreeDots fill="black"/>
            </div>
        ) 
    } else if (isValid == false) {
        router.replace("/404");
    } else if (isLoading == false && isValid == true) {
        return (
            <ScheduleTemplate title="Draft Schedule" header="Create Schedule" schedules={scheduleList}>
                <TooltipBtn text="Submit for approval"> <FiSend size={22} /> </TooltipBtn>
                <TooltipBtn text="Schedule a maintenance"> <FiPlusSquare size={22} /> </TooltipBtn>
            </ScheduleTemplate>
        )
    }
}