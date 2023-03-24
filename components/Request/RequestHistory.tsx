import React, { useState, useEffect } from "react";
import styles from "../../styles/Request.module.scss";

interface RequestHistoryProps {
    history?: string;
};

export default function RequestHistory(props: RequestHistoryProps) {
    const [rows, setRows] = useState<string[][]>();

    useEffect(() => {
        if (props.history && props.history.length > 0) {
            const tmpRows = props.history.split("!").map(row => {
                const tmpCols = row.split("_");
                return tmpCols;
            })
            setRows(tmpRows);
        }
    }, [props]);

    const rowElements = rows?.map(row => {
        return <tr key={row[2]}>{row.map(col => {
            return <td key={col}>{col}</td>
        })}</tr>
    })

    return (
        <div>
            <table className="table">
                <thead>
                    <tr>
                        <th>Status</th>
                        <th>Date</th>
                        <th>Action</th>
                        <th>Role</th>
                        <th>Name</th>
                    </tr>
                </thead>
                <tbody>
                    {rowElements}
                </tbody>
            </table>
        </div>
    );
};