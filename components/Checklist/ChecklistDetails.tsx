import React, { ReactNode, useCallback } from "react";
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

    const actionDateElement = useCallback((): ReactNode | null => {
        const { activity_log, status_id } = props.checklist as CMMSChecklist;
        if (!Array.isArray(activity_log)) return;
        if (status_id == 4) {
            return (
                <div>
                    <p className={styles.checklistDetailsHeading}>Date of Completion</p>
                    <p className={styles.checklistDetailsContent}>
                        {activity_log.reverse().find(activity => activity["activity"] == "WORK DONE")!["date"]}
                    </p>
                </div>
            );
        } else if (status_id == 5) {
            return (
                <div>
                    <p className={styles.checklistDetailsHeading}>Date of Approval</p>
                    <p className={styles.checklistDetailsContent}>
                        {activity_log.reverse().find(activity => activity["activity"] == "APPROVED")!["date"]}
                    </p>
                </div>
            );
        } else if (status_id == 3 || status_id == 2) {
            const rejectedLog = activity_log.reverse().find(activity => activity["activity"] == "REJECTED");
            return (
                <div>
                    <p className={styles.checklistDetailsHeading}>Date of Rejection</p>
                    <p className={styles.checklistDetailsContent}>
                        {rejectedLog ? rejectedLog.date : "NIL"}
                    </p>
                </div>
            );
        }
    }, [props.checklist]);

    const rejectionComments = useCallback((): ReactNode | null => {
        const { activity_log, status_id } = props.checklist as CMMSChecklist;
        const rejectionActivity = activity_log.reverse().find(activity => activity["activity"] == "REJECTED");
        if (status_id == 3 || status_id == 2) {
            return ( 
                <div>
                     <p className={styles.checklistDetailsHeading}>Rejection Comments</p>
                     <p className={styles.checklistDetailsContent}>
                        {rejectionActivity && rejectionActivity["remarks"]}
                    </p>
                </div>
            );
        }
    }, [props.checklist]);

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
                {actionDateElement()}
                {rejectionComments()}
            </div>
        </div>
    );
};

export default ChecklistDetails;
