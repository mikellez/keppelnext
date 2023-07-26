import React, { useState, useEffect, PropsWithChildren } from "react";
import Modal from "react-modal";
import { dateFormat, ScheduleInfo, toPeriodString } from "./ScheduleTemplate";
import {
  CMMSChangeOfPartsEvent,
  CMMSUser,
} from "../../types/common/interfaces";
import { GrClose, GrNew } from "react-icons/gr";
import styles from "../../styles/Schedule.module.scss";

interface CustomMouseEventHandler extends React.MouseEventHandler {
  (event: React.MouseEvent | void): void;
}

interface COPModalProps extends PropsWithChildren {
  isOpen: boolean;
  closeModal: CustomMouseEventHandler;
  event?: CMMSChangeOfPartsEvent;
}

const COPEventModal = (props: COPModalProps) => {
  // useEffect(() => {
  //     console.log("From modal", props.event);
  // }, [props])
  return (
    <div>
      <Modal
        isOpen={props.isOpen}
        ariaHideApp={false}
        onRequestClose={props.closeModal}
        style={{
          overlay: {
            zIndex: 10000,
            margin: "auto",
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0,0,0,0.4)",
          },
          content: {
            backgroundColor: "#F0F0F0",
            height: "50%",
            width: "50%",
            margin: "auto",
            border: "2px solid #393E46",
          },
        }}
      >
        {props.event && (
          <div>
            {/* Display event details on event select */}
            <div className={styles.eventModalHeader}>
              <h4 className={styles.eventModalTitle}>{props.event.title}</h4>
              <GrClose
                onClick={props.closeModal}
                size={20}
                className={styles.eventModalClose}
              />
            </div>
            <div>
              <table className={styles.eventModalTable}>
                <tbody>
                  <tr className={styles.eventModalTableRow}>
                    <th>Change of Parts ID:</th>
                    <td>{props.event.extendedProps.copId}</td>
                  </tr>
                  <tr className={styles.eventModalTableRow}>
                    <th>Plant:</th>
                    <td>{props.event.extendedProps.plant}</td>
                  </tr>
                  <tr className={styles.eventModalTableRow}>
                    <th>Asset Name:</th>
                    <td>{props.event.extendedProps.asset}</td>
                  </tr>
                  <tr className={styles.eventModalTableRow}>
                    <th>Description:</th>
                    <td>{props.event.extendedProps.description}</td>
                  </tr>
                  <tr className={styles.eventModalTableRow}>
                    <th>Date:</th>
                    <td>{dateFormat(props.event.start as Date)}</td>
                  </tr>
                  <tr className={styles.eventModalTableRow}>
                    <th>Assigned To:</th>
                    <td className={styles.eventModalAssignedUsers}>
                      {props.event.extendedProps.assignedUser}
                    </td>
                  </tr>
                  <tr className={styles.eventModalTableRow}>
                    <th>Status:</th>
                    <td> {props.event.extendedProps.status}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default COPEventModal;
