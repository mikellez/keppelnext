import React from 'react'
import Layout from '../components/Layout'
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import styles from '../styles/Schedule.module.scss';
import AZButton from '../components/AZButton';

const Schedule = () => {
  	return (
		<Layout>
			<div className={styles.calendar}>
				<AZButton text="Schedule Maintenance"/>
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
		</Layout>
  	)
}

export default Schedule