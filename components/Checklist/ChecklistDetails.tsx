import React, { ReactNode, useCallback } from "react";
import { CMMSChecklist } from "../../types/common/interfaces";
import { ChecklistPageProps } from "../../pages/Checklist/Form";
import styles from "../../styles/Checklist.module.scss";
import { dateFormat } from "../Schedule/ScheduleTemplate";
import moment from "moment";

const ChecklistDetails = (props: ChecklistPageProps) => {
  const createdDate = moment(
    new Date(props.checklist?.created_date as string)
  ).format("MMMM Do YYYY, h:mm:ss a");
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
      const completionLog = activity_log
        .reverse()
        .find((activity) => activity["activity_type"] == "WORK DONE");
      return (
        <div>
          <p className={styles.checklistDetailsHeading}>Completed Date</p>
          <p className={styles.checklistDetailsContent}>
            {moment(new Date(completionLog!.date)).format(
              "MMMM Do YYYY, h:mm:ss a"
            )}
          </p>
        </div>
      );
    } else if (status_id == 5) {
      const completionLog = activity_log
        .reverse()
        .find((activity) => activity["activity_type"] == "WORK DONE");
      const approvalLog = activity_log
        .reverse()
        .find((activity) => activity["activity_type"] == "APPROVED");
      return (
        <div>

        <div className="mb-4">
          <p className={styles.checklistDetailsHeading}>Completed Date</p>
          <p className={styles.checklistDetailsContent}>
            {moment(new Date(completionLog!.date)).format(
              "MMMM Do YYYY, h:mm:ss a"
            )}
          </p>
        </div>
        <div>
          <p className={styles.checklistDetailsHeading}>Approval Date</p>
          <p className={styles.checklistDetailsContent}>
            {moment(new Date(approvalLog!.date)).format(
              "MMMM Do YYYY, h:mm:ss a"
            )}
          </p>
        </div>
        </div>
      );
    } else if (status_id == 3) {
      const rejectedLog = activity_log
        .reverse()
        .find((activity) => activity["activity"] == "REJECTED");
      return (
        <div>
          <p className={styles.checklistDetailsHeading}>Rejection Date</p>
          <p className={styles.checklistDetailsContent}>
            {rejectedLog
              ? moment(new Date(rejectedLog!.date)).format(
                  "MMMM Do YYYY, h:mm:ss a"
                )
              : "NIL"}
          </p>
        </div>
      );
    }
  }, [props.checklist]);

  const rejectionComments = useCallback((): ReactNode | null => {
    const { activity_log, status_id } = props.checklist as CMMSChecklist;
    const rejectionActivity = activity_log
      .reverse()
      .find((activity) => activity["activity"] == "REJECTED");
    if (rejectionActivity) {
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
          <p className={styles.checklistDetailsContent}>
            {props.checklist?.description}
          </p>
        </div>
        <div>
          <p className={styles.checklistDetailsHeading}>Created Date</p>
          <p className={styles.checklistDetailsContent}>{createdDate}</p>
        </div>
        <div>
          <p className={styles.checklistDetailsHeading}>Plant</p>
          <p className={styles.checklistDetailsContent}>
            {props.checklist?.plant_name}
          </p>
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
            {props.checklist?.createdbyuser !== " " ? props.checklist?.createdbyuser : "System Generated"}
          </p>
        </div>
        <div>
          <p className={styles.checklistDetailsHeading}>Sign Off By</p>
          <p className={styles.checklistDetailsContent}>
            {props.checklist?.signoffuser}
          </p>
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
