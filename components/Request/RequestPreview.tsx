import React, { useState, useEffect } from "react";
import { CMMSRequest } from "../../types/common/interfaces";
import Image from "next/image";
import styles from "../../styles/Request.module.scss";
import { ModuleModal } from "../ModuleLayout/ModuleModal";
import moment from "moment";

export enum RequestAction {
  manage = 1,
  complete = 2,
}

export interface RequestPreviewProps {
  request: CMMSRequest;
  action?: RequestAction;
}

export default function RequestPreview(props: RequestPreviewProps) {
  const [faultUrl, setFaultUrl] = useState("");
  const [completeUrl, setCompleteUrl] = useState("");
  const [completionModal, setCompletionModal] = useState(false);
  const [faultModal, setFaultModal] = useState(false);
  const [comments, setComments] = useState<null | Object>(null);
  let date; // declare the date variable outside the if block

  
// get completed date from activity_log
  const completedLog = props.request.activity_log.filter(entry => {
    return entry.activity_type === "COMPLETED"
  }).at(-1);
  console.log(completedLog);
  let completedDate = "N.A"
  if (completedLog) {
    const [day, month, year, hour, minute, second] = completedLog.date.split(/[\/\s:-]+/);
    completedDate = moment(new Date(+year, +month - 1, +day, +hour, +minute, +second)).format('MMMM Do YYYY, h:mm:ss a');
  }

  useEffect(() => {
    if (props.request.uploaded_file) {
      const imageUrl = URL.createObjectURL(
        new Blob([new Uint8Array(props.request.uploaded_file.data)])
      );
      setFaultUrl(imageUrl);
    }
    if (props.request.completion_file) {
      const imageUrl = URL.createObjectURL(
        new Blob([new Uint8Array(props.request.completion_file.data)])
      );
      setCompleteUrl(imageUrl);
    }
  }, [props.request.uploaded_file, props.request.completion_file]);

  useEffect(() => {
    const activity_log = props.request.activity_log;
    if (activity_log[activity_log.length - 1].activity_type === "APPROVED") {
      setComments({
        "Approval Comments":
          activity_log[activity_log.length - 1].remarks || "N.A",
      });
    } else {
      const rejected = activity_log
        .reverse()
        .find((log) => log.activity_type === "REJECTED");
        console.log('rejected', rejected)
      setComments({ "Rejection Comments": rejected?.remarks || "N.A" });
    }
  }, []);

  return (
    <div>
      <table className={styles.table}>
        <tbody>
          <tr>
            <th>Request Type</th>
            <td>{props.request.request_name}</td>
          </tr>
          <tr>
            <th>Priority</th>
            <td>{props.request.priority}</td>
          </tr>
          <tr>
            <th>Location</th>
            <td>{props.request.plant_name}</td>
          </tr>
          <tr>
            <th>Fault Type</th>
            <td>{props.request.fault_name}</td>
          </tr>
          <tr>
            <th>Fault Description</th>
            <td>{props.request.fault_description || "N.A"}</td>
          </tr>
          <tr>
            <th>Asset</th>
            <td>{props.request.asset_name}</td>
          </tr>
          <tr>
            <th>Created Date</th>
            <td>{`${moment(props.request.created_date).format('MMMM Do YYYY, h:mm:ss a')}`}</td>
          </tr>
          <tr>
            <th>Assigned To</th>
            <td>{props.request.assigned_user_email || "N.A"}</td>
          </tr>
          <tr>
            <th>Fault Image</th>
            <td>
              {faultUrl ? (
                <span
                  className={styles.viewImage}
                  onClick={() => setFaultModal(true)}
                >
                  <Image
                    src={faultUrl}
                    width={150}
                    height={150}
                    style={{ objectFit: "contain" }}
                    alt="Fault Image"
                  />
                  <div style={{ paddingTop: "10px", paddingBottom: "10px" }}>
                    <a href={faultUrl} download="FaultImage.jpg">
                      <button
                        className="btn btn-primary"
                        style={{ fontSize: "0.8rem" }}
                      >
                        Download
                      </button>
                    </a>
                  </div>
                </span>
              ) : (
                "No File"
              )}
              {faultUrl && (
                <ModuleModal
                  isOpen={faultModal}
                  closeModal={() => {
                    setFaultModal(false);
                  }}
                  className={styles.modal}
                  closeOnOverlayClick={true}
                  hideHeader
                >
                  <Image
                    src={faultUrl}
                    width={550}
                    height={550}
                    style={{ objectFit: "contain" }}
                    alt="Fault Image"
                  />
                </ModuleModal>
              )}
            </td>
          </tr>
          {comments &&
              <tr>
                <th>{Object.keys(comments)[0]}</th>
                <td>{Object.values(comments)[0]}</td>
              </tr>
            }
          {props.action == RequestAction.manage && (
            <>
              <tr>
                <th>Completion Comments</th>
                <td style={{ color: "#73777B", fontWeight: "BOLD" }}>
                  {props.request.complete_comments || "N.A"}
                </td>
              </tr>
              <tr>
                <th>Completion Image</th>
                <td>
                  {completeUrl ? (
                    <span
                      onClick={() => setCompletionModal(true)}
                      className={styles.viewImage}
                    >
                      View Image
                    </span>
                  ) : (
                    "No File"
                  )}

                  {
                    <ModuleModal
                      isOpen={completionModal}
                      closeModal={() => {
                        setCompletionModal(false);
                      }}
                      className={styles.modal}
                      closeOnOverlayClick={true}
                      hideHeader
                    >
                      <Image
                        src={completeUrl}
                        width={550}
                        height={550}
                        style={{ objectFit: "contain" }}
                        alt="Completion Image"
                      />
                    </ModuleModal>
                  }
                </td>
              </tr>
              <tr>
                <th>Completed Date</th>
                <td
                  style={{
                    color: completedDate === "N.A" ? "#73777B" : "inherit",
                    fontWeight: completedDate === "N.A" ? "bold" : "normal",
                  }}
                >
                  {completedDate}
                </td>
              </tr>
            </>
          )}
        </tbody>
      </table>
    </div>
  );
}
