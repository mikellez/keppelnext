import React, { useEffect, useState } from 'react';
import { CompactTable } from '@table-library/react-table-library/compact';
import { ScheduleInfo, dateFormat, toPeriodString } from './ScheduleTemplate';
import EventModalUser from './EventModalUser';


interface ScheduleTableProps {
    schedules?: ScheduleInfo[];
}

const COLUMNS : any[] = [
    { label: 'Checklist Name', renderCell: (item : ScheduleInfo) => item.checklist_name },
    { label: 'Frequency', renderCell: (item : ScheduleInfo) => toPeriodString(item.period) },
    { label: 'Start', renderCell: (item : ScheduleInfo) => dateFormat(new Date(item.start_date)) },
    { label: 'End', renderCell: (item : ScheduleInfo) => dateFormat(new Date(item.end_date)) },
    { label: 'Assigned', renderCell: (item : ScheduleInfo) => {
        let assignedUsers = [];
        const noOfAssigned = item.assigned_ids.length
        for (let i = 0; i < noOfAssigned; i++) {
            assignedUsers.push(<EventModalUser 
            key={item.assigned_ids[i]}
            serial={i + 1} 
            role={item.assigned_roles[i]} 
            fname={item.assigned_fnames[i]}
            lname={item.assigned_lnames[i]}
            username={item.assigned_usernames[i]} 
            id={item.assigned_ids[i]} 
            email={item.assigned_emails[i]} 
            />)
        }
            return (
                assignedUsers
            );
        } 
    },
    { label: 'Remarks', renderCell: (item : ScheduleInfo) => item.remarks }
];

export default function ScheduleTable(props : ScheduleTableProps) {
    const [ScheduleNodes, setScheduleNodes] = useState<ScheduleInfo[]>([]);
    useEffect(() => {
        if (props.schedules) {
            setScheduleNodes(props.schedules);
            console.log(props.schedules)
        }
    }, [props.schedules]);

    return (
        <CompactTable columns={COLUMNS} data={{nodes: ScheduleNodes}} />
    );
};