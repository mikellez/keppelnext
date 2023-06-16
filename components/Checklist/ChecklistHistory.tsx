import React, { useState, useEffect } from "react";

interface ChecklistHistoryProps {
  history: { [key: string]: string }[];
}

function rowElements(rows: { [key: string]: string }[]) {
  return (
    <>
      {rows.map((row) => {
        console.log(row);
        return (
          <tr key={row["date"] + row["name"] + row["role"]}>
            <td>{row["activity_type"]}</td>
            <td>{row["activity"]}</td>
            <td>
              {new Date(row["date"]).toLocaleDateString("en-US", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
              })}
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
            <th>Name</th>
          </tr>
        </thead>
        <tbody>{rowElements(props.history)}</tbody>
      </table>
    </div>
  );
};

export default ChecklistHistory;
