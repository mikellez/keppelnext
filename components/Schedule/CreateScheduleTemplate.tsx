import React from 'react';
import ScheduleTemplate from './ScheduleTemplate';
import { FiSend, FiPlusSquare } from 'react-icons/fi';
import TooltipBtn from './TooltipBtn';
import styles from "../../styles/Schedule.module.scss";

interface CreateScheduleTemplateProps {
    header: string;
};

export default function CreateScheduleTemplate(props: CreateScheduleTemplateProps) {
    return (
        <ScheduleTemplate title="Draft Schedule" header={props.header}>
			<TooltipBtn text="Submit for approval"> <FiSend size={22} /> </TooltipBtn>
			<TooltipBtn text="Schedule a maintenance"> <FiPlusSquare size={22} /> </TooltipBtn>
		</ScheduleTemplate>
    );
};