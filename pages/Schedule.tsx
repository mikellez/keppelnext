import React from 'react'
import Layout from '../components/Layout'
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';

const Schedule = () => {
  	return (
		<Layout>
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
		</Layout>
  	)
}

export default Schedule