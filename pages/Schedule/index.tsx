import React, { useState, useEffect } from 'react'
import ScheduleTemplate, { ScheduleInfo } from '../../components/Schedule/ScheduleTemplate';
import { CMMSPlant } from '../../types/common/interfaces';
import PlantSelect from '../../components/PlantSelect';
import axios from 'axios';
import { MdOutlineLocationOn } from "react-icons/md"
import styles from "../../styles/Schedule.module.scss";

/*
	EXPLANATION OF SCHEDULE MODULE
	
	It is important to understand the jargons used in the code for 
	this module. Firstly, a schedule is what you see as a row in the
	database. Eg, schedule xxx has a start date of xxx, end date of 
	xxx and a recurring period of xxx. A schedule is a collection 
	of maintenance dates which are referred to as events. Eg,
	schedule xxx has a start date of 1 Mar 2023, end date of 
	14 Mar 2023 and a recurring period of 7 (weekly). This means 
	schedule xxx comprises of 2 events which are 1 Mar 2023 and 
	8 Mar 2023. Events are not stored in the database as this would
	result in redundancis, hence schedules are stored instead and
	events are generated through logic in the server. A timeline is
	a collection of schedules. This is done because the workflow of 
	keppel is as such:

	Engineer will make multiple schedules for plant yyy and send to
	the Manager for appoval. 

	This process of approval and rejection is done in bulk and hence
	a timeline is used to store schedules. Timeline has its own table 
	in the database.

	The entirety of schedule module can be summarised into 3 parts:
	1. View
	2. Create
	3. Manage

	Across these pages, the FullCalendar component is widely reused 
	and this is incorporated as a template page in 
	/components/Schedule/ScheduleTemplate.tsx 
	
	-	/components/Schedule/EventModal.tsx is a modal component which
		allows users to view schedule details by clicking on individual
		events on the calendar

	-	/components/Schedule/CreateScheduleModal.tsx is another modal
		componenent that will appear when users click on any of the 
		/components/Schedule/CreateScheduleCard.tsx on the create 
		schedule page. This is a complex component, please read the 
		explanation there for a clearer picture
	
	-	/components/Schedule/ScheduleModal/tsx is another modal 
		 component that allows users to create schedules by filling 
		 in the relevant details 
*/

// Get schedules by plant id
async function getSchedules(id : number) {
	return await axios.get<ScheduleInfo[]>(`/api/schedule/${id}`)
	.then(res => {
		return res.data
	})
	.catch(err => console.log(err.message))
};


export default function Schedule() {
	// Store the list of plants in a state for dropdown
	const [plantList, setPlantList] = useState<CMMSPlant[]>([]);
	// Store the list of schedules in a state to be rendered on the calendar
	const [scheduleList, setScheduleList] = useState<ScheduleInfo[]>([]);

	// Calls an api on load to get the list of plants
	useEffect(() => {
		updateSchedules(0);
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

	// Change the events according to plant on change of plant select
	function changePlant(e : React.ChangeEvent<HTMLSelectElement>) {
		updateSchedules(parseInt(e.target.value));
	};

  	return (
		<ScheduleTemplate title="View Schedule" header="View Schedule" schedules={scheduleList}>
			<div className={"form-group" && styles.eventModalHeader} style={{gap: "0.3rem"}}>
				<MdOutlineLocationOn size={30} />
				<PlantSelect onChange={changePlant} allPlants={true} />
			</div>
		</ScheduleTemplate>
  	);
};





