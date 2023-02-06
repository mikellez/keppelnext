import React from 'react';
import ScheduleTemplate from '../../../components/Schedule/ScheduleTemplate';
import { FiSend, FiPlusSquare } from 'react-icons/fi';
import TooltipBtn from '../../../components/Schedule/TooltipBtn';
import styles from "../../styles/Schedule.module.scss";


export default function Timeline() {
    return (

            <ScheduleTemplate title="Draft Schedule" header="New">
                <TooltipBtn text="Submit for approval"> <FiSend size={22} /> </TooltipBtn>
                <TooltipBtn text="Schedule a maintenance"> <FiPlusSquare size={22} /> </TooltipBtn>
            </ScheduleTemplate>

    )
}