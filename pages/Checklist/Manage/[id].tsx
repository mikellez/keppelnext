/*
  EXPLANATION OF CHECKLIST MANAGE FORM PAGE

  This is the landing page for managing a completed checklist

  This page is made up of one major component:
  
  - ChecklistPreview is made up of 2 major components, namely being
    ChecklistDetails and ChecklistViewForm

    - ChecklistDetails displays the overall details 
      of the checklist. This can be found in 
      /components/Checklist/ChecklistDetails.tsx

    - ChecklistViewForm is responsible for displaying the input checks in checklists.
      These checks are only shown as "view only" and cannot be edited 
      There are multiple levels of nested components that works similarly to ChecklistTemplateCreator.
      This can be found in /components/Checklist/ChecklistEditableForm.tsx
*/


import React, { useState, useEffect } from "react";
import {
  ModuleContent,
  ModuleMain,
  ModuleHeader,
  ModuleFooter,
} from "../../../components";
import { ChecklistPageProps } from "../Form";
import { createChecklistGetServerSideProps } from "../../../types/common/props";
import { GetServerSideProps } from "next";
import Link from "next/link";
import TooltipBtn from "../../../components/TooltipBtn";
import instance from "../../../axios.config.js";
import { useRouter } from "next/router";
import ModuleSimplePopup, {
  SimpleIcon,
} from "../../../components/ModuleLayout/ModuleSimplePopup";
import { HiOutlineDownload } from "react-icons/hi";
import ChecklistPreview from "../../../components/Checklist/ChecklistPreview";
import { downloadChecklistPDF } from "../View/[id]";
import { Action } from "../../../types/common/enums";
import { useCurrentUser } from "../../../components/SWR";
import LoadingHourglass from "../../../components/LoadingHourglass";
import { Role, Checklist_Status } from "../../../types/common/enums";

const manageChecklist = async (id: number, action: string, remarks: string) => {
  try {
    await instance({
      url: `/api/checklist/${action}/${id}`,
      method: "patch",
      data: { remarks: remarks },
    });
  } catch (err) {
    console.log(err);
  }
};

const ManageChecklistPage = (props: ChecklistPageProps) => {
  const [remarks, setRemarks] = useState<string>("");
  const [missingRemarksModal, setMissingRemarksModal] =
    useState<boolean>(false);
  const [successModal, setSuccessModal] = useState<boolean>(false);
  const [disableBtns, setDisableBtns] = useState<boolean>(false);
  const [managerAction, setManagerAction] = useState<Action>();
  const [isLoading, setLoading] = useState<boolean>(false);
  const router = useRouter();
  const user = useCurrentUser();

  const handleClick = (action: Action) => {
    setDisableBtns(true);
    setManagerAction(action);

    if (action === Action.Reject && remarks.trim() === "") {
      setMissingRemarksModal(true);
      setDisableBtns(false);
      return;
    }

    manageChecklist(parseInt(router.query.id as string), action, remarks).then(
      (result) => {
        setSuccessModal(true);
        setTimeout(() => {
          router.push("/Checklist");
        }, 1000);
      }
    );
  };

  useEffect(() => {
    setLoading(true);

    if (
      user.data &&
      props.checklist &&
      user.data?.id != props.checklist?.signoff_user_id &&
      user.data.role_id === Role.Specialist
    ) {
      router.push("/403");
    } else {
      setTimeout(() => {
        setLoading(false);
      }, 1000);
    }
  }, [props.checklist, user.data, router]);

  return (
    <>
      <ModuleMain>
        <ModuleHeader header="Manage Checklist">
          <TooltipBtn
            text="Download PDF"
            onClick={() => {
              // console.log("Download PDF");
              downloadChecklistPDF(parseInt(router.query.id as string));
            }}
          >
            <HiOutlineDownload size={24} />
          </TooltipBtn>
          <button
            className={"btn btn-secondary"}
            type="button"
            onClick={() => router.back()}
          >
            Back
          </button>
        </ModuleHeader>
        {isLoading ? (
          <LoadingHourglass />
        ) : (
          <>
            <ChecklistPreview checklist={props.checklist} />
            <ModuleContent>
              <label>Remarks</label>
              <textarea
                className="form-control"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                rows={2}
                maxLength={100}
                style={{ resize: "none" }}
              ></textarea>
            </ModuleContent>
            <ModuleFooter>
              <TooltipBtn
                toolTip={false}
                onClick={() => handleClick(Action.Reject)}
                disabled={disableBtns}
              >
                Reject
              </TooltipBtn>
              <TooltipBtn
                toolTip={false}
                style={{ backgroundColor: "#91BD3A", borderColor: "#91BD3A" }}
                onClick={() => handleClick(Action.Approve)}
                disabled={disableBtns}
              >
                Approve
              </TooltipBtn>
            </ModuleFooter>
          </>
        )}
      </ModuleMain>

      <ModuleSimplePopup
        setModalOpenState={setMissingRemarksModal}
        modalOpenState={missingRemarksModal}
        text="Please fill in the remarks"
        title="Missing remarks"
        icon={SimpleIcon.Exclaim}
        shouldCloseOnOverlayClick={true}
      />

      <ModuleSimplePopup
        setModalOpenState={setSuccessModal}
        modalOpenState={successModal}
        text={
          managerAction === Action.Approve
            ? "Checklist has been approved."
            : "Checklist has been rejected."
        }
        title="Success"
        icon={SimpleIcon.Check}
        shouldCloseOnOverlayClick={true}
      />
    </>
  );
};

export default ManageChecklistPage;
// Essentially the allowed statuses that can access the Manage Checklist Page
const getServerSideProps: GetServerSideProps =
  createChecklistGetServerSideProps([Checklist_Status.Work_Done,Checklist_Status.Reassignment_Request]);

export { getServerSideProps };
