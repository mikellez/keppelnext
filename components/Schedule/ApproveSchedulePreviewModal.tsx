import React, { useEffect, useState } from "react";
import { ModuleModal } from "../ModuleLayout/ModuleModal";
import TooltipBtn from "../TooltipBtn";
import ScheduleTemplate, { ScheduleInfo } from "./ScheduleTemplate";
import ModuleSimplePopup, {
  SimpleIcon,
} from "../ModuleLayout/ModuleSimplePopup";
import { direction } from "html2canvas/dist/types/css/property-descriptors/direction";
import router from "next/router";
import {
  changeTimelineStatus,
  manageSingleEvent,
} from "../../pages/Schedule/Manage";

/**
 * Explanation for Approval Schedule Preview Modal
 *
 * This Module creates a preview of the schedule before either rejecting or approving it.
 *
 * This uses props from the parent class:
 *
 * - tabIndex : the Tab that is currently open, thus changing the beheviour of the modal
 * - modalOpenRef : the ref to open the modal
 * - setModalRef : the method to set open/close state of the modal
 * - title : title of the modal
 * - timelineID : The time line that is shown for preview
 * - scheduleInfo : the list of event in the timeline to display
 * - closeOnBlue : should the modal close on blur
 *
 *
 *
 */
interface ApproveSchedulePreviewModalProps {
  tabIndex: number;
  modalOpenRef: boolean;
  setModalRef: React.Dispatch<React.SetStateAction<boolean>>;
  title: string;
  timelineId: number;
  scheduleInfo: ScheduleInfo[];
  closeOnBlur?: boolean;
  remarks?: string;
}

const ContentHeader = (props: { tabIndex: number; setRemarks: (arg0: string) => void; scheduleInfo: { status: number; }[]; handleClick: (arg0: number) => void; remarks: string }) => {
  return (props.tabIndex == 1 || props.tabIndex == 2) ? (
    <div className="d-flex align-items-center justify-content-around py-3">
      <div style={{ flex: "4" }}>
        <label>
          <p>Remarks</p>
        </label>
        <textarea
          className="form-control"
          rows={5}
          maxLength={50}
          disabled={props.tabIndex === 2}
          style={{
            resize: "none",
            width: "80%",
          }}
          onChange={(e)=>props.setRemarks(e.target.value)}
          value={props.remarks}
        />
      </div>
      {props.tabIndex !== 2 && 
      <>
      <TooltipBtn
        toolTip={false}
        style={{ backgroundColor: "green", borderColor: "green" }}
        onClick={() => props.scheduleInfo[0].status === 6 ? props.handleClick(7) : props.handleClick(1)}
      >
        Approve
      </TooltipBtn>
      <TooltipBtn
        toolTip={false}
        onClick={() => props.scheduleInfo[0].status === 6 ? props.handleClick(8) : props.handleClick(3)}
        style={{ marginLeft: "10px" }}
      >
        {" "}
        Reject{" "}
      </TooltipBtn>{" "}
      </>
      }
    </div>
  ) : (
    <div></div>
  );
};

export default function ApproveSchedulePreviewModal(
  props: ApproveSchedulePreviewModalProps
) {
  const [isPopup, setIsPopup] = useState<boolean>(false);
  const [confirmModal, setConfirmModal] = useState<boolean>(false);
  // const [remarksModal, setRemarksModal] = useState<boolean>(false);
  const [outcomeModal, setOutcomeModal] = useState<boolean>(false);
  const [status, setStatus] = useState<number>(0);
  const [remarks, setRemarks] = useState<string>("");
  const [approveVisible, setApproveVisible] = useState<boolean>(
    props.tabIndex != 2
  );
  // const [isReady, setIsReady] = useState<boolean>(true);

  useEffect(() => {
    setApproveVisible(props.tabIndex != 2);
  }, [props.tabIndex]);

  function handleClick(newStatus: number) {
    if (remarks === "" && ![1, 7].includes(newStatus)) {
      //Prompt for remarks
      // setRemarksModal(true);
      setIsPopup(true);
    } else {
      // Prompt for confirm
      setConfirmModal(true);
      setStatus(newStatus);
    }
  }
  function handleManage(newStatus: number) {
    if (remarks === "" && ![1, 7].includes(newStatus)) {
      //Prompt for remarks
      // setRemarksModal(true);
      setIsPopup(true);
    } else {
      changeTimelineStatus(newStatus, props.timelineId as number, remarks)
        .then((result) => {
          // Close and clear modal fields
          setOutcomeModal(true);
          setConfirmModal(false);
          props.setModalRef(false);
          setTimeout(() => {
            // Re-direct to same page (Manage Schedule)
            router.reload();
          }, 1000);
        })
        .catch(console.log);
    }
  }
  console.log(props.scheduleInfo)

  return (
    <>
      <ModuleModal
        isOpen={props.modalOpenRef}
        closeModal={() => props.setModalRef(false)}
        title="approve"
        large
        hideHeader
        closeOnOverlayClick={props.closeOnBlur ? true : false}
      >
        <ScheduleTemplate
          title="Schedule Preview"
          header="Schedule Preview"
          schedules={props.scheduleInfo}
          contentHeader={<ContentHeader tabIndex={props.tabIndex} scheduleInfo={props.scheduleInfo} handleClick={handleClick} setRemarks={setRemarks} remarks={props.remarks}/>}
        />
      </ModuleModal>

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
        title={[1, 7].includes(status) ? "Approved" : [3, 8].includes(status) ? "Rejected" : ""}
        shouldCloseOnOverlayClick={true}
        text={
          [1, 7].includes(status)
            ? "Schedule has been successfully approved."
            : [3, 8].includes(status)
            ? "Schedule has been rejected."
            : ""
        }
        icon={SimpleIcon.Check}
      />
      <ModuleSimplePopup
        modalOpenState={isPopup}
        setModalOpenState={setIsPopup}
        title="Missing Remarks"
        text="Please write some remarks so that the engineers know why the schedule is rejected."
        icon={SimpleIcon.Exclaim}
        shouldCloseOnOverlayClick={true}
      />
    </>
  );
}
