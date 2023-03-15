import React, { useState, useEffect, PropsWithChildren } from "react";
import Modal from "react-modal";
import { useRouter } from "next/router";
import { dateFormat, toPeriodString } from "./ScheduleTemplate";
import {
    CMMSScheduleEvent,
    CMMSUser,
    CMMSSchedule,
    CMMSTimeline,
} from "../../types/common/interfaces";
import EventModalUser from "./EventModalUser";
import { useCurrentUser } from "../SWR";
import { GrClose } from "react-icons/gr";
import TooltipBtn from "../TooltipBtn";
import AssignToSelect, { AssignedUserOption } from "./AssignToSelect";
import ModuleSimplePopup, { SimpleIcon } from "../ModuleLayout/ModuleSimplePopup";
import styles from "../../styles/Schedule.module.scss";
import axios from "axios";
import { ChangeEvent, TargetedEvent } from "preact/compat";
import ScheduleModal from "./ScheduleModal";

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

interface NewScheduleInfo extends CMMSSchedule {
    date: Date;
}

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
    const [newSchedule, setNewSchedule] = useState<NewScheduleInfo>({} as NewScheduleInfo);
    const [scheduleModal, setScheduleModal] = useState<boolean>(false);
    const [scheduleObject, setScheduleObject] = useState<CMMSSchedule>();

    // Get the current user
    const { data, error } = useCurrentUser();

    const router = useRouter();

    function closeModal() {
        props.closeModal();
        setEditMode(false);
        setNewSchedule({} as NewScheduleInfo);
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

    useEffect(() => {
        setNewSchedule({
            checklistId: props.event?.extendedProps.checklistId as number,
            checklistName: props.event?.title,
            startDate: props.event?.extendedProps.startDate as Date,
            endDate: props.event?.extendedProps.endDate as Date,
            date: props.event?.extendedProps.date as Date,
            recurringPeriod: props.event?.extendedProps.recurringPeriod as number,
            assignedIds: props.event?.extendedProps.assignedIds as number[],
            remarks: props.event?.extendedProps.remarks as string,
            plantId: props.event?.extendedProps.plantId as number,
            timelineId: props.event?.extendedProps.timelineId as number,
            reminderRecurrence: 1,
            prevId: props.event?.extendedProps.scheduleId,
        });

        setEditDeleteModal(false);

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

            setScheduleObject({
                scheduleId: props.event.extendedProps.scheduleId,
                checklistId: props.event.extendedProps.checklistId,
                checklistName: props.event.title,
                startDate: new Date(props.event.extendedProps.startDate),
                endDate: new Date(props.event.extendedProps.endDate),
                recurringPeriod: props.event.extendedProps.recurringPeriod,
                assignedIds: props.event.extendedProps.assignedIds,
                remarks: props.event.extendedProps.remarks,
                plantId: props.event.extendedProps.plantId as number,
                plantName: props.event?.extendedProps.plant,
                timelineId: props.event.extendedProps.timelineId,
                reminderRecurrence: 1,
            });
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
                                                value={newSchedule?.date.toISOString().slice(0, 10)}
                                                name="date"
                                                onChange={updateSchedule}
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
                                        {dateFormat(props.event.extendedProps.startDate as Date)}
                                    </td>
                                </tr>
                                <tr className={styles.eventModalTableRow}>
                                    <th>End Date:</th>
                                    <td>{dateFormat(props.event.extendedProps.endDate as Date)}</td>
                                </tr>
                                <tr className={styles.eventModalTableRow}>
                                    <th>Recurring Period:</th>
                                    <td>
                                        {toPeriodString(props.event.extendedProps.recurringPeriod)}
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
                                                        value.forEach(
                                                            (option: AssignedUserOption) => {
                                                                ids.push(option.value);
                                                            }
                                                        );
                                                        newData.assignedIds = ids;
                                                        return newData;
                                                    });
                                                }}
                                                defaultIds={props.event.extendedProps.assignedIds}
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
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <div></div>
                        {props.deleteEditDraft && (
                            <div style={{ display: "flex" }}>
                                <TooltipBtn
                                    toolTip={false}
                                    onClick={() => {
                                        setScheduleModal(true);
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
                            props.event.extendedProps.recurringPeriod > 1 && (
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
                                                (newSchedule.remarks ==
                                                    props.event.extendedProps.remarks &&
                                                    newSchedule.date ==
                                                        props.event.extendedProps.date &&
                                                    newSchedule.assignedIds.sort().join("") ==
                                                        props.event.extendedProps.assignedIds
                                                            .sort()
                                                            .join("")) ||
                                                newSchedule.assignedIds.length == 0 ||
                                                !newSchedule.date ||
                                                newSchedule.date == null
                                            }
                                        >
                                            Confirm
                                        </TooltipBtn>
                                    )}
                                </div>
                            )}
                    </div>
                </div>
            )}

            <ModuleSimplePopup
                modalOpenState={editDeleteModal}
                setModalOpenState={setEditDeleteModal}
                title="Maintenance Deleted"
                text="Schedule Maintenance has been successfully deleted."
                icon={SimpleIcon.Check}
            />

            <ScheduleModal
                isOpen={scheduleModal}
                closeModal={() => setScheduleModal(false)}
                title="Schedule Maintenance"
                scheduleEvent={scheduleObject}
            />
        </Modal>
    );
}
