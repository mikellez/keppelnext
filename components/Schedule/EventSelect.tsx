import React, { useState, useEffect } from "react";
import { CMMSTimeline } from "../../types/common/interfaces";
import instance from '../../types/common/axios.config';
import { CSSProperties } from "preact/compat";

interface PendingEventInfo extends CMMSTimeline {
    scheduleId: number;
    checklistName: string;
};

interface EventSelectProps {
    onChange: React.ChangeEventHandler<HTMLSelectElement>;
    style?: React.CSSProperties;
}

const fetchPendingEvents = async () => {
    return await instance.get<PendingEventInfo[]>("/api/event/")
        .then(res => {
            console.log(res.data);
            return res.data
        })
        .catch(err => console.log(err))
};

export default function EventSelect(props: EventSelectProps) {
    const [events, setEvents] = useState<PendingEventInfo[]>([]);

    useEffect(() => {
        fetchPendingEvents().then(result => {
            if (result) {
                setEvents(result);
            }
        })
    }, []);

    const eventOptions = events?.map(event => {
        // console.log(events);
        return (
            <option 
            key={event.scheduleId} 
            value={event.id + "-" + event.scheduleId}
            >{event.name} | {event.checklistName}
            </option>
        )
    })

    return (
        <select className="form-select" onChange={props.onChange} style={{...props.style, maxWidth: "150px"}}>
            <option hidden>Select Event</option>
            {eventOptions}
        </select>
    );
};