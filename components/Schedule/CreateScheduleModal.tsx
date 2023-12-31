/* 
  EXPLANATION

  CreateScheduleModal accepts the following props:

  title
  option
  timelineId
  isManage
  specificTimelineId


  - option is a prop that accepts an enum value in ScheduleCreateOptions
    It is a way of defining a usage of the modal whether it will
    be used to create a New schedule, choose from Draft or from Most Recent
    Approved

  - timelineId is a prop that is passed when the there is default selected 
    timeline with prefilled details

  - isManage is a prop used when the component is used in the manage page
    When isManage is used, the modal is entirely for view purposes and 
    no edits can be made

  - specificTimelineId is used when you only want to parse in only 1 prop to the modal
    this is used in the drafts page where we want to submit specific schedules for approval

  - closeOnblur is to allow the prop to close when blur
*/

import React, { useEffect, useState } from "react";
import Modal from "react-modal";
import { ModalProps } from "./ChecklistEventModal";
import TooltipBtn from "../TooltipBtn";
import { GrClose } from "react-icons/gr";
import styles from "../../styles/Schedule.module.scss";
import PlantSelect from "../PlantSelect";
import TimelineSelect from "./TimelineSelect";
import ModuleSimplePopup, {
  SimpleIcon,
} from "../ModuleLayout/ModuleSimplePopup";
import { useRouter } from "next/router";
import instance from "../../types/common/axios.config";
import { CMMSTimeline, CMMSSchedule } from "../../types/common/interfaces";
import { ScheduleCreateOptions } from "../../pages/Schedule/Create";
import { getTimeline } from "../../pages/Schedule/Timeline/[id]";
import { getTimelinesByStatus } from "./TimelineSelect";
import { getSchedules } from "../../pages/Schedule/Timeline/[id]";
import { ScheduleInfo } from "./ScheduleTemplate";
import ApprovedScheduleInput from "./ApprovedScheduleInput";
import { scheduleMaintenance } from "./ScheduleModal";
import { minDate } from "./ScheduleModal";
import { AssignedUserOption } from "./AssignToSelect";
import { SingleValue } from "react-select";

interface CreateScheduleModalProps extends ModalProps {
  title?: string;
  option?: ScheduleCreateOptions;
  timelineId?: number;
  isManage?: boolean;
  specificTimelineId?: number;
  closeOnBlur?: boolean;
  autoSelect?: boolean;
}

// Create a new timeline
async function createTimeline(data: CMMSTimeline) {
  return await instance
    .post("/api/timeline", { data })
    .then((res) => {
      return res.data;
    })
    .catch((err) => console.log(err));
}

// Edit only certain timeline details
async function editTimeline(data: CMMSTimeline, id: number) {
  return await instance
    .patch("/api/timeline/" + id, { data })
    .then((res) => {
      return res.data;
    })
    .catch((err) => console.log(err));
}

// Get the most approved timelines for each plant
async function getApprovedTimeline(plantId: number) {
  const timelines = await getTimelinesByStatus(1);
  if (timelines) return timelines.filter((item) => item.plantId === plantId)[0];
}

async function checkScheduleList(scheduleList: CMMSSchedule[]) {
  for (let i = 0; i < scheduleList.length; i++) {
    if (
      !scheduleList[i].assignedIds ||
      scheduleList[i].assignedIds.length === 0 ||
      !scheduleList[i].recurringPeriod ||
      !scheduleList[i].startDate ||
      !scheduleList[i].endDate ||
      // !scheduleList[i].remarks ||
      // scheduleList[i].remarks === "" ||
      scheduleList[i].recurringPeriod === -1
    ) {
      return scheduleList[i].scheduleId;
    }
  }
  return -1;
}

