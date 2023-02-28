import React, { useEffect, useState } from "react";

interface AssetHistoryProps {
    history?: {history: string}[]
}

export default function AssetHistory(props: AssetHistoryProps) {
    const [rows, setRows] = useState<string[][]>();

    useEffect(() => {
        if (props) {
            setRows(props.history?.map(item => item.history.split("_")));
        }
    }, [props])

    console.log(rows)
    const rowElements = [];
    if (rows) {
        rowElements.push(rows.map(row => {
            return (
            <tr key={row[0] + row[1] + row[2] + row[3] + row[4]}>
                <td>{row[0]}</td>
                <td>{row[1]}</td>
                <td>{row[2]}</td>
                <td>{row[3]}</td>
                <td>{row[4]}</td>
            </tr>
            )
        }))
    }

    return (
        <div>
            <h5>Asset History</h5>
            <table>
                <thead>
                    <tr>
                        <th>Status</th>
                        <th>Action</th>
                        <th>Date</th>
                        <th>Role</th>
                        <th>User</th>
                    </tr>
                </thead>
                <tbody>
                    {rowElements[0]}
                </tbody>
            </table>
        </div>
    )
}