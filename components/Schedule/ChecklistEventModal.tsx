import { useRouter } from "next/router";
import React, { PropsWithChildren, useEffect, useState } from "react";
import { GrClose } from "react-icons/gr";
import Modal from "react-modal";
import styles from "../../styles/Schedule.module.scss";
import instance from "../../types/common/axios.config";
import { Role } from "../../types/common/enums";
import {
  CMMSSchedule,
  CMMSScheduleEvent,
  CMMSUser
} from "../../types/common/interfaces";
import ModuleSimplePopup, {
  SimpleIcon,
} from "../ModuleLayout/ModuleSimplePopup";
import { useCurrentUser } from "../SWR";
import TooltipBtn from "../TooltipBtn";
import AssignToSelect, { AssignedUserOption } from "./AssignToSelect";
import EventModalUser from "./EventModalUser";
import RecurrenceSelect from "./RecurrenceSelect";
import ScheduleModal, {
  scheduleMaintenance,
  scheduleValidator,
} from "./ScheduleModal";
import { dateFormat, toPeriodString } from "./ScheduleTemplate";
import { SingleValue } from "react-select";

interface CustomMouseEventHandler extends React.MouseEventHandler {
  (event: React.MouseEvent | void): void;
}

export interface ModalProps extends PropsWithChildren {
  isOpen: boolean;
  closeModal: CustomMouseEventHandler;
  event?: CMMSScheduleEvent;
  deleteEditDraft?: boolean;
  editSingle?: boolean;
}

// export interface NewScheduleInfo extends CMMSSchedule {
//     date: Date;
// }

// Delete individual schedules during the draft phase
async function deleteSchedule(id: number) {
  return await instance
    .delete("/api/schedule/" + id)
    .then((res) => {
      return res;
    })
    .catch((err) => console.log(err));
}

