import React, { useState, useEffect } from "react";
import { CMMSTimeline } from "../../types/common/interfaces";
import axios from "axios";

interface TimelineSelectProps {
    onChange: React.ChangeEventHandler<HTMLSelectElement>;
    allStatus?: boolean;
    status: number;
    name: string;
}
// Get timeline by status
export async function getTimelinesByStatus(status: number, all: boolean = false) {
    const url = all ? "" : "/api/timeline/status/" + status;
    return await axios
        .get<CMMSTimeline[]>(url)
        .then((res) => {
            return res.data;
        })
        .catch((err) => console.log(err.message));
};

export default function TimelineSelect(props: TimelineSelectProps) {
    // Store the list of timelines in a state for dropdown
    const [timelineList, setTimelineList] = useState<CMMSTimeline[]>([]);

    useEffect(() => {
        getTimelinesByStatus(props.status, props.allStatus).then((result) => {
            if (result) {
                setTimelineList(result);
            } else {
                console.log("no timelines");
            }
        });
    });

    // Timeline dropdown options
    const timelineOptions = timelineList.map((timeline) => (
        <option key={timeline.id} value={timeline.id}>
            {timeline.name}
        </option>
    ));

    return (
        <select
            className="form-select"
            onChange={props.onChange}
            name={props.name}
        >
            <option hidden>Select schedule</option>
            {timelineOptions}
        </select>
    );
}
