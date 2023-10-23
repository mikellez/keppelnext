import moment from "moment";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { ThreeDots } from "react-loading-icons";
import { SingleValue } from "react-select";
import { ModalProps, ModuleModal } from "../";
import styles from "../../styles/Schedule.module.scss";
import instance from "../../types/common/axios.config";
import {
  CMMSSchedule,
  CMMSTimeline
} from "../../types/common/interfaces";
import ChecklistSelect from "../Checklist/ChecklistSelect";
import ModuleSimplePopup, {
  SimpleIcon,
} from "../ModuleLayout/ModuleSimplePopup";
import TooltipBtn from "../TooltipBtn";
import AssignToSelect, { AssignedUserOption } from "./AssignToSelect";
import RecurrenceSelect from "./RecurrenceSelect";
import { ScheduleInfo } from "./ScheduleTemplate";

interface ScheduleMaintenanceModalProps extends ModalProps {
  timeline?: CMMSTimeline; // use to add schedule in draft
  scheduleEvent?: CMMSSchedule; // used to update schedule in draft
  schedules?: ScheduleInfo[];
}

// Makes a post request to schedule a new maintenance
export async function scheduleMaintenance(schedule: CMMSSchedule) {
  return await instance
    .post("/api/insertSchedule", { schedule })
    .then((res) => {
      // console.log(res);
    })
    .catch((err) => {
      console.log(err);
    });
}

async function editDraftSchedule(schedule: CMMSSchedule) {
  return await instance
    .patch("/api/updateSchedule", { schedule })
    .then((res) => {
      return res.data;
    })
    .catch((err) => {
      console.log(err);
    });
}

// return false if schedule is invalid
export function scheduleValidator(schedule: CMMSSchedule) {
  return !(
    (
      !schedule.checklistId ||
      !schedule.startDate ||
      !schedule.endDate ||
      !schedule.checklistId ||
      !schedule.recurringPeriod ||
      schedule.recurringPeriod === -1 ||
      (!schedule.reminderRecurrence && schedule.reminderRecurrence != 0)
    )
    // ||!schedule.remarks
  );
}

// Set the min date to to tomorrow
const today = new Date();
export const minDate = new Date(today.setDate(today.getDate() + 1))
  .toISOString()
  .slice(0, 10);

