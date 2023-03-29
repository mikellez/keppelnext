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
  console.log(props)
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
                  View Image
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
          {props.request.rejection_comments && (
            <tr>
              <th>Rejection Comments</th>
              <td>{props.request.rejection_comments}</td>
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
                      View Image
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
            </>
          )}
        </tbody>
      </table>
    </div>
  );
}
