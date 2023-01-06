import React from 'react'
import ScheduleTemplate from '../../../components/Schedule/ScheduleTemplate';

export default function ManageSchedule() {
    return (
        <ScheduleTemplate title="Manage Schedule" header="Manage Schedule">
			<button className="btn btn-primary">History</button>
			<select className="form-control">
					
			</select>
			<button className="btn btn-primary">Approve</button>
			<button className="btn btn-primary">Reject</button>
		</ScheduleTemplate>
    )
}