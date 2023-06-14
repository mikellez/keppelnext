import React, { useState, useEffect } from "react";
import { CMMSRequest } from "../../types/common/interfaces";
import Image from "next/image";
import styles from "../../styles/Request.module.scss";
import { ModuleModal } from "../ModuleLayout/ModuleModal";

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

  const createdDate = props.request.requesthistory;
  if (createdDate != null) {
    const parts = createdDate.split("_");
    date = parts[2]; // assign the value to the global date variable
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
          activity_log[activity_log.length - 1].remarks || "NIL",
      });
    } else {
      const rejected = activity_log
        .reverse()
        .find((log) => log.activity_type === "REJECTED");
      setComments({ "Rejection Comments": rejected?.remarks || "NIL" });
    }
  }, [props.request.activity_log]);

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
            <td>{props.request.fault_description || "NIL"}</td>
          </tr>
          <tr>
            <th>Asset</th>
            <td>{props.request.asset_name}</td>
          </tr>
          <tr>
            <th>Assigned To</th>
            <td>{props.request.assigned_user_email}</td>
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
            (props.request.activity_log[props.request.activity_log.length - 1]
              .activity_type === "APPROVED" ||
              props.request.activity_log[props.request.activity_log.length - 1]
                .activity_type === "REJECTED") && (
              <tr>
                <th>{Object.keys(comments)[0]}</th>
                <td>{Object.values(comments)[0]}</td>
              </tr>
            )}
          {props.action == RequestAction.manage && (
            <>
              <tr>
                <th>Completion Comments</th>
                <td style={{ color: "#73777B", fontWeight: "BOLD" }}>
                  {props.request.complete_comments || "NIL"}
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
                      {completionModal}
                    </span>
                  ) : (
                    "No File"
                  )}

                  {completeUrl && (
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
                  )}
                </td>
              </tr>
              <tr>
                <th>Completion Date</th>
                <td
                  style={{
                    color: date === "NIL" ? "#73777B" : "inherit",
                    fontWeight: date === "NIL" ? "bold" : "normal",
                  }}
                >
                  {date || "NIL"}
                </td>
              </tr>
            </>
          )}
        </tbody>
      </table>
    </div>
  );
}
