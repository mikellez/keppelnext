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

interface ApproveSchedulePreviewModalProps {
  modalOpenRef: boolean;
  setModalRef: React.Dispatch<React.SetStateAction<boolean>>;
  title: string;
  timelineId: number;
  scheduleInfo: ScheduleInfo[];
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
      >
        <ScheduleTemplate
          title="Schedule Preview"
          header="Schedule Preview"
          schedules={props.scheduleInfo}
        />
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
        <div
          style={{
            display: "flex",
            flexDirection: "row",
          }}
        >
          <TooltipBtn toolTip={false} onClick={() => handleClick(1)}>
            {" "}
            Approve{" "}
          </TooltipBtn>
          <TooltipBtn toolTip={false} onClick={() => handleClick(3)}>
            {" "}
            Reject{" "}
          </TooltipBtn>{" "}
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
