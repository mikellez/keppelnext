import React from "react";
import { CMMSChecklist } from "../../types/common/interfaces";
import { ChecklistPageProps } from "../../pages/Checklist/Form";
import styles from "../../styles/Checklist.module.scss";
import { dateFormat } from "../Schedule/ScheduleTemplate";

const ChecklistDetails = (props: ChecklistPageProps) => {
    const createdDate = dateFormat(new Date(props.checklist?.created_date as string));
    const assets =
        props.checklist?.linkedassets != null && props.checklist?.linkedassets != ""
            ? props.checklist?.linkedassets.split(", ")
            : [];

    const assetHTMLElements = assets.map((asset) => {
        return (
            <p key={asset} className={styles.checklistDetailsAssets}>
                {asset}
            </p>
        );
    });

    return (
        <div>
            <h4>{props.checklist?.chl_name}</h4>
            <div className={styles.checklistDetailsContainer}>
                <div>
                    <p className={styles.checklistDetailsHeading}>Description</p>
                    <p className={styles.checklistDetailsContent}>{props.checklist?.description}</p>
                </div>
                <div>
                    <p className={styles.checklistDetailsHeading}>Created Date</p>
                    <p className={styles.checklistDetailsContent}>{createdDate}</p>
                </div>
                <div>
                    <p className={styles.checklistDetailsHeading}>Plant</p>
                    <p className={styles.checklistDetailsContent}>{props.checklist?.plant_name}</p>
                </div>
                <div>
                    <p className={styles.checklistDetailsHeading}>Assigned To</p>
                    <p className={styles.checklistDetailsContent}>
                        {props.checklist?.assigneduser}
                    </p>
                </div>
                <div>
                    <p className={styles.checklistDetailsHeading}>Created By</p>
                    <p className={styles.checklistDetailsContent}>
                        {props.checklist?.createdbyuser}
                    </p>
                </div>
                <div>
                    <p className={styles.checklistDetailsHeading}>Sign Off By</p>
                    <p className={styles.checklistDetailsContent}>{props.checklist?.signoffuser}</p>
                </div>
                <div>
                    <p className={styles.checklistDetailsHeading}>Linked Assets</p>
                    {assetHTMLElements.length > 0 ? assetHTMLElements : "NIL"}
                </div>
                {props.checklist?.status_id == 4 && <div>
                    <p className={styles.checklistDetailsHeading}>Time of Completion</p>
                    {props.checklist?.activity_log.findLast(activity => activity["activity"] == "WORK DONE")!["date"]}
                </div>}
                {props.checklist?.status_id == 5 && <div>
                    <p className={styles.checklistDetailsHeading}>Time of Approval</p>
                    {props.checklist?.activity_log.findLast(activity => activity["activity"] == "APPROVED")!["date"]}
                </div>}
                {props.checklist?.status_id == 3 || props.checklist?.status_id == 6 && <div>
                    <p className={styles.checklistDetailsHeading}>Time of Rejection</p>
                    {props.checklist?.activity_log.findLast(activity => activity["activity"] == "REJECTED")!["date"]}
                </div>}

            </div>
        </div>
    );
};

export default ChecklistDetails;
