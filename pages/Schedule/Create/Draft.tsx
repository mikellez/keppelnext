import React from 'react'
import ScheduleTemplate from '../../../components/Schedule/ScheduleTemplate';

interface DraftInfo {
	timelineId: number
}

export default function DraftSchedule(props: DraftInfo) {
	const pageHeader = "Draft " + props.timelineId;

    return (
		<ScheduleTemplate title="Draft Schedule" header={pageHeader}>
			<button className="btn btn-primary">Send for Approval</button>
			<button className="btn btn-primary">Schedule Maintenance</button>
		</ScheduleTemplate>
    )
}