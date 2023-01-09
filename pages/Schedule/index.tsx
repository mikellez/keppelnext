import React, { useState, useEffect } from 'react'
import ScheduleTemplate, { ScheduleInfo, PlantInfo } from '../../components/Schedule/ScheduleTemplate';
import axios from 'axios';


async function getSchedules(id : number) {
	return await axios.get<ScheduleInfo[]>(`/api/schedule/getViewSchedules/${id}`)
	.then(res => {
		return res.data
	})
	.catch(err => console.log(err.message))
};

async function getPlants() {
	return await axios.get<PlantInfo[]>("/api/schedule/getPlants")
	.then(res => {
		return res.data
	})
	.catch(err => console.log(err.message))
};

export default function Schedule() {
	// Store the list of plants in a state for dropdown
	const [plantList, setPlantList] = useState<PlantInfo[]>([]);
	// Store the list of schedules in a state to be rendered on the calendar
	const [scheduleList, setScheduleList] = useState<ScheduleInfo[]>([]);

	// Calls an api on load to get the list of plants
	useEffect(() => {
		updateSchedules(0);
		updatePlants();
	}, []);

	// Get the schedules to be rendered on the calendar
	function updateSchedules(id : number) {
		setScheduleList([]);
		getSchedules(id).then((schedules) => {	
			if (schedules == null) {
				return console.log("no schedules");	
			}
			setScheduleList(schedules);
		});
	};
	
	// Get the plants for the dropdown
	function updatePlants() {
		getPlants().then(plants => {
			if (plants == null) {
				return console.log("no plants");
			}
			setPlantList(plants);
		});
	};

	// Change the events according to plant on change of plant select
	function changePlant(e : React.ChangeEvent<HTMLSelectElement>) {
		updateSchedules(parseInt(e.target.value));
	};

	console.log(scheduleList)
	// Plant dropdown options
	const plantOptions = plantList.map(plant => <option key={plant.plant_id} value={plant.plant_id}>{plant.plant_name}</option>)

  	return (
		<ScheduleTemplate title="View Schedule" header="View Schedule" schedules={scheduleList}>
				<div className="form-group">
					<select className="form-control" onChange={changePlant}>
						{plantList.length > 1 && <option value={0}>View all Plants</option>}
						{plantOptions}
					</select>
				</div>
		</ScheduleTemplate>
  	);
};



