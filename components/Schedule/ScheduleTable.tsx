import React, { useEffect, useState } from "react";
import { Column, CompactTable } from "@table-library/react-table-library/compact";
import { useTheme } from "@table-library/react-table-library/theme";
import { getTheme } from "@table-library/react-table-library/baseline";
import { ScheduleInfo, dateFormat, toPeriodString } from "./ScheduleTemplate";
import EventModalUser from "./EventModalUser";
import styles from "../../styles/Schedule.module.scss";

interface ScheduleTableProps {
    schedules?: ScheduleInfo[];
    viewRescheduled?: boolean
}

interface ScheduleInfoItem {
    id: number;
    assigned_fnames: string[];
    assigned_lnames: string[];
    assigned_roles: string[];
    assigned_emails: string[];
    assigned_usernames: string[];
    assigned_ids: number[];
    calendar_dates: string[];
    checklist_id: number;
    checklist_name: string;
    start_date: Date;
    end_date: Date;
    prev_start_date?: Date;
    prev_end_date?: Date;
    period: number;
    plant: string;
    plantId: number;
    remarks: string;
    timeline_id: number;
    exclusionList: number[];
    isSingle: boolean;
    index?: number;
    status?: number;
}

const COLUMNS: Column<ScheduleInfoItem>[] = [
    {
        label: "Checklist Name",
        renderCell: item => item.checklist_name,
        pinLeft: true,
    },
    {
        label: "Frequency",
        renderCell: item => toPeriodString(item.period),
        pinLeft: true,
    },
    {
        label: "Start",
        renderCell: item => item.start_date ? dateFormat(new Date(item.start_date)) : "Rescheduled",
    },
    {
        label: "End",
        renderCell: item => item.end_date ? dateFormat(new Date(item.end_date)) : "Rescheduled",
    },
    {
        label: "Assigned",
        renderCell: item => {
            let assignedUsers = [];
            const noOfAssigned = item.assigned_ids.length;
            for (let i = 0; i < noOfAssigned; i++) {
                assignedUsers.push(
                    <EventModalUser
                        key={item.id} 
                        serial={i + 1}
                        role_name={item.assigned_roles[i]}
                        fname={item.assigned_fnames[i]}
                        lname={item.assigned_lnames[i]}
                        username={item.assigned_usernames[i]}
                        id={item.assigned_ids[i]}
                        email={item.assigned_emails[i]}
                    />
                );
            }
            return assignedUsers;
        },
    },
    { label: "Remarks", renderCell: item => item.remarks },
];

export default function ScheduleTable(props: ScheduleTableProps) {
    const [scheduleItems, setScheduleItems] = useState<ScheduleInfoItem[]>([]);
    useEffect(() => {
        if (props.schedules) {
            let schedules = props.schedules;
            if (!props.viewRescheduled) {
                schedules = schedules.filter(schedule => schedule.end_date != null)
            }
            setScheduleItems(schedules.map((row) => {
                return {
                    id: row.schedule_id,
                    assigned_fnames: row.assigned_fnames,
                    assigned_lnames: row.assigned_lnames,
                    assigned_roles: row.assigned_roles,
                    assigned_emails: row.assigned_emails,
                    assigned_usernames: row.assigned_usernames,
                    assigned_ids: row.assigned_ids,
                    calendar_dates: row.calendar_dates,
                    checklist_id: row.checklist_id,
                    checklist_name: row.checklist_name,
                    start_date: row.start_date,
                    end_date: row.end_date,
                    prev_start_date: row.prev_end_date,
                    prev_end_date: row.prev_end_date,
                    period: row.period,
                    plant: row.plant,
                    plantId: row.plantId,
                    remarks: row.remarks,
                    timeline_id: row.timeline_id,
                    exclusionList: row.exclusionList,
                    isSingle: row.isSingle,
                    index: row.index,
                    status: row.status
                }
            }));
        }
    }, [props.schedules, props.viewRescheduled]);

    const theme = useTheme([
        getTheme(),
        {
            Table: `
                --data-table-library_grid-template-columns: auto 8% 12% 12% 22% auto;
                height: auto;
                max-height: 100%;
            `,
            HeaderCell: `
                background-color: white !important;
                z-index: 20 !important;
                &:nth-of-type(1) {
                    z-index: 30 !important;
                }
            `,
            BaseCell: `
                &:nth-of-type(1) {
                    left: 0px;
                    background-color: white !important;
                    z-index: 10;
                    border-right: 2px solid #dde2eb
                }
            `,
            HeaderRow: `
                background-color: red;
            `,
        },
    ]);

    return (
        <div className={styles.scheduleTable}>
            <CompactTable
                columns={COLUMNS}
                data={{ nodes: scheduleItems }}
                theme={theme}
                layout={{ custom: true, horizontalScroll: true, fixedHeader: true }}
            />
        </div>
    );
}
