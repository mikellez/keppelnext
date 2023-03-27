import React, { useState, useEffect } from "react";
import { CMMSRequest } from "../../types/common/interfaces";
import Image from "next/image";

export enum RequestAction {
    manage = 1,
    complete = 2,
};

export interface RequestPreviewProps {
    request: CMMSRequest,
    action?: RequestAction;
};

export default function RequestPreview(props: RequestPreviewProps) {

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
                            <Image src={URL.createObjectURL(
                                new Blob([
                                    new Uint8Array(props.request.uploaded_file.data)
                                ])
                            )} width={300} height={300} alt="Fault Image" />
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
};