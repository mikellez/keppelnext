import React, { useState, useEffect } from "react";
import moment from "moment";

interface LicenseHistoryProps {
  history: { [key: string]: string }[];
  assignedUser?: string;
}

function rowElements(rows: { [key: string]: string }[]) {
  return (
    <>
      {rows.map((row) => {
        // console.log(row);
        return (
          <tr key={row["date"] + row["name"] + row["role"]}>
            <td>{row["activity_type"]}</td>
            <td>{row["activity"]}</td>
            <td>
              {moment(row["date"]).format("MMMM Do YYYY, h:mm:ss a")}
            </td>
            <td>{row["name"]}</td>
          </tr>
        );
      })}
    </>
  );
}

const LicenseHistory = (props: LicenseHistoryProps) => {
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
        <tbody>{rowElements(props.history)}</tbody>
      </table>
    </div>
  );
};

export default LicenseHistory;