export default function ScheduleMaintenanceModal(
  props: ScheduleMaintenanceModalProps
) {
  const [newSchedule, setNewSchedule] = useState<CMMSSchedule>(
    {} as CMMSSchedule
  );
  const [successModal, setSuccessModal] = useState<boolean>(false);
  const [successEditModal, setSuccessEditModal] = useState<boolean>(false);
  const [failureModal, setFailureModal] = useState<boolean>(false);
  const [existingModal, setExistingModal] = useState<boolean>(false);
  const [disableSubmit, setDisableSubmit] = useState<boolean>(false);
  const [invalidDateCheck, setInvalidDateCheck] = useState<boolean>(false);
  const [isReady, setIsReady] = useState<boolean>(false);

  const router = useRouter();

  // Update the state of newSchedule on change of input fields
  function updateSchedule(
    event: React.ChangeEvent<
      HTMLTextAreaElement | HTMLInputElement | HTMLSelectElement
    >
  ) {
    // console.log(event.target.type);
    setNewSchedule((prev) => {
      let value =
        event.target.type === "date"
          ? new Date(event.target.value)
          : event.target.name === "checklistId" ||
            event.target.name === "recurringPeriod" ||
            event.target.name === "reminderRecurrence" || 
            event.target.name === "advanceSchedule"
          ? parseInt(event.target.value)
          : event.target.value;
      const tmp = { ...prev };
      // Resets recurring period input and check validity of start and end date whenever a start/end date is changed
      if (event.target.name === "startDate") {
        tmp.recurringPeriod = -1;
        if (prev.endDate < value) {
          setInvalidDateCheck(true);
          setDisableSubmit(true);
        } else {
          setInvalidDateCheck(false);
          setDisableSubmit(false);
        }
      } else if (event.target.name === "endDate") {
        tmp.recurringPeriod = -1;
        if (value < prev.startDate) {
          setInvalidDateCheck(true);
          setDisableSubmit(true);
        } else {
          setInvalidDateCheck(false);
          setDisableSubmit(false);
        }
      }
      return {
        ...tmp,
        [event.target.name]: value,
      };
    });
  }

  const scheduleValidateExistingSchedule = (callback: () => void) => () => {
    // find existing schedules
    const existingSchedule = props.schedules?.find((schedule) => {
      const scheduleStartDate = moment(schedule.start_date).format("YYYY-MM-DD");
      const scheduleEndDate = moment(schedule.end_date).format("YYYY-MM-DD");
      const newStartDate = moment(newSchedule.startDate).format("YYYY-MM-DD");
      const newEndDate = moment(newSchedule.endDate).format("YYYY-MM-DD");

      // Check if the existing schedule falls within the new date range
      return (
        (scheduleStartDate >= newStartDate && scheduleStartDate <= newEndDate) ||
        (scheduleEndDate >= newStartDate && scheduleEndDate <= newEndDate) ||
        (scheduleStartDate <= newStartDate && scheduleEndDate >= newEndDate) 
      );
    });

    if (existingSchedule) {
      setExistingModal(true);
    } else {
      setExistingModal(false);
      callback();
    }
  };

  // Submit the new schedule for maintenance on submit click
  function handleSubmit() {
    // Disable submit button
    setDisableSubmit(true);
    // Check for missing entries
    if (!scheduleValidator(newSchedule)) {
      setFailureModal(true);
      // Enable submit button
      setDisableSubmit(false);
    }
    // adding a schedule checklist
    else if (props.timeline) {
      scheduleMaintenance(newSchedule).then((result) => {
        setSuccessModal(true);
        setTimeout(() => {
          location.reload();
          /*
          router.replace("/Schedule/Timeline/" + props.timeline?.id);
          */
        }, 1000);
      });
    }
    // updating a schedule checklist
    else if (props.scheduleEvent) {
      editDraftSchedule(newSchedule).then((result) => {
        // console.log(result);
        setSuccessEditModal(true);
        setTimeout(() => {
          router.replace(
            "/Schedule/Timeline/" + props.scheduleEvent?.timelineId
          );
        }, 1000);
      });
    }
  }

  useEffect(() => {
    setIsReady(false);
    if (props.scheduleEvent) {
      setNewSchedule(props.scheduleEvent);
    } else {
      setNewSchedule({
        plantId: props.timeline?.plantId,
        timelineId: props.timeline?.id,
        startDate: new Date(minDate),
        endDate: new Date(minDate),
        status: 3,
      } as CMMSSchedule);
    }

    setTimeout(() => {
      setIsReady(true);
    }, 3000);
  }, [props.timeline, props.scheduleEvent]);

  return (
    <div>
      <ModuleModal
        isOpen={props.isOpen}
        title={props.title}
        closeModal={props.closeModal}
      >
        {isReady ? (
          <div>
            <table className={styles.eventModalTable}>
              <tbody>
                <tr className={styles.eventModalTableRow}>
                  <th>Checklist Name:</th>
                  <td>
                    <ChecklistSelect
                      onChange={updateSchedule}
                      name="checklistId"
                      value={newSchedule.checklistId}
                      plantId={
                        props.timeline
                          ? (props.timeline?.plantId as number)
                          : props.scheduleEvent
                          ? (props.scheduleEvent.plantId as number)
                          : 0 //error
                      }
                    />
                  </td>
                </tr>
                <tr className={styles.eventModalTableRow}>
                  <th>Plant:</th>
                  {props.timeline && <td>{props.timeline?.plantName}</td>}
                  {props.scheduleEvent && (
                    <td>{props.scheduleEvent?.plantName}</td>
                  )}
                </tr>
                <tr className={styles.eventModalTableRow}>
                  <th>Start Date:</th>
                  <td>
                    <input
                      className="form-control"
                      type="date"
                      min={minDate}
                      name="startDate"
                      value={
                        newSchedule.startDate
                          ? newSchedule.startDate.toISOString().slice(0, 10)
                          : minDate
                      }
                      onChange={updateSchedule}
                      onKeyDown={(e) => e.preventDefault()}
                    />
                  </td>
                </tr>
                <tr className={styles.eventModalTableRow}>
                  <th>End Date:</th>
                  <td>
                    <input
                      className="form-control"
                      type="date"
                      min={minDate}
                      name="endDate"
                      value={
                        newSchedule.endDate
                          ? newSchedule.endDate.toISOString().slice(0, 10)
                          : minDate
                      }
                      onChange={updateSchedule}
                      onKeyDown={(e) => e.preventDefault()}
                    />
                  </td>
                </tr>
                <tr className={styles.eventModalTableRow}>
                  <th>Recurring Period:</th>
                  <td>
                    <RecurrenceSelect
                      startDate={newSchedule.startDate}
                      endDate={newSchedule.endDate}
                      name="recurringPeriod"
                      onChange={updateSchedule}
                      value={newSchedule.recurringPeriod}
                    />
                  </td>
                </tr>
                <tr className={styles.eventModalTableRow}>
                  <th>Reminder Frequency:</th>
                  <td>
                    <select
                      className="form-select"
                      name="reminderRecurrence"
                      onChange={updateSchedule}
                      value={newSchedule.reminderRecurrence}
                    >
                      <option hidden>Select the Reminder Frequency</option>
                      <option value={1}>1 Day Before</option>
                      <option value={0}>No Reminders</option>
                    </select>
                  </td>
                </tr>
                <tr className={styles.eventModalTableRow}>
                  <th>Advanced Schedule Period:</th>
                  <td>
                    <select
                      className="form-select"
                      name="advanceSchedule"
                      onChange={updateSchedule}
                      value={newSchedule.advanceSchedule}
                    >
                      <option hidden>Select Advanced Period</option>
                      <option value={0}>No Advanced Checklist Creation</option>
                      <option value={1}>1 Day in Advance</option>
                      <option value={2}>2 Days in Advance</option>
                      <option value={3}>3 Days in Advance</option>
                    </select>
                  </td>
                </tr>
                <tr className={styles.eventModalTableRow}>
                  <th>Assigned To:</th>
                  <td>
                    <AssignToSelect
                      onChange={(value, action) => {
                        let newAssignedID =
                          +(value as SingleValue<AssignedUserOption>)!.value;
                        if (typeof newAssignedID == "number") {
                          setNewSchedule((prev) => {
                            return {
                              ...prev,
                              assignedIds: [newAssignedID],
                            };
                          });
                        }
                      }}
                      plantId={
                        props.timeline
                          ? (props.timeline?.plantId as number)
                          : props.scheduleEvent
                          ? (props.scheduleEvent.plantId as number)
                          : 0 //error
                      }
                      defaultIds={props.scheduleEvent?.assignedIds}
                      isSingle
                    />
                  </td>
                </tr>
                <tr className={styles.eventModalTableRow}>
                  <th>Remarks:</th>
                  <td>
                    <textarea
                      className="form-control"
                      maxLength={100}
                      name="remarks"
                      value={newSchedule.remarks}
                      onChange={updateSchedule}
                    ></textarea>
                  </td>
                </tr>
              </tbody>
            </table>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div>
                {invalidDateCheck && (
                  <p className={styles.invalidDateBox}>
                    Please ensure that the start date is before the end date.
                  </p>
                )}
              </div>
              <TooltipBtn
                toolTip={false}
                onClick={scheduleValidateExistingSchedule(handleSubmit)}
                disabled={disableSubmit}
              >
                {props.timeline && <div>Create</div>}
                {props.scheduleEvent && <div>Update</div>}
              </TooltipBtn>
            </div>
          </div>
        ) : (
          <div style={{ width: "100%", textAlign: "center" }}>
            <ThreeDots fill="black" />
          </div>
        )}
      </ModuleModal>
      <ModuleSimplePopup
        modalOpenState={successModal}
        setModalOpenState={setSuccessModal}
        title="Success"
        text="New maintenance successfully scheduled!"
        icon={SimpleIcon.Check}
        shouldCloseOnOverlayClick={true}
      />

      <ModuleSimplePopup
        modalOpenState={successEditModal}
        setModalOpenState={setSuccessEditModal}
        title="Success"
        text="Maintenance successfully updated!"
        icon={SimpleIcon.Check}
        shouldCloseOnOverlayClick={true}
      />

      <ModuleSimplePopup
        modalOpenState={failureModal}
        setModalOpenState={setFailureModal}
        title="Incomplete Maintenance"
        text="Please fill in the missing details for the maintenance."
        icon={SimpleIcon.Cross}
        shouldCloseOnOverlayClick={true}
      />

      <ModuleSimplePopup
        modalOpenState={existingModal}
        setModalOpenState={setExistingModal}
        title="Existing Maintenance"
        text="There is already an existing maintenance scheduled for this checklist. Do you still want to create?"
        icon={SimpleIcon.Exclaim}
        shouldCloseOnOverlayClick={true}
        buttons={[
          <TooltipBtn
            key={1}
            toolTip={false}
            onClick={() => {
              handleSubmit();
            }}
          >
            Create
          </TooltipBtn>,
          <TooltipBtn
            key={1}
            toolTip={false}
            onClick={() => {
              setExistingModal(false);
            }}
          >
            Cancel
          </TooltipBtn>
        ]}

      />
    </div>
  );
}
