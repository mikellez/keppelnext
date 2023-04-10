import React from "react";
import { CMMSChecklist } from "../../types/common/interfaces";
import { ChecklistPageProps } from "../../pages/Checklist/New";
import styles from "../../styles/Checklist.module.scss";
import { dateFormat } from "../Schedule/ScheduleTemplate";


const ChecklistDetails = (props: ChecklistPageProps) => {

    const createdDate = dateFormat(new Date(props.checklist?.created_date as string));
    const assets = (props.checklist?.linkedassets != null && 
        props.checklist?.linkedassets != "") ? props.checklist?.linkedassets.split(", ") : [];
    
    const assetHTMLElements = assets.map(asset => {
        return <p key={asset} className={styles.checklistDetailsAssets}>{asset}</p>
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
                    <p>{props.checklist?.plant_name}</p>
                </div>
                <div>
                    <p className={styles.checklistDetailsHeading}>Assigned To</p>
                    <p className={styles.checklistDetailsContent}>{props.checklist?.assigneduser}</p>
                </div>
                <div>
                    <p className={styles.checklistDetailsHeading}>Created By</p>
                    <p className={styles.checklistDetailsContent}>{props.checklist?.createdbyuser}</p>
                </div>
                <div>
                    <p className={styles.checklistDetailsHeading}>Sign Off By</p>
                    <p className={styles.checklistDetailsContent}>{props.checklist?.signoffuser}</p>
                </div>
                <div>
                    <p className={styles.checklistDetailsHeading}>Linked Assets</p>
                    {assetHTMLElements.length > 0 ? assetHTMLElements : "NIL"}
                </div>
            </div>
        </div>
    );
};

export default ChecklistDetails;