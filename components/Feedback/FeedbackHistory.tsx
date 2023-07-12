/**
 * EXPLANATION
 * The following is a function to map the history data to a table
 * for easy reference.
 *
 * props = {
 *  history
 * }
 *
 * - history : {[key:string] : string}[], is an array of json which
 *   gives the history of feedback
 *
 *
 * This is called in :
 * - /pages/Feedback/index.tsx
 *
 */
import React, { useState, useEffect } from "react";

interface FeedbackHistoryProps {
  history: { [key: string]: string }[];
}

function rowElements(rows: { [key: string]: string }[]) {
  return (
    <>
      {rows.map((row, index) => {
        // console.log(row);
        return (
          <tr key={index}>
            <td>{row["activity_type"]}</td>
            <td>{row["activity"]}</td>
            <td>{row["date"]}</td>
            <td>{row["name"]}</td>
          </tr>
        );
      })}
    </>
  );
}

const FeedbackHistory = (props: FeedbackHistoryProps) => {
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

export default FeedbackHistory;
