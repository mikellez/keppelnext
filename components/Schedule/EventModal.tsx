import React, { useState, useEffect, PropsWithChildren } from "react";
import Modal from "react-modal";
import { useRouter } from "next/router";
import { dateFormat, ScheduleInfo, toPeriodString } from "./ScheduleTemplate";
import {
    CMMSScheduleEvent,
    CMMSUser,
    CMMSSchedule,
    CMMSTimeline,
} from "../../types/common/interfaces";
import EventModalUser from "./EventModalUser";
import { useCurrentUser } from "../SWR";
import { GrClose, GrNew } from "react-icons/gr";
import TooltipBtn from "../TooltipBtn";
import AssignToSelect, { AssignedUserOption } from "./AssignToSelect";
import ModuleSimplePopup, { SimpleIcon } from "../ModuleLayout/ModuleSimplePopup";
import styles from "../../styles/Schedule.module.scss";
import axios from "axios";
import ScheduleModal, { scheduleMaintenance, scheduleValidator } from "./ScheduleModal";

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
    return await axios
        .delete("/api/schedule/" + id)
        .then((res) => {
            return res;
        })
        .catch((err) => console.log(err));
}

export default function EventModal(props: ModalProps) {
    // Store the assigned users as a state
    const [assignedUsers, setAssignedUsers] = useState<CMMSUser[]>([]);
    const [editDeleteModal, setEditDeleteModal] = useState<boolean>(false);
    const [editMode, setEditMode] = useState<boolean>(false);
    const [newSchedule, setNewSchedule] = useState<CMMSSchedule>({} as CMMSSchedule);
    const [scheduleModal, setScheduleModal] = useState<boolean>(false);
    const [submitModal, setSubmitModal] = useState<boolean>(false);
    const [failureModal, setFailureModal] = useState<boolean>(false);
    const [disableSubmit, setDisableSubmit] = useState<boolean>(false);
    // const [scheduleObject, setScheduleObject] = useState<CMMSSchedule>();

    // Get the current user
    const { data, error } = useCurrentUser();

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
                    router.replace("/Schedule/Timeline/" + props.event?.extendedProps.timelineId);
                }, 1000);
            });
        }
    }

    function updateSchedule(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
        setNewSchedule((prev) => {
            return {
                ...prev,
                [e.target.name]:
                    e.target.name == "date" ? new Date(e.target.value) : e.target.value,
            };
        });
    }

    function submitEvent() {
        setDisableSubmit(true);
        const schedule: CMMSSchedule = {
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
        };

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
        setDisableSubmit(false);

        if (props.event) {
            const users: CMMSUser[] = [];
            const noOfAssigned = props.event.extendedProps.assignedIds.length;
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

    return (
        <div>
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
                                        {editMode ? (
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
                                        <td>
                                            {dateFormat(
                                                props.event.extendedProps.startDate as Date
                                            )}
                                        </td>
                                    </tr>
                                    <tr className={styles.eventModalTableRow}>
                                        <th>End Date:</th>
                                        <td>
                                            {dateFormat(props.event.extendedProps.endDate as Date)}
                                        </td>
                                    </tr>
                                    <tr className={styles.eventModalTableRow}>
                                        <th>Recurring Period:</th>
                                        <td>
                                            {toPeriodString(
                                                props.event.extendedProps.recurringPeriod
                                            )}
                                        </td>
                                    </tr>
                                    <tr className={styles.eventModalTableRow}>
                                        <th>Assigned To:</th>
                                        {editMode ? (
                                            <td>
                                                <AssignToSelect
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
                            {props.deleteEditDraft && (
                                <div style={{ display: "flex" }}>
                                    <TooltipBtn
                                        toolTip={false}
                                        onClick={() => {
                                            setScheduleModal(true);
                                            closeModal();
                                            // console.log(scheduleObject);
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
                                (data?.role_id as number) < 4 &&
                                (props.event.extendedProps.date as Date) > new Date() &&
                                (props.event.extendedProps.recurringPeriod > 1 ||
                                    props.event.extendedProps.isSingle) && (
                                    <div className={styles.eventModalButtonContainer}>
                                        <TooltipBtn
                                            toolTip={false}
                                            onClick={() => setEditMode((prev) => !prev)}
                                            style={{
                                                backgroundColor: editMode ? "#9EB23B" : "#B2B2B2",
                                                color: "#000000",
                                                border: "none",
                                            }}
                                        >
                                            {editMode ? "Cancel" : "Edit"}
                                        </TooltipBtn>
                                        {editMode && (
                                            <TooltipBtn
                                                toolTip={false}
                                                style={{ backgroundColor: "#EB1D36" }}
                                                disabled={
                                                    ((newSchedule.remarks ==
                                                        props.event.extendedProps.remarks &&
                                                        newSchedule.date ==
                                                            props.event.extendedProps.date &&
                                                        newSchedule.assignedIds.sort().join("") ==
                                                            props.event.extendedProps.assignedIds
                                                                .sort()
                                                                .join("")) ||
                                                        newSchedule.assignedIds.length == 0 ||
                                                        !newSchedule.date ||
                                                        newSchedule.date == null) &&
                                                    disableSubmit
                                                }
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
            />
            <ModuleSimplePopup
                modalOpenState={submitModal}
                setModalOpenState={setSubmitModal}
                title="Submitted"
                text="Changes to event has to been sent for approval."
                icon={SimpleIcon.Check}
            />
            <ModuleSimplePopup
                modalOpenState={failureModal}
                setModalOpenState={setFailureModal}
                title="Incomplete Maintenance"
                text="Please fill in the missing details for the maintenance."
                icon={SimpleIcon.Cross}
            />
            {
                <ScheduleModal
                    isOpen={scheduleModal}
                    closeModal={() => setScheduleModal(false)}
                    title="Schedule Maintenance"
                    scheduleEvent={newSchedule}
                />
            }
        </div>
    );
}
