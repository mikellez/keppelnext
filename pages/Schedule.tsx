import React from 'react'
import Layout from '../components/Layout'
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import styles from '../styles/Schedule.module.scss';

const Schedule = () => {
  	return (
		<div className={styles.calendar}>
			<button className="btn btn-primary">Schedule Maintenance</button>
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
		</div>
  	)
}

export default Schedule