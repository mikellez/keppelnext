import React, { useState, useEffect } from 'react'
import ScheduleTemplate from '../../../components/Schedule/ScheduleTemplate';
import { AiOutlineHistory, AiOutlineAudit, AiOutlineClockCircle,AiOutlineInfoCircle } from "react-icons/ai";
import TooltipBtn from '../../../components/Schedule/TooltipBtn';
import styles from "../../../styles/Schedule.module.scss";
import axios from 'axios';

interface TimelineInfo {
	id: number;
	name: string;
};

export default function ManageSchedule() {
	const [isHistory, setIsHistory] = useState<boolean>(false);
	const [timelineDropdown, setTimelineDropdown] = useState<TimelineInfo[]>();

	async function getDropdown(isHistory : boolean) {
		const apiUrl = isHistory ? "" : "";
		return await axios.get(apiUrl)
			.then(res => {
				return res.data
			})
			.catch(err => console.log(err.message))
	};

    return (
        <ScheduleTemplate title="Manage Schedule" header="Manage Schedule">
			<select className="form-control">
				{isHistory ? <option hidden>Completed Schedules</option> : <option hidden>Pending Schedules</option> }
			</select>
			<TooltipBtn text="Manage pending schedules"> <AiOutlineAudit size={21} /> </TooltipBtn>
			{isHistory &&
			<TooltipBtn text="Schdedule info"> <AiOutlineInfoCircle size={21} /> </TooltipBtn>}
			<TooltipBtn onClick={() => setIsHistory(prev => !prev)} text={isHistory ? "View past schedules" : "View pending schedules"} >
				{isHistory ? <AiOutlineClockCircle size={21} /> : <AiOutlineHistory size={21} />}
			</TooltipBtn>
		</ScheduleTemplate>
    )
}