export default function ChecklistEventModal(props: ModalProps) {
  // Store the assigned users as a state
  const [assignedUsers, setAssignedUsers] = useState<CMMSUser[]>([]);
  const [editDeleteModal, setEditDeleteModal] = useState<boolean>(false);
  const [editMode, setEditMode] = useState<boolean>(false);
  const [singleMode, setSingleMode] = useState<boolean>(false);
  const [multipleMode, setMultipleMode] = useState<boolean>(false);
  const [newSchedule, setNewSchedule] = useState<CMMSSchedule>(
    {} as CMMSSchedule
  );
  const [scheduleModal, setScheduleModal] = useState<boolean>(false);
  const [submitModal, setSubmitModal] = useState<boolean>(false);
  const [failureModal, setFailureModal] = useState<boolean>(false);
  const [disableSubmit, setDisableSubmit] = useState<boolean>(false);
  // const [scheduleObject, setScheduleObject] = useState<CMMSSchedule>();

    // Get the current user
    const { data: user, error } = useCurrentUser();

  const router = useRouter();

  function closeModal() {
    props.closeModal();
    setEditMode(false);
    if (editMode) setNewSchedule({} as CMMSSchedule);
  }

  function handleDelete() {
    if (props.event) {
      deleteSchedule(props.event.extendedProps.scheduleId).then((result) => {
        setEditDeleteModal(true);
        setTimeout(() => {
          location.reload();
          /*router.replace(
            "/Schedule/Timeline/" + props.event?.extendedProps.timelineId
          );*/
        }, 1000);
      });
    }
  }

  function updateSchedule(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    setNewSchedule((prev) => {
      return {
        ...prev,
        [e.target.name]:
          ["date","startDate","endDate"].includes(e.target.name) ? new Date(e.target.value) : e.target.value,
      };
    });
  }

  function submitEvent() {
    setDisableSubmit(true);

    let schedule: CMMSSchedule = {
      checklistId: newSchedule.checklistId,
      startDate: newSchedule.date as Date,
      endDate: newSchedule.date as Date,
      recurringPeriod: newSchedule.recurringPeriod,
      assignedIds: newSchedule.assignedIds,
      remarks: newSchedule.remarks,
      plantId: newSchedule.plantId,
      timelineId: newSchedule.timelineId,
      reminderRecurrence: 1,
      prevId: newSchedule.prevId,
      status: 4,
      index: newSchedule.index,
      advanceSchedule: newSchedule.advanceSchedule,
      mode: "single"
    };

    if(multipleMode) {
      schedule = {
        ...schedule,
        startDate: newSchedule.startDate,
        endDate: newSchedule.endDate,
        mode: "multiple"
      };
    }

    console.log(newSchedule)

    if (scheduleValidator(schedule)) {
      scheduleMaintenance(schedule).then((result) => {
        setSubmitModal(true);
        // router.push("/Schedule");
        setTimeout(() => {
          setSubmitModal(false);
          setDisableSubmit(false);
          closeModal();
        }, 1000);
      });
    } else {
      setFailureModal(true);
      setDisableSubmit(false);
      setTimeout(() => {
        setFailureModal(false);
      }, 1000);
    }
  }

  // check if remarks are the same
  function isRemarkSame(oldRemark: string, newRemark: string) {
    return oldRemark == newRemark;
  }

  // check if dates are the same
  function isDateSame(oldDate: Date, newDate: Date) {
    return (
      oldDate.toISOString().slice(0, 10) == newDate.toISOString().slice(0, 10)
    );
  }

  // check if assigned users are the same
  function isAssignedSame(oldAssigned: number[], newAssigned: number[]) {
    // if there are assigned users initially
    if (oldAssigned) {
      return oldAssigned.sort().join("") == newAssigned.sort().join("");
    }
    // if no assigned users initially, return true if no new assign or new assignment array is empty
    else {
      return !newAssigned || newAssigned.length == 0;
    }
  }

  // function to handle boolean logic for submit button for edit single event
  function isDisabled(
    oldSchedule: CMMSScheduleEvent,
    newSchedule: CMMSSchedule,
    disabled: boolean
  ) {
    return (
      isRemarkSame(oldSchedule.extendedProps.remarks, newSchedule.remarks) &&
      isDateSame(
        oldSchedule.extendedProps.date as Date,
        newSchedule.date as Date
      ) &&
      isAssignedSame(
        oldSchedule.extendedProps.assignedIds,
        newSchedule.assignedIds
      ) &&
      disabled
    );
  }

  // Start and end dates of the schedule
  const startDate = new Date(props.event?.extendedProps.startDate as Date);
  const endDate = new Date(props.event?.extendedProps.endDate as Date);
  const period = props.event?.extendedProps.recurringPeriod as number;

  // plus minus recurrence period from the day of the event
  let date = new Date(props.event?.extendedProps.date as Date);
  const upper = new Date(date.setDate(date.getDate() + period));
  date = new Date(props.event?.extendedProps.date as Date);
  const lower = new Date(date.setDate(date.getDate() - period));

  // compare with today and the schedule date ranges
  let today = new Date();
  const upperStr = upper >= endDate ? endDate : upper;
  today = new Date();
  const lowerStr =
    lower <= today
      ? new Date(today.setDate(today.getDate() + 1))
      : lower <= startDate
      ? startDate
      : lower;

  useEffect(() => {
    setEditDeleteModal(false);
    setSubmitModal(false);
    setDisableSubmit(true);

    if (props.event) {
      const users: CMMSUser[] = [];
      const noOfAssigned = props.event.extendedProps.assignedIds
        ? props.event.extendedProps.assignedIds.length
        : 0;
      for (let i = 0; i < noOfAssigned; i++) {
        users.push({
          id: props.event.extendedProps.assignedIds[i],
          email: props.event.extendedProps.assignedEmails[i],
          fname: props.event.extendedProps.assignedFnames[i],
          lname: props.event.extendedProps.assignedLnames[i],
          username: props.event.extendedProps.assignedUsernames[i],
          role_name: props.event.extendedProps.assignedRoles[i],
        });
      }
      setAssignedUsers(users);

      setNewSchedule({
        checklistId: props.event.extendedProps.checklistId,
        checklistName: props.event.title,
        startDate: new Date(props.event.extendedProps.startDate),
        endDate: new Date(props.event.extendedProps.endDate),
        date: props.event.extendedProps.date as Date,
        recurringPeriod: props.event.extendedProps.recurringPeriod,
        assignedIds: props.event.extendedProps.assignedIds,
        remarks: props.event.extendedProps.remarks,
        plantId: props.event.extendedProps.plantId as number,
        plantName: props.event.extendedProps.plant,
        timelineId: props.event.extendedProps.timelineId,
        reminderRecurrence: 1,
        prevId: props.event.extendedProps.scheduleId,
        index: props.event.extendedProps.index,
        scheduleId: props.event.extendedProps.scheduleId,
        advanceSchedule: props.event.extendedProps.advanceSchedule,
      });

      // setScheduleObject({
      //     scheduleId: props.event.extendedProps.scheduleId,
      //     checklistId: props.event.extendedProps.checklistId,
      //     checklistName: props.event.title,
      //     startDate: new Date(props.event.extendedProps.startDate),
      //     endDate: new Date(props.event.extendedProps.endDate),
      //     recurringPeriod: props.event.extendedProps.recurringPeriod,
      //     assignedIds: props.event.extendedProps.assignedIds,
      //     remarks: props.event.extendedProps.remarks,
      //     plantId: props.event.extendedProps.plantId as number,
      //     plantName: props.event?.extendedProps.plant,
      //     timelineId: props.event.extendedProps.timelineId,
      //     reminderRecurrence: 1,
      // });
    }
  }, [props.event]);

  const assignedUserElement = assignedUsers.map((user, index) => {
    return (
      // <span key={user.id} className={styles.eventModalAssignedUser}>{index + 1}. {user.name}</span>
      <EventModalUser
        key={user.id}
        serial={index + 1}
        role_name={user.role_name}
        fname={user.fname as string}
        lname={user.lname as string}
        username={user.username as string}
        id={user.id}
        email={user.email as string}
      />
    );
  });
  // console.log(newSchedule);

  const handleEdit = (type: string) => {
    setEditMode((prev) => !prev);
    if(type=="single") {
      setSingleMode(true);
      setMultipleMode(false);
    } else {
      setMultipleMode(true);
      setSingleMode(false);
    }

  }

    return (
        <div>
            {props.event?.extendedProps.checklistId && <div>

            
            <Modal
                isOpen={props.isOpen}
                ariaHideApp={false}
                onRequestClose={closeModal}
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
                                onClick={closeModal}
                                size={20}
                                className={styles.eventModalClose}
                            />
                        </div>
                        <div>
                            <table className={styles.eventModalTable}>
                                <tbody>
                                    <tr className={styles.eventModalTableRow}>
                                        <th>Schedule ID:</th>
                                        <td>{props.event.extendedProps.scheduleId}</td>
                                    </tr>
                                    <tr className={styles.eventModalTableRow}>
                                        <th>Checklist ID:</th>
                                        <td>{props.event.extendedProps.checklistId}</td>
                                    </tr>
                                    <tr className={styles.eventModalTableRow}>
                                        <th>Plant:</th>
                                        <td>{props.event.extendedProps.plant}</td>
                                    </tr>
                                    <tr className={styles.eventModalTableRow}>
                                        <th>Date:</th>
                                        {editMode && singleMode ? (
                                            <td>
                                                <input
                                                    type="date"
                                                    className="form-control"
                                                    value={(newSchedule?.date as Date)
                                                        .toISOString()
                                                        .slice(0, 10)}
                                                    name="date"
                                                    onChange={updateSchedule}
                                                    min={lowerStr.toISOString().slice(0, 10)}
                                                    max={upperStr.toISOString().slice(0, 10)}
                                                    onKeyDown={(e) => e.preventDefault()}
                                                />
                                            </td>
                                        ) : (
                                            <td>
                                                {dateFormat(props.event.extendedProps.date as Date)}
                                            </td>
                                        )}
                                    </tr>
                                    <tr className={styles.eventModalTableRow}>
                                        <th>Start Date:</th>
                                        {editMode && multipleMode ? (
                                            <td>
                                                <input
                                                    type="date"
                                                    className="form-control"
                                                    value={(newSchedule?.startDate as Date)
                                                        .toISOString()
                                                        .slice(0, 10)}
                                                    name="startDate"
                                                    onChange={updateSchedule}
                                                    min={lowerStr.toISOString().slice(0, 10)}
                                                    max={upperStr.toISOString().slice(0, 10)}
                                                    onKeyDown={(e) => e.preventDefault()}
                                                />
                                            </td>
                                        ) : (
                                            <td>
                                                {dateFormat(props.event.extendedProps.startDate as Date)}
                                            </td>
                                        )}
                                    </tr>
                                    <tr className={styles.eventModalTableRow}>
                                        <th>End Date:</th>
                                        {editMode && multipleMode  ? (
                                            <td>
                                                <input
                                                    type="date"
                                                    className="form-control"
                                                    value={(newSchedule?.endDate as Date)
                                                        .toISOString()
                                                        .slice(0, 10)}
                                                    name="endDate"
                                                    onChange={updateSchedule}
                                                    min={lowerStr.toISOString().slice(0, 10)}
                                                    max={upperStr.toISOString().slice(0, 10)}
                                                    onKeyDown={(e) => e.preventDefault()}
                                                />
                                            </td>
                                        ) : (
                                            <td>
                                                {dateFormat(props.event.extendedProps.endDate as Date)}
                                            </td>
                                        )}
                                    </tr>
                                    <tr className={styles.eventModalTableRow}>
                                        <th>Recurring Period:</th>
                                        {editMode && multipleMode ? (
                                          <RecurrenceSelect
                                            startDate={newSchedule.startDate}
                                            endDate={newSchedule.endDate}
                                            name="recurringPeriod"
                                            onChange={() => updateSchedule}
                                            value={newSchedule.recurringPeriod}
                                          />
                                        ) : (
                                          <td>
                                              {toPeriodString(
                                                  props.event.extendedProps.recurringPeriod
                                              )}
                                          </td>
                                        )}
                                    </tr>
                                    <tr className={styles.eventModalTableRow}>
                                        <th>Advanced Schedule Period:</th>
                                        <td>
                                            {props.event.extendedProps.advanceSchedule 
                                            ? `${props.event.extendedProps.advanceSchedule} Day(s)` 
                                            : "NA"}
                                        </td>
                                    </tr>
                                    <tr className={styles.eventModalTableRow}>
                                        <th>Assigned To:</th>
                                        {editMode && (singleMode || multipleMode) ? (
                                            <td>
                                                {/*<AssignToSelect
                                                    plantId={
                                                        props.event.extendedProps.plantId as number
                                                    }
                                                    onChange={(value, action) => {
                                                        setNewSchedule((prev) => {
                                                            const newData = { ...prev };
                                                            const ids: number[] = [];
                                                            if (Array.isArray(value)) {
                                                                value?.forEach(
                                                                    (
                                                                        option: AssignedUserOption
                                                                    ) => {
                                                                        ids.push(option.value);
                                                                    }
                                                                );
                                                            }
                                                            newData.assignedIds = ids;
                                                            return newData;
                                                        });
                                                    }}
                                                    defaultIds={
                                                        props.event.extendedProps.assignedIds
                                                    }
                                                  />*/}
                                                <AssignToSelect
                                                    onChange={(value, action) => {
                                                      let newAssignedID =
                                                        +(value as SingleValue<AssignedUserOption>)!.value;
                                                      if (typeof newAssignedID == "number") {
                                                        console.log('newAssignedID', newAssignedID)
                                                        setNewSchedule((prev) => {
                                                          return {
                                                            ...prev,
                                                            assignedIds: [newAssignedID],
                                                          };
                                                        });
                                                      }
                                                    }}
                                                    plantId={
                                                        props.event.extendedProps.plantId as number
                                                    }
                                                    defaultIds={
                                                        props.event.extendedProps.assignedIds
                                                    }
                                                    isSingle
                                                  />
                                            </td>
                                        ) : (
                                            <td className={styles.eventModalAssignedUsers}>
                                                {assignedUserElement}
                                            </td>
                                        )}
                                    </tr>
                                    <tr className={styles.eventModalTableRow}>
                                        <th>Remarks:</th>
                                        {editMode ? (
                                            <td>
                                                <textarea
                                                    className="form-control"
                                                    value={newSchedule?.remarks}
                                                    onChange={updateSchedule}
                                                    name="remarks"
                                                ></textarea>
                                            </td>
                                        ) : (
                                            <td>{props.event.extendedProps.remarks}</td>
                                        )}
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <div style={{ display: "flex", justifyContent: "flex-end" }}>
                            {props.deleteEditDraft && props.event.extendedProps.isNewSchedule && (
                                <div style={{ display: "flex" }}>
                                    <TooltipBtn
                                        toolTip={false}
                                        onClick={() => {
                                            setScheduleModal(true);
                                            closeModal();
                                        }}
                                        style={{ marginRight: "10px" }}
                                    >
                                        Edit
                                    </TooltipBtn>
                                    <TooltipBtn
                                        toolTip={false}
                                        onClick={handleDelete}
                                        style={{ marginLeft: "10px" }}
                                    >
                                        Delete
                                    </TooltipBtn>
                                </div>
                            )}
                            {props.editSingle &&
                                (user?.role_id as number) != Role.Specialist &&
                                (props.event.extendedProps.date as Date) > new Date() &&
                                 (
                                    <div className={styles.eventModalButtonContainer}>
                                        <TooltipBtn
                                            toolTip={false}
                                            onClick={() => handleEdit("single")}
                                            style={{
                                                backgroundColor: editMode ? "#9EB23B" : "#B2B2B2",
                                                color: "#000000",
                                                border: "none",
                                            }}
                                        >
                                            {editMode ? "Cancel" : "Edit Single Event"}
                                        </TooltipBtn>
                                        {!editMode && (props.event.extendedProps.startDate as Date) > new Date() &&
                                          <TooltipBtn
                                              toolTip={false}
                                              onClick={() => handleEdit("multiple")}
                                              style={{
                                                  backgroundColor: editMode ? "#9EB23B" : "#B2B2B2",
                                                  color: "#000000",
                                                  border: "none",
                                              }}
                                          >
                                              Edit Event
                                          </TooltipBtn>
                                        }
                                        {editMode && (
                                            <TooltipBtn
                                                toolTip={false}
                                                style={{ backgroundColor: "#EB1D36" }}
                                                disabled={isDisabled(
                                                    props.event,
                                                    newSchedule,
                                                    disableSubmit
                                                )}
                                                onClick={submitEvent}
                                            >
                                                Confirm
                                            </TooltipBtn>
                                        )}
                                    </div>
                                )}
                        </div>
                    </div>
                )}
            </Modal>
            <ModuleSimplePopup
                modalOpenState={editDeleteModal}
                setModalOpenState={setEditDeleteModal}
                title="Maintenance Deleted"
                text="Schedule Maintenance has been successfully deleted."
                icon={SimpleIcon.Check}
                shouldCloseOnOverlayClick={true}
            />
            <ModuleSimplePopup
                modalOpenState={submitModal}
                setModalOpenState={setSubmitModal}
                title="Submitted"
                text="Changes to event has to been sent for approval."
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

            <ScheduleModal
                isOpen={scheduleModal}
                closeModal={() => {
                    setScheduleModal(false);
                }}
                title="Schedule Maintenance"
                scheduleEvent={newSchedule}
            />
            </div>}
        </div>
    );
}
