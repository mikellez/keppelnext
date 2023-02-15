import React, { useEffect, useState } from "react";
import { CompactTable } from "@table-library/react-table-library/compact";
import { useTheme } from "@table-library/react-table-library/theme";
import { getTheme } from "@table-library/react-table-library/baseline";
import { ScheduleInfo, dateFormat, toPeriodString } from "./ScheduleTemplate";
import EventModalUser from "./EventModalUser";
import styles from "../../styles/Schedule.module.scss";

interface ScheduleTableProps {
    schedules?: ScheduleInfo[];
    viewRescheduled?: boolean
}

const COLUMNS: any[] = [
    {
        label: "Checklist Name",
        renderCell: (item: ScheduleInfo) => item.checklist_name,
        pinLeft: true,
    },
    {
        label: "Frequency",
        renderCell: (item: ScheduleInfo) => toPeriodString(item.period),
        pinLeft: true,
    },
    {
        label: "Start",
        renderCell: (item: ScheduleInfo) =>
            item.start_date ? dateFormat(new Date(item.start_date)) : "Rescheduled",
    },
    {
        label: "End",
        renderCell: (item: ScheduleInfo) =>
            item.end_date ? dateFormat(new Date(item.end_date)) : "Rescheduled",
    },
    {
        label: "Assigned",
        renderCell: (item: ScheduleInfo) => {
            let assignedUsers = [];
            const noOfAssigned = item.assigned_ids.length;
            for (let i = 0; i < noOfAssigned; i++) {
                assignedUsers.push(
                    <EventModalUser
                        key={`S${item.schedule_id} U${item.assigned_ids[i]}`} //duplicate key error here
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
    { label: "Remarks", renderCell: (item: ScheduleInfo) => item.remarks },
];

export default function ScheduleTable(props: ScheduleTableProps) {
    const [ScheduleNodes, setScheduleNodes] = useState<ScheduleInfo[]>([]);
    useEffect(() => {
        if (props.schedules) {
            let schedules = props.schedules;
            if (!props.viewRescheduled) {
                schedules = schedules.filter(schedule => schedule.end_date != null)
            }
            setScheduleNodes(schedules);
        }
    }, [props.schedules, props.viewRescheduled]);

    const theme = useTheme([
        getTheme(),
        {
            Table: `
                --data-table-library_grid-template-columns: auto 8% 12% 12% 22% auto;
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
        },
    ]);

    return (
        <div className={styles.scheduleTable}>
            <CompactTable
                columns={COLUMNS}
                data={{ nodes: ScheduleNodes }}
                theme={theme}
                layout={{ custom: true, horizontalScroll: true, fixedHeader: true }}
            />
        </div>
    );
}
