import React, {
  PropsWithChildren,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import { ModuleContent, ModuleHeader, ModuleMain } from "../";
import FullCalendar from "@fullcalendar/react";
import { EventClickArg } from "@fullcalendar/core";
import dayGridPlugin from "@fullcalendar/daygrid";
import ChecklistEventModal from "./ChecklistEventModal";
import { useRouter } from "next/router";
import styles from "../../styles/Schedule.module.scss";
import { BsCalendar4Week, BsListUl } from "react-icons/bs";
import ScheduleTable from "./ScheduleTable";
import {
  CMMSScheduleEvent,
  CMMSChangeOfPartsEvent,
  CMMSChangeOfParts,
  CMMSEvent,
} from "../../types/common/interfaces";
import EventColorLegend, { EventColours } from "./EventColorLegend";
import COPEventModal from "./COPEventModal";
import moment from "moment";

interface ScheduleTemplateInfo extends PropsWithChildren {
  title: string;
  header: string;
  schedules?: ScheduleInfo[];
  changeOfParts?: CMMSChangeOfParts[];
  timeline?: number;
  children?: ReactNode;
  contentHeader?: ReactNode;
}

export interface ScheduleInfo {
  assigned_fnames: string[];
  assigned_lnames: string[];
  assigned_roles: string[];
  assigned_emails: string[];
  assigned_usernames: string[];
  assigned_ids: number[];
  calendar_dates: string[];
  checklist_id: number;
  checklist_name: string;
  start_date: Date;
  end_date: Date;
  prev_start_date?: Date;
  prev_end_date?: Date;
  period: number;
  plant: string;
  plantId: number;
  remarks: string;
  schedule_id: number;
  timeline_id: number;
  exclusionList: number[];
  isSingle: boolean;
  index?: number;
  status?: number;
}

// Function to format Date to string
export function dateFormat(date: Date): string {
  return moment(date).format("MMMM Do YYYY, h:mm:ss a");
}

// Function to convert a recurring period to string format
export function toPeriodString(period: number): string {
  switch (period) {
    case 1:
      return "Daily";
    case 7:
      return "Weekly";
    case 14:
      return "Fortnightly";
    case 30:
      return "Monthly";
    case 90:
      return "Quarterly";
    case 180:
      return "Semi-Annually";
    case 365:
      return "Yearly";
    default:
      return "NA";
  }
}

export function toPeriodNum(period: string): number {
  switch (period) {
    case "Daily":
      return 1;
    case "Weekly":
      return 7;
    case "Fortnightly":
      return 14;
    case "Monthly":
      return 30;
    case "Quarterly":
      return 90;
    case "Semi-Annually":
      return 180;
    case "Yearly":
      return 365;
    default:
      return 0;
  }
}

/*
    ScheduleTemplate component is used across 
    pages with the FullCalendar conmponent.
    It takes in a list of schedules and render
    each date on individually on the calendar.
*/

export default function ScheduleTemplate(props: ScheduleTemplateInfo) {
  // Store the list of events in a state to be rendered on the calendar
  const [checklistEvents, setChecklistEvents] = useState<CMMSScheduleEvent[]>(
    []
  );
  const [COPEvents, setCOPEvents] = useState<CMMSChangeOfPartsEvent[]>([]);
  // Store the state of the view event modal
  const [isChecklistModalOpen, setIsChecklistModalOpen] =
    useState<boolean>(false);
  const [isCOPModalOpen, setIsCOPModalOpen] = useState<boolean>(false);
  // Store the current event which will pop up as a modal in a state
  const [currentEvent, setCurrentEvent] = useState<CMMSEvent>();
  // Store the state of the view full calendar. when set to true, view is full calendar, otherwise is list view.
  const [toggleCalendarOrListView, setToggleCalendarOrListView] =
    useState<boolean>(true);
  const [displayCOP, setDisplayCOP] = useState<boolean>(true);
  const [displayChecklist, setDisplayChecklist] = useState<boolean>(true);
  const router = useRouter();

  const toCMMSChangeOfPartsEvent = useCallback(
    (cop: CMMSChangeOfParts): CMMSChangeOfPartsEvent => {
      return {
        title: "Change of Parts for " + cop.asset,
        start: new Date(cop.changedDate ? cop.changedDate : cop.scheduledDate),
        extendedProps: {
          description: cop.description,
          assignedUserId: cop.assignedUserId,
          assignedUser: cop.assignedUser,
          psaId: cop.psaId,
          asset: cop.asset,
          copId: cop.copId,
          plant: cop.plant,
          plantId: cop.plantId,
          status: cop.changedDate ? "Completed" : "Scheduled",
        },
        color: cop.changedDate
          ? EventColours.completedCOP.color
          : EventColours.scheduledCOP.color,
        display: displayCOP ? "block" : "none",
      };
    },
    [displayCOP]
  );

  const updateCOPEvents = useCallback(
    (newCOPs: CMMSChangeOfParts[]) => {
      const newCOPEvents: CMMSChangeOfPartsEvent[] = newCOPs.map((cop) =>
        toCMMSChangeOfPartsEvent(cop)
      );
      console.log(newCOPEvents);
      setCOPEvents(newCOPEvents);
    },
    [toCMMSChangeOfPartsEvent]
  );

  const toCMMSScheduleEvents = useCallback(
    (schedule: ScheduleInfo, date: string, index: number) => {
      const event: CMMSScheduleEvent = {
        title: schedule.checklist_name,
        start: schedule.start_date ? new Date(date) : "",
        extendedProps: {
          plant: schedule.plant,
          plantId: schedule.plantId,
          scheduleId: schedule.schedule_id,
          checklistId: schedule.checklist_id,
          date: new Date(schedule.calendar_dates[index]),
          startDate: schedule.start_date
            ? new Date(schedule.start_date.toString().slice(0, 10))
            : "Rescheduled",
          endDate: schedule.end_date
            ? new Date(schedule.end_date.toString().slice(0, 10))
            : "Rescheduled",
          recurringPeriod: schedule.period,
          assignedIds: schedule.assigned_ids,
          assignedEmails: schedule.assigned_emails,
          assignedFnames: schedule.assigned_fnames,
          assignedLnames: schedule.assigned_lnames,
          assignedUsernames: schedule.assigned_usernames,
          assignedRoles: schedule.assigned_usernames,
          timelineId: schedule.timeline_id,
          remarks: schedule.remarks,
          index: index,
          isSingle: schedule.isSingle,
          exclusionList: schedule.exclusionList,
          status: schedule.status,
        },
        color:
          schedule.status === 5
            ? EventColours.completedTimeline.color
            : EventColours.approvedTimeline.color,
        display: displayChecklist ? "block" : "none",
      };

      return event;
    },
    [displayChecklist]
  );

  const updateChecklistEvents = useCallback(
    (newList: ScheduleInfo[]) => {
      let newEvents: CMMSScheduleEvent[] = [];
      newList.forEach((item) => {
        item.calendar_dates.forEach((date, index) => {
          const event = toCMMSScheduleEvents(item, date, index);

          if (!item.exclusionList || !item.exclusionList.includes(index)) {
            newEvents.push(event);
          }
        });
        setChecklistEvents(newEvents);
      });
    },
    [toCMMSScheduleEvents]
  );

  const handleEventClick = useCallback((info: EventClickArg) => {
    if (info.event._def.extendedProps.checklistId) {
      setCurrentEvent({
        title: info.event._def.title,
        start: info.event._instance?.range.start,
        extendedProps: {
          plant: info.event._def.extendedProps.plant,
          plantId: info.event._def.extendedProps.plantId,
          scheduleId: info.event._def.extendedProps.scheduleId,
          checklistId: info.event._def.extendedProps.checklistId,
          timelineId: info.event._def.extendedProps.timelineId,
          date: info.event._def.extendedProps.date,
          startDate: info.event._def.extendedProps.startDate,
          endDate: info.event._def.extendedProps.endDate,
          recurringPeriod: info.event._def.extendedProps.recurringPeriod,
          assignedIds: info.event._def.extendedProps.assignedIds,
          assignedEmails: info.event._def.extendedProps.assignedEmails,
          assignedFnames: info.event._def.extendedProps.assignedFnames,
          assignedLnames: info.event._def.extendedProps.assignedLnames,
          assignedUsernames: info.event._def.extendedProps.assignedUsernames,
          assignedRoles: info.event._def.extendedProps.assignedRoles,
          remarks: info.event._def.extendedProps.remarks,
          index: info.event._def.extendedProps.index,
          exclusionList: info.event._def.extendedProps.exclusionList,
          isSingle: info.event._def.extendedProps.isSingle,
          status: info.event._def.extendedProps.status,
        },
      });
      setIsChecklistModalOpen(true);
    } else {
      console.log("hello", info.event._instance?.range.start);
      setCurrentEvent({
        title: info.event._def.title,
        start: info.event._instance?.range.start,
        extendedProps: {
          copId: info.event._def.extendedProps.copId,
          plant: info.event._def.extendedProps.plant,
          plantId: info.event._def.extendedProps.plantId,
          asset: info.event._def.extendedProps.asset,
          psaId: info.event._def.extendedProps.psaId,
          assignedUser: info.event._def.extendedProps.assignedUser,
          assignedUserId: info.event._def.extendedProps.assignedUserId,
          description: info.event._def.extendedProps.description,
          status: info.event._def.extendedProps.status,
        },
      });
      setIsCOPModalOpen(true);
    }
  }, []);

  useEffect(() => {
    console.log(currentEvent);
    console.log(router.pathname);
  }, [currentEvent]);

  // Add events to be displayed on the calendar
  useEffect(() => {
    setChecklistEvents([]);
    if (props.schedules) updateChecklistEvents(props.schedules);

    if (props.changeOfParts) updateCOPEvents(props.changeOfParts);
  }, [
    props.schedules,
    props.changeOfParts,
    updateCOPEvents,
    updateChecklistEvents,
  ]);

  return (
    <>
      <ModuleMain>
        <ModuleHeader
          title={props.title}
          header={props.header}
          leftChildren={
            <div className={styles.eventModalHeader}>
              <label className={styles.toggle}>
                <input
                  type="checkbox"
                  onChange={() => setToggleCalendarOrListView((prev) => !prev)}
                />
                <span className={styles.slider}></span>
              </label>

              <div className="ms-3" id="top-toggle-img">
                {toggleCalendarOrListView ? (
                  <BsCalendar4Week size={20} />
                ) : (
                  <BsListUl size={20} />
                )}
              </div>
            </div>
          }
        >
          {props.children}
        </ModuleHeader>
        <ModuleContent>
          {props.contentHeader}
          {toggleCalendarOrListView ? (
            // Render Full calendar view
            <>
              <div className={styles.calendarDisplayCheckboxContainer}>
                <div className="form-check" style={{ marginRight: "1px" }}>
                  <input
                    className="form-check-input"
                    type="checkbox"
                    onChange={() => setDisplayCOP((prev) => !prev)}
                    checked={displayCOP}
                  />
                  <label className="form-check-label">Change of Parts</label>
                </div>
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    onChange={() => setDisplayChecklist((prev) => !prev)}
                    checked={displayChecklist}
                  />
                  <label className="form-check-label">Checklist</label>
                </div>
              </div>
           
              <FullCalendar
                plugins={[dayGridPlugin]}
                initialView="dayGridMonth"
                headerToolbar={{
                  left: "dayGridMonth dayGridWeek dayGridDay",
                  center: "title",
                  right: "prevYear,prev,next,nextYear",
                }}
                views={{
                  dayGridMonth: {
                    type: "dayGridMonth",
                    buttonText: "Month",
                  },
                  dayGridWeek: {
                    type: "dayGridWeek",
                    buttonText: "Week",
                  },
                  dayGridDay: {
                    type: "dayGridDay",
                    buttonText: "Day",
                  },
                }}
                aspectRatio={2}
                handleWindowResize={true}
                windowResizeDelay={1}
                stickyHeaderDates={true}
                selectable={true}
                unselectAuto={true}
                events={(checklistEvents as CMMSEvent[]).concat(COPEvents)}
                dayMaxEvents={2}
                eventDisplay="block"
                eventBackgroundColor="#FA9494"
                eventBorderColor="#FFFFFF"
                eventTextColor="#000000"
                displayEventTime={false}
                eventClick={handleEventClick}
                eventMouseEnter={(info) =>
                  (document.body.style.cursor = "pointer")
                }
                eventMouseLeave={() => (document.body.style.cursor = "default")}
              />
              <div
                className={styles.calendarDisplayCheckboxContainer}
                style={{
                  display: router.pathname === "/Schedule" ? "flex" : "none",
                }}
              >
                <div style={{ marginLeft: "auto" }}>
                  <EventColorLegend />
                </div>
              </div>
            </>
          ) : (
            // Render list view
            <ScheduleTable
              schedules={props.schedules}
              viewRescheduled={router.pathname === "/Schedule/Manage"}
            />
          )}
        </ModuleContent>
      </ModuleMain>
      <ChecklistEventModal
        isOpen={isChecklistModalOpen}
        closeModal={() => setIsChecklistModalOpen(false)}
        event={currentEvent as CMMSScheduleEvent}
        editSingle={router.pathname === `/Schedule`}
        deleteEditDraft={router.pathname === `/Schedule/Timeline/[id]`}
      />

      <COPEventModal
        isOpen={isCOPModalOpen}
        closeModal={() => setIsCOPModalOpen(false)}
        event={currentEvent as CMMSChangeOfPartsEvent}
      />
    </>
  );
}
