import React from "react";
import { ModuleContent, ModuleHeader, ModuleMain } from '../../../components';
import CreateScheduleCard ,{ CreateScheduleCardProps } from "../../../components/Schedule/CreateScheduleCard";
import { RiDraftLine, RiCalendarCheckLine, RiCalendarTodoLine } from 'react-icons/ri';
import styles from "../../../styles/Schedule.module.scss";

export default function CreateSchedule() {
    const createOptions: CreateScheduleCardProps[] = [
        {
            title: "New",
            text: "Start afresh with a blank calendar",
            icon: <RiCalendarTodoLine size={60} />,
            color: "#82CD47"
        },
        {
            title: "Approved",
            text: "Work on the most recent approved schedule",
            icon: <RiCalendarCheckLine size={60} />,
            color: "#FFB200"
        },
        {
            title: "Drafts",
            text: "Continue from your collection of drafts",
            icon: <RiDraftLine size={60} />,
            color: "#91D8E4"
        }
    ];

    const createOptionElements = createOptions.map(option => {
        return <CreateScheduleCard
            key={option.title}
            title={option.title}
            text={option.text}
            icon={option.icon}
            color={option.color}
        />;
    });

    return (
        <ModuleMain>
            <ModuleHeader title="Create Schedule" header="Create Schedule">

            </ModuleHeader>
            <ModuleContent>
                <div className={styles.createCardsContainer}>
                    {createOptionElements}
                </div>
            </ModuleContent>
        </ModuleMain>
    );
};