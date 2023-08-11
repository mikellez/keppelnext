import React, { useState } from "react";
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
 * - modalOpenRef : the ref to open the modal
 * - setModalRef : the method to set open/close state of the modal
 * - title : title of the modal
 * - timelineID : The time line that is shown for preview
 * - scheduleInfo : the list of event in the timeline to display
 *
 *
 *
 */
interface ApproveSchedulePreviewModalProps {
  modalOpenRef: boolean;
  setModalRef: React.Dispatch<React.SetStateAction<boolean>>;
  title: string;
  timelineId: number;
  scheduleInfo: ScheduleInfo[];
  closeOnBlur?: boolean;
}

export default function ApproveSchedulePreviewModal(
  props: ApproveSchedulePreviewModalProps
) {
  const [confirmModal, setConfirmModal] = useState<boolean>(false);
  const [remarksModal, setRemarksModal] = useState<boolean>(false);
  const [outcomeModal, setOutcomeModal] = useState<boolean>(false);
  const [status, setStatus] = useState<number>(0);
  const [remarks, setRemarks] = useState<string>("");

  function handleClick(newStatus: number) {
    if (remarks === "" && newStatus != 1) {
      //Prompt for remarks
      setRemarksModal(true);
    } else {
      // Prompt for confirm
      setConfirmModal(true);
      setStatus(newStatus);
    }
  }
  function handleManage(newStatus: number) {
    if (remarks === "" && newStatus != 1) {
      //Prompt for remarks
      setRemarksModal(true);
    } else {
      changeTimelineStatus(newStatus, props.timelineId as number)
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
        >

        </ScheduleTemplate>
        <div className="d-flex align-items-center justify-content-around px-3">
          <div style={{flex: "4"}}>
            <label>
              <p>Remarks</p>
            </label>
              <textarea
                className="form-control"
                rows={5}
                maxLength={50}
                style={{ resize: "none", width: "80%", boxShadow: "0px 0px 50px 0px rgba(0, 0, 0, 0.1)"}}
                onChange={(e) => setRemarks(e.target.value)}
              ></textarea>
          </div>
          <div style={{
              display: "flex",
              flex: "1"
            }}>
            <TooltipBtn 
              toolTip={false} 
              style={{backgroundColor: "green", borderColor: "green"}}
              onClick={() => handleClick(1)}>
              Approve
            </TooltipBtn>
            <TooltipBtn
              toolTip={false}
              onClick={() => handleClick(3)}
              style={{ marginLeft: "10px" }}
            >
              {" "}
              Reject{" "}
            </TooltipBtn>{" "}
          </div>
        </div>
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
