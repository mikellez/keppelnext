import React, { PropsWithChildren } from 'react';
import { ModuleContent, ModuleHeader, ModuleMain } from '../';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';

interface ScheduleInfo extends PropsWithChildren {
    title: string;
    header: string;
    timeline?: number;
}

export default function ScheduleTemplate(props: ScheduleInfo) {
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
                />
			</ModuleContent>
		</ModuleMain>
    )
}