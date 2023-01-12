import React from 'react'
import ScheduleTemplate from '../../../components/Schedule/ScheduleTemplate';
import { RiHistoryLine } from "react-icons/ri"
import styles from "../../../styles/Schedule.module.scss";

export default function ManageSchedule() {
    return (
        <ScheduleTemplate title="Manage Schedule" header="Manage Schedule">
			<button className="btn btn-primary"><RiHistoryLine size={20} /></button>
			<select className="form-control">
					
			</select>
			<button className="btn btn-primary">Approve</button>
			<button className="btn btn-primary">Reject</button>
		</ScheduleTemplate>
    )
}