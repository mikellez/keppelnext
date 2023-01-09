import React, { PropsWithChildren, useState, useEffect } from 'react';
import { ModuleContent, ModuleHeader, ModuleMain } from '../';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';

interface ScheduleTemplateInfo extends PropsWithChildren {
    title: string;
    header: string;
    schedules?: ScheduleInfo[]; 
    timeline?: number;
};

export interface PlantInfo {
    plant_id: number;
    plant_name: string;
    plant_description: string;
};

export interface ScheduleInfo {
    assigned_ids: number[]
    calendar_dates: string[]
    checklist_id: number;
    checklist_name: string;
    end_date: Date;
    period: number;
    plant: string;
    remarks: string;
    schedule_id: number;
    start_date: Date;
    username: string;
};

interface EventInfo {
    title: string;
    start: Date;
    extendedProps: {
        plant: string;
        scheduleId: number;
        startDate: Date;
        endDate: Date;
        recurringPeriod: string | number;
        assignedTo: number[] | string[]
        remarks: string
    };
};

export default function ScheduleTemplate(props: ScheduleTemplateInfo) {
    // Store the list of events in a state to be rendered on the calendar
    const [eventList, setEventList] = useState<EventInfo[]>([]);

    // Add events to be displayed on the calendar
    useEffect(() => {
        setEventList([]);
        if (props.schedules) {
            let newEvents : EventInfo[] = [];
            props.schedules.forEach(item => {
                const event = {
                    title: item.checklist_name,
                    start: new Date(item.start_date),
                    extendedProps: {
                        plant: item.plant,
                        scheduleId: item.schedule_id,
                        startDate: new Date(item.start_date),
                        endDate: new Date(item.end_date),
                        recurringPeriod: item.period,
                        assignedTo: item.assigned_ids,
                        remarks: item.remarks
                    },
                };
                newEvents.push(event);
                setEventList(newEvents)
            });
        } 
    }, [props.schedules]);

    return (
        <ModuleMain>
			<ModuleHeader title={props.title} header={props.header}>
                {props.children}
			</ModuleHeader>
			<ModuleContent>
                <FullCalendar
                        plugins={[ dayGridPlugin ]}
                        initialView="dayGridMonth"
                        headerToolbar={{
                            left: 'today',
                            center: 'title',
                            right: 'prevYear,prev,next,nextYear' 
                        }}
                        aspectRatio={2}
                        handleWindowResize={true}
                        windowResizeDelay={1}
                        stickyHeaderDates={true}
                        selectable={true}
                        unselectAuto={true}
                        events={eventList}
                />
			</ModuleContent>
		</ModuleMain>
    );
};

