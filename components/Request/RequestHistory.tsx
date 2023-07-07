import React, { useState, useEffect } from "react";
import styles from "../../styles/Request.module.scss";
import moment from "moment";
interface RequestHistoryProps {
  activity_log?: { [key: string]: string }[];
  history: { [key: string]: string }[];
}

export default function RequestHistory(props: RequestHistoryProps) {
  const [rows, setRows] = useState<{ [key: string]: string }[]>([]);
  // console.log(props.history);
  useEffect(() => {
    // if (props.history && props.history.length > 0) {
    //     const tmpRows = props.history.split("!").map(row => {
    //         const tmpCols = row.split("_");
    //         return tmpCols;
    //     })
    //     setRows(tmpRows);
    // }
    // the above code is commented out because it is not used. Now we are using
    // props.activity_log which is a array made up of json with string key value pairs
    if (props.activity_log && props.activity_log.length > 0) {
      // const tmpRows = props.activity_log.map(row => {
      //     const tmpCols = Object.values(row);
      //     console.log(tmpCols);
      //     return tmpCols;
      // })
      const tmpRows = props.activity_log;
      setRows(tmpRows);
    }
  }, [props]);

  // const rowElements = rows?.map(row => {
  //     return <tr key={row[0] + row[1] + row[2]}>{row.map(col => {
  //         return <td key={col}>{col}</td>
  //     })}</tr>
  // })

  // const rowElements = rows?.map(row => {
  //     return <p>2</p>
  // return <tr key={row["date"] + row["name"] + row["role"]}>
  //     <td>{row["activity_type"]}</td>
  //     <td>{row["activity"]}</td>
  //     <td>{row["date"]}</td>
  //     <td>{row["role"]}</td>
  //     <td>{row["name"]}</td>
  // </tr>
  // })

  function rowElements(rows: { [key: string]: string }[]) {
    return (
      <>
        {rows.map((row) => {
          // console.log(row)
          return (
            <tr key={row["date"] + row["name"] + row["role"]}>
              <td>{row["activity_type"]}</td>
              <td>{row["activity"]}</td>
              <td>
                {moment(new Date(row["date"])).format(
                  "MMMM Do YYYY, h:mm:ss a"
                )}
              </td>
              {/* <td>{row["role"]}</td> */}
              <td>{row["name"]}</td>
            </tr>
          );
        })}
      </>
    );
    // return <tr key={rows[0]["date"] + rows[0]["name"] + rows[0]["role"]}>
    //     <td>{rows[0]["activity_type"]}</td>
    //     <td>{rows[0]["activity"]}</td>
    //     <td>{rows[0]["date"]}</td>
    //     <td>{rows[0]["role"]}</td>
    //     <td>{rows[0]["name"]}</td>
    // </tr>
  }

  return (
    <div>
      <table className="table">
        <thead>
          <tr>
            <th>Status</th>
            <th>Action</th>
            <th>Date</th>
            {/* <th>Role</th> */}
            <th>Name</th>
          </tr>
        </thead>
        <tbody>{rowElements(props.history)}</tbody>
      </table>
    </div>
  );
}