export default function CreateScheduleModal(props: CreateScheduleModalProps) {
  // Store new timeline data in a state
  const [timelineData, setTimelineData] = useState<CMMSTimeline>();
  const [isMissingDetailsModalOpen, setIsMissingDetailsModaOpen] =
    useState<boolean>(false);
  const [isWarningModalOpen, setIsWarningModaOpen] = useState<boolean>(false);
  const [scheduleList, setScheduleList] = useState<CMMSSchedule[]>([]);
  const [disableSubmit, setDisableSubmit] = useState<boolean>(false);

  const router = useRouter();

  // Store the input field changes to state
  function changeTimelineData(
    event: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) {
    setTimelineData((prevData) => {
      return {
        ...prevData,
        [event.target.name]:
          event.target.name === "plantId"
            ? parseInt(event.target.value)
            : event.target.value,
      } as CMMSTimeline;
    });
  }

  function changeTimelineDataOnTimelineSelect(
    event: React.ChangeEvent<HTMLSelectElement>
  ) {
    getTimeline(parseInt(event.target.value)).then((result) => {
      if (result) setTimelineData(result);
    });
  }

  function changeTimelineDataOnPlantSelect(
    event: React.ChangeEvent<HTMLSelectElement>
  ) {
    getApprovedTimeline(parseInt(event.target.value)).then((result) => {
      if (result) {
        setTimelineData(result);
        getSchedules(result.id as number).then((schedules) => {
          if (schedules) {
            const newSchedules = [] as CMMSSchedule[];
            schedules.forEach((item) => {
              newSchedules.push({
                checklistId: item.checklist_id,
                checklistName: item.checklist_name,
                remarks: item.remarks,
                plantId: parseInt(event.target.value),
                startDate: new Date(minDate),
                endDate: new Date(minDate),
                timelineId: timelineData?.id as number,
                scheduleId: item.schedule_id,
                isComplete: true,
                prevId: item.schedule_id,
              } as CMMSSchedule);
            });
            setScheduleList(newSchedules);
          }
        });
      }
    });
  }

  function changeScheduleList(event: React.ChangeEvent<HTMLInputElement>) {
    const meta = event.target.name.split("-");
    const scheduleId = parseInt(meta[0]);
    const field = meta[1];
    setScheduleList((prevList) => {
      return prevList.map((schedule) => {
        if (schedule.scheduleId === scheduleId) {
          if (field === "startDate" || field === "endDate")
            schedule.recurringPeriod = -1;
          return {
            ...schedule,
            [field]:
              field === "recurringPeriod"
                ? parseInt(event.target.value)
                : field === "startDate" || field === "endDate"
                ? new Date(event.target.value)
                : event.target.value,
          };
        } else {
          return schedule;
        }
      });
    });
  }

  // Close modal and empty all input fields
  function closeModal() {
    props.closeModal();
    setScheduleList([]);
    if (!props.isManage) setTimelineData({} as CMMSTimeline);
  }

  // Create a new timeline on form submit
  function handleSubmit() {
    // Check for unfilled form input
    if (!timelineData?.name || !timelineData?.plantId) {
      setIsMissingDetailsModaOpen(true);
    } else {
      if (props.option === ScheduleCreateOptions.New) {
        createTimeline(timelineData).then((result) => {
          router.push("/Schedule/Timeline/" + result);
        });
      } else if (props.option === ScheduleCreateOptions.Drafts) {
        editTimeline(timelineData, timelineData.id as number).then((result) => {
          router.push("/Schedule/Timeline/" + result);
        });
      } else if (props.option === ScheduleCreateOptions.Approved) {
        // Disable submit button
        setDisableSubmit(true);
        checkScheduleList(scheduleList).then((result) => {
          //To check whether there is missing details
          if (result != -1) {
            setScheduleList((prevList) => {
              return prevList.map((s) => {
                if (s.scheduleId === result) {
                  return { ...s, isComplete: false };
                }
                return { ...s, isComplete: true };
              });
            });
            setIsMissingDetailsModaOpen(true);
            // Enable submit button
            setDisableSubmit(false);
          } else {
            createTimeline(timelineData).then((result) => {
              setScheduleList((prevList) => {
                return prevList.map((s) => {
                  s.timelineId = result;
                  return s;
                });
              });
              scheduleList.forEach((schedule) => {
                scheduleMaintenance(schedule);
              });
              router.push("/Schedule/Timeline/" + result);
            });
          }
        });
      }
    }
  }

  const scheduleInputElements = scheduleList?.map((schedule) => {
    return (
      <ApprovedScheduleInput
        key={schedule.scheduleId}
        schedule={schedule}
        onChange={changeScheduleList}
        onAssignedChange={(value, action) => {
          const scheduleId = parseInt(action.name as string);
          const assignedId = (value as SingleValue<AssignedUserOption>)!.value;
          setScheduleList((prevList) => {
            return prevList.map((schedule) => {
              if (schedule.scheduleId === scheduleId) {
                return { ...schedule, assignedIds: [assignedId] };
              }
              return schedule;
            });
          });
        }}
        plantId={timelineData?.plantId as number}
      />
    );
  });

  useEffect(() => {
    if (props.timelineId)
      getTimeline(props.timelineId).then((result) => {
        if (result) setTimelineData(result);
      });
  }, [props.timelineId, props.option]);

  return (
    <Modal
      ariaHideApp={false}
      isOpen={props.isOpen}
      shouldCloseOnOverlayClick={props.closeOnBlur ? true : false}
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
          height: "60%",
          width: "60%",
          minWidth: "800px",
          margin: "auto",
          border: "2px solid #393E46",
        },
      }}
    >
      <div style={{ height: "100%", padding: "1rem" }}>
        <div className={styles.eventModalHeader}>
          <h3>{props.title}</h3>
          <GrClose
            size={20}
            onClick={closeModal}
            className={styles.eventModalClose}
          />
        </div>

        <div className={styles.modalForm}>
          {props.option === ScheduleCreateOptions.Drafts && (
            <label>
              <TimelineSelect
                autoSelect={true}
                status={3}
                onChange={(e) => {
                  changeTimelineDataOnTimelineSelect(e);
                }}
                name="name"
                userCreated={true}
                optionTitle="existing drafts"
                specificTimelineId={props.specificTimelineId}
              />
            </label>
          )}
          {props.option === ScheduleCreateOptions.Approved && (
            <label>
              <PlantSelect
                accessControl={true}
                onChange={(e) => {
                  if (props.option != ScheduleCreateOptions.Approved) {
                    changeTimelineData(e);
                  } else changeTimelineDataOnPlantSelect(e);
                }}
                name="plantId"
              />
            </label>
          )}
          <label>
            <p>Schedule Name</p>
            <input
              type="text"
              maxLength={80}
              className="form-control"
              onChange={(e) => changeTimelineData(e)}
              name="name"
              value={timelineData?.name ? timelineData.name : ""}
              style={{ backgroundColor: props.isManage ? "#B2B2B2" : "white" }}
              // placeholder="Schedule name"
              readOnly={props.isManage}
            />
          </label>

          <label>
            <p>Plant</p>
            {props.option === ScheduleCreateOptions.New && (
              <PlantSelect
                accessControl={true}
                onChange={(e) => {
                  if (props.option != ScheduleCreateOptions.Approved)
                    changeTimelineData(e);
                  else changeTimelineDataOnPlantSelect(e);
                }}
                name="plantId"
              />
            )}
            {(props.option === ScheduleCreateOptions.Drafts ||
              props.option === ScheduleCreateOptions.Approved ||
              props.isManage) && (
              <input
                type="text"
                className="form-control"
                style={{ backgroundColor: "#B2B2B2" }}
                // placeholder="Plant"
                value={timelineData?.plantName ? timelineData.plantName : ""}
                readOnly
              />
            )}
          </label>

          <label>
            <p>Description</p>
            <textarea
              className="form-control"
              style={{
                resize: "none",
                backgroundColor: props.isManage ? "#B2B2B2" : "white",
              }}
              rows={3}
              maxLength={250}
              name="description"
              onChange={(e) => changeTimelineData(e)}
              value={timelineData?.description ? timelineData.description : ""}
              // placeholder="Description"
              readOnly={props.isManage}
            ></textarea>
          </label>

          {props.option === ScheduleCreateOptions.Approved &&
            scheduleInputElements.length != 0 && (
              <table className="table table-sm table-responsive">
                <thead className={styles.scheduleTableHead}>
                  <tr>
                    <th style={{ width: "15%" }}>Checklist Name</th>
                    <th style={{ width: "8%" }}>Start Date</th>
                    <th style={{ width: "8%" }}>End Date</th>
                    <th style={{ width: "15%" }}>Recurrence</th>
                    <th style={{ width: "29%" }}>Assigned To</th>
                    <th style={{ width: "20%" }}>Remarks</th>
                  </tr>
                </thead>
                <tbody>{scheduleInputElements}</tbody>
              </table>
            )}

          {props.children}

          {!props.isManage && (
            <span className={styles.createScheduleModalBtnContainer}>
              <TooltipBtn
                toolTip={false}
                onClick={handleSubmit}
                style={{ marginBottom: "1rem" }}
                disabled={disableSubmit}
              >
                Confirm
              </TooltipBtn>
            </span>
          )}
        </div>
      </div>

      {/* {!props.isManage && (
                <span className={styles.createScheduleModalBtnContainer} >
                    <TooltipBtn toolTip={false} onClick={handleSubmit}>
                        Confirm
                    </TooltipBtn>
                </span>
            )} */}

      <ModuleSimplePopup
        modalOpenState={isMissingDetailsModalOpen}
        setModalOpenState={setIsMissingDetailsModaOpen}
        title="Missing Details"
        text="Please ensure that you have filled in all the required entries."
        icon={SimpleIcon.Cross}
        shouldCloseOnOverlayClick={true}
      />

      {!props.isManage && (
        <ModuleSimplePopup
          modalOpenState={isWarningModalOpen}
          setModalOpenState={setIsWarningModaOpen}
          title="Unsaved Changes"
          text="Are you sure you want to discard this entry? Your progress will be lost."
          icon={SimpleIcon.Exclaim}
          shouldCloseOnOverlayClick={true}
          buttons={[
            <TooltipBtn
              key="yes"
              toolTip={false}
              onClick={() => {
                props.closeModal();
                setTimelineData({} as CMMSTimeline);
                setIsWarningModaOpen(false);
              }}
            >
              Yes
            </TooltipBtn>,
          ]}
        />
      )}
    </Modal>
  );
}
