import React from 'react';
import ScheduleTemplate from './ScheduleTemplate';

interface CreateScheduleTemplateProps {
    header: string;
};

export default function CreateScheduleTemplate(props: CreateScheduleTemplateProps) {
    return (
        <ScheduleTemplate title="Draft Schedule" header={props.header}>
			<button className="btn btn-primary">Send for Approval</button>
			<button className="btn btn-primary">Schedule Maintenance</button>
		</ScheduleTemplate>
    );
};