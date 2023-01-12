import React from 'react';
import { CompactTable } from '@table-library/react-table-library/compact/CompactTable';
import { ScheduleInfo, dateFormat } from './ScheduleTemplate';

const COLUMNS : any[] = [
    { label: 'Checklist Name', renderCell: (item : ScheduleInfo) => item.checklist_name },
    { label: 'Frequency', renderCell: (item : ScheduleInfo) => item.period },
    { label: 'Start', renderCell: (item : ScheduleInfo) => dateFormat(item.start_date) },
    { label: 'End', renderCell: (item : ScheduleInfo) => dateFormat(item.end_date) },
    { label: 'Frequency', renderCell: (item : ScheduleInfo) => item.assigned_ids },
    { label: 'Frequency', renderCell: (item : ScheduleInfo) => item.remarks }
  ];

export default function ScheduleTable() {
    return (
        // <CompactTable columns={COLUMNS} data={}/>
        <></>
    );
};