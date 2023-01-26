import React, { useState, useEffect } from 'react'
import ScheduleTemplate from '../../../components/Schedule/ScheduleTemplate';
import { AiOutlineHistory, AiOutlineAudit, AiOutlineClockCircle,AiOutlineInfoCircle } from "react-icons/ai"
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
			<button className="btn btn-primary"><AiOutlineAudit size={21} /></button>
			<button style={{
				display: isHistory ? "block" : "none",
			}} className="btn btn-primary"><AiOutlineInfoCircle size={21} /></button>
			<button className="btn btn-primary" onClick={() => setIsHistory(prev => !prev)} >
				{isHistory ? <AiOutlineClockCircle size={21} /> : <AiOutlineHistory size={21} />}
			</button>
		</ScheduleTemplate>
    )
}