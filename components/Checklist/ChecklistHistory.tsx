import React, { useState, useEffect } from "react";
import moment from "moment";

interface ChecklistHistoryProps {
  history: { [key: string]: string }[];
  assignedUser: string;
}

function rowElements(rows: { [key: string]: string }[], assignedUser: string) {
  return (
    <>
      {rows.map((row) => {
        console.log(row);
        return (
          <tr key={row["date"] + row["name"] + row["role"]}>
            <td>{row["activity_type"]}</td>
            <td>{row["activity"]  == "ASSIGNED" ? `ASSIGNED TO ${assignedUser}` : row["activity"]}</td>
            <td>
              {moment(new Date(row["date"])).format('MMMM Do YYYY, h:mm:ss a')}
            </td>
            <td>{row["name"]}</td>
          </tr>
        );
      })}
    </>
  );
}

const ChecklistHistory = (props: ChecklistHistoryProps) => {
  const [rows, setRows] = useState<{ [key: string]: string }[]>([]);

  return (
    <div>
      <table className="table">
        <thead>
          <tr>
            <th>Status</th>
            <th>Action</th>
            <th>Date</th>
            <th>Action by</th>
          </tr>
        </thead>
        <tbody>{rowElements(props.history, props.assignedUser)}</tbody>
      </table>
    </div>
  );
};

export default ChecklistHistory;
