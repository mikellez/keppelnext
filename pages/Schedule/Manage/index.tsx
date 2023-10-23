import React, { useState, useEffect } from "react";
import ScheduleTemplate, {
  ScheduleInfo,
} from "../../../components/Schedule/ScheduleTemplate";
import {
  AiOutlineHistory,
  AiOutlineAudit,
  AiOutlineClockCircle,
  AiOutlineInfoCircle,
} from "react-icons/ai";
import { HiOutlineSwitchHorizontal } from "react-icons/hi";
import TooltipBtn from "../../../components/TooltipBtn";
import styles from "../../../styles/Schedule.module.scss";
import instance from "../../../types/common/axios.config";
import TimelineSelect from "../../../components/Schedule/TimelineSelect";
import EventSelect from "../../../components/Schedule/EventSelect";
import { getAllSchedules, getSchedules } from "../Timeline/[id]";
import CreateScheduleModal from "../../../components/Schedule/CreateScheduleModal";

import ModuleSimplePopup, {
  SimpleIcon,
} from "../../../components/ModuleLayout/ModuleSimplePopup";
import { useRouter } from "next/router";

// Function to change the status of a timeline
export async function changeTimelineStatus(
  newStatus: number,
  timelineId: number,
  remarks?: string
) {
  const requestBody: { remarks?: string } = {};

  // Conditionally add the remarks parameter if it's provided
  if (remarks !== undefined) {
    requestBody.remarks = remarks;
  }

  return await instance
    .patch(`/api/timeline/status/${newStatus}/${timelineId}`, requestBody)
    .then((res) => {
      return res.data;
    })
    .catch((err) => {
      console.log(err);
    });
}

export async function getScheduleById(id: number) {
  return await instance
    .get<ScheduleInfo[]>("/api/schedule/event/" + id)
    .then((res) => {
      return res.data;
    })
    .catch((err) => console.log(err));
}

export async function manageSingleEvent(
  schedule: ScheduleInfo,
  action: string,
  remarks: string
) {
  return await instance({
    url: "/api/event/",
    method: "patch",
    data: { schedule: schedule, action: action, remarks: remarks },
  })
    .then((res) => {
      return res.data;
    })
    .catch((err) => console.log(err));
}

