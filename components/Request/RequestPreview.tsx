import React, { useState, useEffect } from "react";
import { CMMSRequest } from "../../types/common/interfaces";
import Image from "next/image";

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

  return (
    <div>
      <table>
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
            <td>{props.request.fault_description}</td>
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
              {faultUrl && (
                <Image src={faultUrl} width={300} height={300} alt="Fault Image" />
              )}
            </td>
          </tr>
          {props.action == RequestAction.manage && 
          <>
          <tr>
            <th>Completion Comments</th>
            <td>{props.request.complete_comments}</td>
          </tr>
          <tr>
            <th>Completion Image</th>
            <td>
              {completeUrl && (
                <Image src={completeUrl} width={300} height={300} alt="Fault Image" />
              )}
            </td>
          </tr>
          </>}
        </tbody>
      </table>
    </div>
  );
}
