import React, { useState, useEffect } from "react";
import {
  ModuleContent,
  ModuleMain,
  ModuleHeader,
  ModuleFooter,
} from "../../../components";
import { ChecklistPageProps } from "../Form";
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
import RequiredIcon from "../../../components/RequiredIcon";
import AssignToSelect, { AssignedUserOption } from "../../../components/Schedule/AssignToSelect";
import formStyles from "../../../styles/formStyles.module.css";
import { SingleValue } from "react-select";
import { CMMSChecklist } from "../../../types/common/interfaces";

const rejectReassignChecklist = async (id: number, action: string, remarks: string) => {
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

const approveReassignChecklist = async (id: number, action: string, remarks: string, reassigned_user_id: number) => {
    try {
      await instance({
        url: `/api/checklist/${action}/${id}`,
        method: "patch",
        data: { remarks: remarks , assigned_user_id : reassigned_user_id},
      });
    } catch (err) {
      console.log(err);
    }
  };

const ManageReassignmentReqChecklistPage = (props: ChecklistPageProps) => {
  const [remarks, setRemarks] = useState<string>("");
  const [checklistData, setChecklistData] = useState<CMMSChecklist|null>(
    props.checklist
  );
  const [missingRemarksModal, setMissingRemarksModal] =
    useState<boolean>(false);
  const [missingReassignedModal, setMissingReassignedUserModal] =
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

    if (remarks.trim() === "") {
      setMissingRemarksModal(true);
      setDisableBtns(false);
      return;
    }

    if (action === Action.RejectReassign){
        rejectReassignChecklist(parseInt(router.query.id as string), action, remarks).then(
            (result) => {
                setSuccessModal(true);
                setTimeout(() => {
                router.push("/Checklist");
                }, 1000);
            }
            );
    }
    else if (action === Action.ApproveReassign){
        // Means never select new assignee for checklist:
        if (props.checklist?.assigned_user_id === checklistData?.assigned_user_id){
            setMissingReassignedUserModal(true);
            setDisableBtns(false);
            return;
        }
        else{
            approveReassignChecklist(parseInt(router.query.id as string), action, remarks, checklistData?.assigned_user_id!).then(
                (result) => {
                    setSuccessModal(true);
                    setTimeout(() => {
                    router.push("/Checklist");
                    }, 1000);
                }
                );
        }
    }

    
  };

  useEffect(() => {
    setLoading(true);
    setChecklistData(props.checklist);
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

  const updateChecklistField = (
    value: number | string | null,
    field: string
  ) => {
     console.log(checklistData);
        setChecklistData((prev: any) => {
        return {
            ...prev,
            [field]: value,
        };
    });  
    
  };

  return (
    <>
      <ModuleMain>
        <ModuleHeader header="Manage Checklist - Reassignment Request">
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
            <div className="row">
                <div className={`col-6 ${formStyles.halfContainer}`}>
                    <div className="form-group">
                        <label className="form-label">
                        <RequiredIcon /> Assigned To
                        </label>
                        <AssignToSelect
                        onChange={(option) => {
                            updateChecklistField(
                            (option as SingleValue<AssignedUserOption>)?.value as number,
                            "assigned_user_id"
                            );
                            updateChecklistField(
                            (option as SingleValue<AssignedUserOption>)?.label as string,
                            "assigneduser"
                            );
                        }}
                        plantId={props.checklist?.plant_id}
                        isSingle
                        defaultIds={
                            checklistData && checklistData.assigned_user_id
                            ? [checklistData.assigned_user_id as number]
                            : []
                        }
                        />
                        </div>
                    </div>
                </div>
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
                onClick={() => handleClick(Action.RejectReassign)}
                disabled={disableBtns}
              >
                Reject
              </TooltipBtn>
              <TooltipBtn
                toolTip={false}
                style={{ backgroundColor: "#91BD3A", borderColor: "#91BD3A" }}
                onClick={() => handleClick(Action.ApproveReassign)}
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
        setModalOpenState={setMissingReassignedUserModal}
        modalOpenState={missingReassignedModal}
        text="Please select new user to reassign checklist to before checklist approval"
        title="Missing reassigned user"
        icon={SimpleIcon.Exclaim}
        shouldCloseOnOverlayClick={true}
      />

      <ModuleSimplePopup
        setModalOpenState={setSuccessModal}
        modalOpenState={successModal}
        text={
          managerAction === Action.ApproveReassign
            ? "Checklist Reassignment Request has been approved."
            : "Checklist Reassignment Request has been rejected."
        }
        title="Success"
        icon={SimpleIcon.Check}
        shouldCloseOnOverlayClick={true}
      />
    </>
  );
};

export default ManageReassignmentReqChecklistPage;

