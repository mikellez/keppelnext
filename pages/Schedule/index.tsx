import React, { useState, useEffect } from 'react'
import ScheduleTemplate, { ScheduleInfo } from '../../components/Schedule/ScheduleTemplate';
import axios from 'axios';


async function getSchedules() {
	return await axios.get<ScheduleInfo[]>("/api/request/getScheduleAccess")
	.then(res => {
		return res.data
	})
	.catch(err => console.log(err.message))
};

export default function Schedule() {
	// Store the list of plants in a state for dropdown
	const [plantList, setPlantList] = useState<number[]>([]);
	// Store the list of schedules in a state to be rendered on the calendar
	const [scheduleList, setScheduleList] = useState<ScheduleInfo[]>([]);

	// Calls an api on load to get the list of plants
	useEffect(() => {
		updateSchedules();
	}, []);

	function updateSchedules() {
		getSchedules().then((schedules) => {	
			if (schedules == null) {
				return console.log("no schedules")	
			}
			setScheduleList(schedules);
		});
	};

  	return (
		<ScheduleTemplate title="View Schedule" header="View Schedule" schedules={scheduleList}>
				<div className="form-group">
					<select className="form-control">
						{plantList.length > 1 && <option>View all Plants</option>}
					</select>
				</div>
		</ScheduleTemplate>
  	);
};