export default function ManageSchedule() {
  const [isHistory, setIsHistory] = useState<boolean>(false);
  const [scheduleList, setScheduleList] = useState<ScheduleInfo[]>([]);
  const [manageModal, setManageModal] = useState<boolean>(false);
  const [isPopup, setIsPopup] = useState<boolean>(false);
  const [status, setStatus] = useState<number>(0);
  const [confirmModal, setConfirmModal] = useState<boolean>(false);
  const [outcomeModal, setOutcomeModal] = useState<boolean>(false);
  const [timelineId, setTimelineId] = useState<number>();
  const [remarks, setRemarks] = useState<string>("");
  const [eventMode, setEventMode] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedPlant, setSelectedPlant] = useState<number>(0);

  const router = useRouter();

	function updateSchedules(id : number) {
		getAllSchedules(id).then((schedules) => {	
			if (schedules == null) {
				return console.log("no schedules");	
			}

			setScheduleList(prev => [...prev.filter(item=>item.isNewSchedule), ...schedules]);
		});
	};

  useEffect(()=> {
    updateSchedules(selectedPlant);
	}, [selectedPlant, isLoading]);

  async function setSchedules(id: number) {
    getSchedules(id).then((schedules) => {
      if (schedules) {
        const updatedSchedules = schedules.map((schedule) => ({
            ...schedule,
            isNewSchedule: true
        }));

        setScheduleList(prev => [...prev.filter(item=>!item.isNewSchedule), ...schedules]);
      }
    });
  }

  // Called when the approve/reject buttons have been clicked
  function handleManage(newStatus: number) {
    console.log(eventMode)
    if (remarks === "" && newStatus != 1) {
      //Prompt for remarks
      setIsPopup(true);
    } else if (!eventMode) {
      changeTimelineStatus(newStatus, timelineId as number, remarks).then((result) => {
        // Close and clear modal fields
        setManageModal(false);
        setTimelineId(0);
        setOutcomeModal(true);
        setTimeout(() => {
          // Re-direct to same page (Manage Schedule)
          router.reload();
        }, 1000);
      });
    } else if (eventMode) {
      const action =
        newStatus === 1 ? "approve" : newStatus === 3 ? "reject" : "";
      manageSingleEvent(scheduleList[0], action, remarks).then((result) => {
        setOutcomeModal(true);
        setTimeout(() => {
          // Re-direct to same page (Manage Schedule)
          router.reload();
        }, 1000);
      });
    }
  }

  //
  function handleClick(newStatus: number) {
    if (remarks === "" && newStatus != 1) {
      //Prompt for remarks
      setIsPopup(true);
    } else {
      // Prompt for confirm
      setConfirmModal(true);
      setStatus(newStatus);
    }
  }

  return (
    <>
      <ScheduleTemplate
        title="Manage Schedule"
        header="Manage Schedule"
        schedules={scheduleList}
        eventClassNames={(args)=> {
            if(!args.event.extendedProps.isNewSchedule) {
                return ['overlay'];
            }

            return [];
        }}
      >
        {isHistory ? (
          <div style={{ width: "150px" }}>
            <TimelineSelect
              status={5}
              onChange={(e) => {
                setTimelineId(parseInt(e.target.value));
                setSchedules(parseInt(e.target.value));
              }}
              name="name"
            />
          </div>
        ) : eventMode ? (
          <div>
            <EventSelect
              onChange={(e) => {
                const tmp = e.target.value.split("-");
                getScheduleById(parseInt(tmp[1])).then((result) => {
                  if (result) {
                    setScheduleList(result);
                    setTimelineId(parseInt(tmp[0]));
                  }
                });
              }}
            />
          </div>
        ) : (
          <div style={{ width: "150px" }}>
            <TimelineSelect
              status={4}
              onChange={(e) => {
                setTimelineId(parseInt(e.target.value));
                setSchedules(parseInt(e.target.value));
              }}
              name="name"
            />
          </div>
        )}
        {!isHistory && (
          <TooltipBtn
            onClick={() => {
              setEventMode((prev) => !prev);
              setScheduleList([]);
              setTimelineId(0);
            }}
            text={!eventMode ? "View Single Event" : "View Schedules"}
          >
            <HiOutlineSwitchHorizontal size={20} />
          </TooltipBtn>
        )}
        {isHistory ? (
          <TooltipBtn
            text="Schedule info"
            onClick={() => setManageModal(true)}
            disabled={!timelineId}
          >
            <AiOutlineInfoCircle size={21} />
          </TooltipBtn>
        ) : (
          <TooltipBtn
            text="Manage pending schedules"
            onClick={() => {
              setManageModal(true);
            }}
            disabled={!timelineId}
          >
            <AiOutlineAudit size={21} />
          </TooltipBtn>
        )}

        <TooltipBtn
          onClick={() => {
            setIsHistory((prev) => !prev);
            setTimelineId(0);
          }}
          text={isHistory ? "View pending schedules" : "View past schedules"}
        >
          {isHistory ? (
            <AiOutlineClockCircle size={21} />
          ) : (
            <AiOutlineHistory size={21} />
          )}
        </TooltipBtn>
      </ScheduleTemplate>

      <CreateScheduleModal
        isOpen={manageModal}
        closeModal={() => setManageModal(false)}
        title={isHistory ? "Schedule Details" : "Manage Schedule"}
        timelineId={timelineId}
        isManage
      >
        {!isHistory && (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
          >
            <label>
              <p>Remarks</p>
              <textarea
                className="form-control"
                rows={2}
                maxLength={150}
                style={{ resize: "none" }}
                onChange={(e) => setRemarks(e.target.value)}
              ></textarea>
            </label>
            <div className={styles.createScheduleModalBtnContainer}>
              <TooltipBtn toolTip={false} onClick={() => handleClick(1)}>
                {" "}
                Approve{" "}
              </TooltipBtn>
              <TooltipBtn toolTip={false} onClick={() => handleClick(3)}>
                {" "}
                Reject{" "}
              </TooltipBtn>
            </div>
          </div>
        )}
      </CreateScheduleModal>

      <ModuleSimplePopup
        modalOpenState={isPopup}
        setModalOpenState={setIsPopup}
        title="Missing Remarks"
        text="Please write some remarks so that the engineers know why the schedule is rejected."
        icon={SimpleIcon.Exclaim}
        shouldCloseOnOverlayClick={true}
      />

      <ModuleSimplePopup
        modalOpenState={confirmModal}
        setModalOpenState={setConfirmModal}
        title="Confirm Action"
        text="Are you sure? This action cannot be undone."
        icon={SimpleIcon.Info}
        shouldCloseOnOverlayClick={true}
        buttons={
          <TooltipBtn toolTip={false} onClick={() => handleManage(status)}>
            Confirm
          </TooltipBtn>
        }
      />

      <ModuleSimplePopup
        modalOpenState={outcomeModal}
        setModalOpenState={setOutcomeModal}
        title={status === 1 ? "Approved" : status === 3 ? "Rejected" : ""}
        shouldCloseOnOverlayClick={true}
        text={
          status === 1
            ? "Schedule has been successfully approved."
            : status === 3
            ? "Schedule has been rejected."
            : ""
        }
        icon={SimpleIcon.Check}
      />
    </>
  );
}
