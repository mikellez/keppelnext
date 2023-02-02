import React, { PropsWithChildren, useState, useEffect } from "react";
import { ModuleContent, ModuleHeader, ModuleMain } from "../";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import EventModal from "./EventModal";
import axios from "axios";
import styles from "../../styles/Schedule.module.scss";
import { BsCalendar4Week, BsListUl } from "react-icons/bs";
import { TableNode } from '@table-library/react-table-library/types/table';
import ScheduleTable from "./ScheduleTable";
import { CMMSScheduleEvent } from "../../types/common/interfaces";


interface ScheduleTemplateInfo extends PropsWithChildren {
    title: string;
    header: string;
    schedules?: ScheduleInfo[];
    timeline?: number;
};

export interface ScheduleInfo extends TableNode {
    assigned_fnames: string[];
    assigned_lnames: string[];
    assigned_roles: string[];
    assigned_emails: string[];
    assigned_usernames: string[];
    assigned_ids: number[];
    calendar_dates: string[];
    checklist_id: number;
    checklist_name: string;
    end_date: Date;
    period: number;
    plant: string;
    remarks: string;
    schedule_id: number;
    start_date: Date;  
};

// Function to format Date to string
export function dateFormat(date: Date): string {
    return date.toLocaleDateString("en-GB", {
        weekday: "short",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    });
};

// Function to convert a recurring period to string format
export function toPeriodString(period: number): string {
    switch (period) {
        case 1:
            return "Daily";
        case 7:
            return "Weekly";
        case 14:
            return "Fortnightly";
        case 30:
            return "Monthly";
        case 90:
            return "Quarterly";
        case 180:
            return "Semi-Annually";
        case 365:
            return "Yearly";
        default:
            return "NA";
    };
};

export default function ScheduleTemplate(props: ScheduleTemplateInfo) {
    // Store the list of events in a state to be rendered on the calendar
    const [eventList, setEventList] = useState<CMMSScheduleEvent[]>([]);
    // Store the state of the view event modal
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    // Store the current event which will pop up as a modal in a state
    const [currentEvent, setCurrentEvent] = useState<CMMSScheduleEvent>();
    // Store the state of the view full calendar. when set to true, view is full calendar, otherwise is list view.
    const [toggleCalendarOrListView, setToggleCalendarOrListView] = useState<boolean>(true);

    // Add events to be displayed on the calendar
    useEffect(() => {
        setEventList([]);
        if (props.schedules) {
            let newEvents: CMMSScheduleEvent[] = [];
            props.schedules.forEach((item) => {
                item.calendar_dates.forEach((date) => {
                    const event = {
                        title: item.checklist_name,
                        start: new Date(date),
                        extendedProps: {
                            plant: item.plant,
                            scheduleId: item.schedule_id,
                            checklistId: item.checklist_id,
                            startDate: new Date(item.start_date),
                            endDate: new Date(item.end_date),
                            recurringPeriod: item.period,
                            assignedIds: item.assigned_ids,
                            assignedEmails: item.assigned_emails,
                            assignedFnames: item.assigned_fnames,
                            assignedLnames: item.assigned_lnames,
                            assignedUsernames: item.assigned_usernames,
                            assignedRoles: item.assigned_usernames,
                            remarks: item.remarks,
                        },
                    };
                    newEvents.push(event);
                });
                setEventList(newEvents);
            });
        }
    }, [props.schedules]);

    return (
        <ModuleMain>
            <EventModal
                isOpen={isModalOpen}
                closeModal={() => setIsModalOpen(false)}
                event={currentEvent}
            />
            <ModuleHeader
                title={props.title}
                header={props.header}
                leftChildren={
                    <div className={styles.eventModalHeader}>
                        <label className={styles.toggle}>
                            <input type="checkbox" onChange={() => setToggleCalendarOrListView(prev => !prev)} />
                            <span className={styles.slider}></span>
                        </label>
                        <div style={{ marginLeft: "10px" }} id="top-toggle-img">
                            {toggleCalendarOrListView ? <BsCalendar4Week size={20} /> : <BsListUl size={20} />}
                        </div>
                    </div>
                }
            >
                {props.children}
            </ModuleHeader>
            <ModuleContent>
                {toggleCalendarOrListView ? (
                    // Render Full calendar view
                    <FullCalendar
                        plugins={[dayGridPlugin]}
                        initialView="dayGridMonth"
                        headerToolbar={{
                            left: "today",
                            center: "title",
                            right: "prevYear,prev,next,nextYear",
                        }}
                        aspectRatio={2}
                        handleWindowResize={true}
                        windowResizeDelay={1}
                        stickyHeaderDates={true}
                        selectable={true}
                        unselectAuto={true}
                        events={eventList}
                        dayMaxEvents={2}
                        eventDisplay="block"
                        eventBackgroundColor="#FA9494"
                        eventBorderColor="#FFFFFF"
                        eventTextColor="#000000"
                        displayEventTime={false}
                        eventClick={() => setIsModalOpen(true)}
                        eventMouseEnter={(info) => {
                            document.body.style.cursor = "pointer";

                            const event = {
                                title: info.event._def.title,
                                start: info.event._instance?.range.start,
                                extendedProps: {
                                    plant: info.event._def.extendedProps.plant,
                                    scheduleId: info.event._def.extendedProps.scheduleId,
                                    checklistId: info.event._def.extendedProps.checklistId,
                                    startDate: info.event._def.extendedProps.startDate,
                                    endDate: info.event._def.extendedProps.endDate,
                                    recurringPeriod: info.event._def.extendedProps.recurringPeriod,
                                    assignedIds: info.event._def.extendedProps.assignedIds,
                                    assignedEmails: info.event._def.extendedProps.assignedEmails,
                                    assignedFnames: info.event._def.extendedProps.assignedFnames,
                                    assignedLnames: info.event._def.extendedProps.assignedLnames,
                                    assignedUsernames: info.event._def.extendedProps.assignedUsernames,
                                    assignedRoles: info.event._def.extendedProps.assignedRoles,
                                    remarks: info.event._def.extendedProps.remarks,
                                },
                            };

                            setCurrentEvent(event);
                        }}
                        eventMouseLeave={() => {
                            document.body.style.cursor = "default";
                        }}
                    />
                ) : (
                    // Render list view
                    <ScheduleTable schedules={props.schedules}/>
                )}
            </ModuleContent>
        </ModuleMain>
    );
}
