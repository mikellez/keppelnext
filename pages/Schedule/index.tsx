import React, { useState, useEffect } from 'react'
import ScheduleTemplate from '../../components/Schedule/ScheduleTemplate';
import axios from 'axios';

export default function Schedule() {
	// Store the list of plants in a state for dropdown
	const [plantList, setPlantList] = useState([]);

	// Calls an api on load to get the list of plants
	useEffect(() => {
		axios.get("/api/request/getScheduleAccess")
		.then(res => {
			console.log(res.data)
		})
		.catch(err => console.log(err.message))
	}, []);
	
  	return (
		<ScheduleTemplate title="View Schedule" header="View Schedule">
				<div className="form-group">
					<select className="form-control">
						{plantList.length > 1 && <option>View all Plants</option>}
					</select>
				</div>
		</ScheduleTemplate>
  	);
};



