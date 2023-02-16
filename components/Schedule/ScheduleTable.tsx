import React, { useEffect, useState } from "react";
import { CompactTable } from "@table-library/react-table-library/compact";
import { useTheme } from "@table-library/react-table-library/theme";
import { getTheme } from "@table-library/react-table-library/baseline";
import { ScheduleInfo, dateFormat, toPeriodString } from "./ScheduleTemplate";
import EventModalUser from "./EventModalUser";
import styles from "../../styles/Schedule.module.scss";
import { TableNode } from "../../pages/Request";

interface ScheduleTableProps {
    schedules?: ScheduleInfo[];
    viewRescheduled?: boolean
}

const COLUMNS: any[] = [
    {
        label: "Checklist Name",
        renderCell: (item: TableNode<ScheduleInfo>) => item.prop.checklist_name,
        pinLeft: true,
    },
    {
        label: "Frequency",
        renderCell: (item: TableNode<ScheduleInfo>) => toPeriodString(item.prop.period),
        pinLeft: true,
    },
    {
        label: "Start",
        renderCell: (item: TableNode<ScheduleInfo>) =>
            item.prop.start_date ? dateFormat(new Date(item.prop.start_date)) : "Rescheduled",
    },
    {
        label: "End",
        renderCell: (item: TableNode<ScheduleInfo>) =>
            item.prop.end_date ? dateFormat(new Date(item.prop.end_date)) : "Rescheduled",
    },
    {
        label: "Assigned",
        renderCell: (item: TableNode<ScheduleInfo>) => {
            let assignedUsers = [];
            const noOfAssigned = item.prop.assigned_ids.length;
            for (let i = 0; i < noOfAssigned; i++) {
                assignedUsers.push(
                    <EventModalUser
                        key={item.prop.schedule_id} 
                        serial={i + 1}
                        role_name={item.prop.assigned_roles[i]}
                        fname={item.prop.assigned_fnames[i]}
                        lname={item.prop.assigned_lnames[i]}
                        username={item.prop.assigned_usernames[i]}
                        id={item.prop.assigned_ids[i]}
                        email={item.prop.assigned_emails[i]}
                    />
                );
            }
            return assignedUsers;
        },
    },
    { label: "Remarks", renderCell: (item: TableNode<ScheduleInfo>) => item.prop.remarks },
];

export default function ScheduleTable(props: ScheduleTableProps) {
    const [ScheduleNodes, setScheduleNodes] = useState<TableNode<ScheduleInfo>[]>([]);
    useEffect(() => {
        if (props.schedules) {
            let schedules = props.schedules;
            if (!props.viewRescheduled) {
                schedules = schedules.filter(schedule => schedule.end_date != null)
            }
            setScheduleNodes(schedules.map((row: ScheduleInfo) => {
                return {
                    id: row.schedule_id.toString(),
                    prop: row
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
                data={{ nodes: ScheduleNodes }}
                theme={theme}
                layout={{ custom: true, horizontalScroll: true, fixedHeader: true }}
            />
        </div>
    );
}
