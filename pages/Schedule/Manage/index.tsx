import React, { useState } from 'react'
import ScheduleTemplate from '../../../components/Schedule/ScheduleTemplate';
import { AiOutlineHistory, AiOutlineAudit, AiOutlineClockCircle,AiOutlineInfoCircle } from "react-icons/ai"
import styles from "../../../styles/Schedule.module.scss";
import { useEffect } from 'preact/hooks';

export default function ManageSchedule() {
	const [isHistory, setIsHistory] = useState<boolean>(false);

    return (
        <ScheduleTemplate title="Manage Schedule" header="Manage Schedule">
			<select className="form-control">
					
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