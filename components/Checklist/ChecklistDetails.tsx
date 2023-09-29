import moment from "moment";
import { ReactNode, useCallback } from "react";
import { ChecklistPageProps } from "../../pages/Checklist/Form";
import styles from "../../styles/Checklist.module.scss";
import { Checklist_Status } from "../../types/common/enums";
import { CMMSChecklist } from "../../types/common/interfaces";

const ChecklistDetails = (props: ChecklistPageProps) => {
  // console.log(props.checklist);
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
    if (status_id == Checklist_Status.Work_Done) {
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
    } else if (status_id == Checklist_Status.Approved) {
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
    } else if (status_id == Checklist_Status.Reassigned || status_id == Checklist_Status.Rejected) {
      const rejectedLog = activity_log
        .reverse()
        .find((activity) => activity["activity_type"] == "REJECTED");
      // console.log(activity_log);
      // console.log(rejectedLog);
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
    // console.log(props.checklist);
    const rejectionActivity = activity_log
      .reverse()
      .find((activity) => activity["activity_type"] == "REJECTED");
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
            {props.checklist?.createdbyuser !== " "
              ? props.checklist?.createdbyuser
              : "System Generated"}
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
        <div>
          <p className={styles.checklistDetailsHeading}>Overdue</p>
          <p className={styles.checklistDetailsContent}>
            {props.checklist?.overdue_status ? 'OVERDUE' : "VALID"}
          </p>
        </div>
        {props.checklist?.status_id === Checklist_Status.Reassignment_Request && (<div>
          <p className={styles.checklistDetailsHeading}>Request Remarks</p>
          <p className={styles.checklistDetailsContent}>
            {props.checklist?.completeremarks_req}
          </p>
        </div>)}
        {props.checklist?.status_id === Checklist_Status.Assigned && props.checklist?.completeremarks_req && (<div>
          <p className={styles.checklistDetailsHeading}>Request Status Remarks</p>
          <p className={styles.checklistDetailsContent}>
            {props.checklist?.completeremarks_req}
          </p>
        </div>)}
        {actionDateElement()}
        {rejectionComments()}
      </div>
    </div>
  );
};

export default ChecklistDetails;
