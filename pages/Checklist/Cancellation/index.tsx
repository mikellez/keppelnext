import formStyles from "../../../styles/formStyles.module.css";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  ModuleContent,
  ModuleDivider,
  ModuleHeader,
  ModuleMain,
  ModuleFooter,
} from "../../../components";
import ChecklistTemplateCreator from "../../../components/Checklist/ChecklistTemplateCreator";
import { CMMSPlant, CMMSChecklist } from "../../../types/common/interfaces";
import instance from "../../../types/common/axios.config";
import { useCurrentUser } from "../../../components/SWR";
import { CheckSection } from "../../../types/common/classes";
import LoadingHourglass from "../../../components/LoadingHourglass";
import TooltipBtn from "../../../components/TooltipBtn";
import ModuleSimplePopup, {
  SimpleIcon,
} from "../../../components/ModuleLayout/ModuleSimplePopup";
import { useRouter } from "next/router";
import { createChecklistGetServerSideProps } from "../../../types/common/props";
import ChecklistCreationForm from "../../../components/Checklist/ChecklistCreationForm";
import { ChecklistPageProps } from "../Form";
import { GetServerSideProps } from "next";
import ChecklistDetails from "../../../components/Checklist/ChecklistDetails";
import Input from "../../../components/Input";
import RequiredIcon from "../../../components/RequiredIcon";
import ChecklistPreview from "../../../components/Checklist/ChecklistPreview";

const handleCancelChecklist = async (
  type: string,
  remarks: string,
  id: number
) => {
  const url = `/api/checklist/${type}/${id}`;
  return await instance
    .patch(url, remarks)
    .then((res) => res.data)
    .catch(console.log);
};

export default function ChecklistCancel(props: ChecklistPageProps) {
  const [checklistData, setChecklistData] = useState<CMMSChecklist>(
    {} as CMMSChecklist
  );
  const [isReady, setIsReady] = useState<boolean>(false);
  const [sections, setSections] = useState<CheckSection[]>([]);
  const [successModal, setSuccessModal] = useState<boolean>(false);
  const [remarks, setRemarks] = useState<string>("");
  const user = useCurrentUser();
  const router = useRouter();

  const approveCancelChecklist = (remarks: string) => {
    setSuccessModal(true);
    // console.log(checklistData)
    handleCancelChecklist("approveCancel", remarks, checklistData.checklist_id);
    setTimeout(() => {
      router.push("/Checklist");
    }, 1000);
  };

  const rejectCancelChecklist = (remarks: string) => {
    setSuccessModal(true);
    // console.log(checklistData)
    handleCancelChecklist("rejectCancel", remarks, checklistData.checklist_id);
    setTimeout(() => {
      router.push("/Checklist");
    }, 1000);
  };
  useEffect(() => {
    setChecklistData((prev) => {
      return {
        ...prev,
        createdbyuser: user.data?.name as string,
        plant_id: user.data?.allocated_plants[0] as number,
      };
    });

    if (props.checklist) {
      setChecklistData((prev) => {
        return {
          ...prev,
          ...props.checklist,
        };
      });

      if (props.checklist.datajson.length > 0) {
        const sectionsFromJSON = props.checklist.datajson.map(
          (section: any) => {
            return CheckSection.fromJSON(JSON.stringify(section));
          }
        );
        setSections(sectionsFromJSON);
      }
    }

    setTimeout(() => {
      setIsReady(true);
    }, 1000);
  }, [user.data, props.checklist]);

  useEffect(() => {
    const json =
      sections.length > 0 ? sections.map((section) => section.toJSON()) : [];
    setChecklistData((prev) => {
      return {
        ...prev,
        datajson: json,
      };
    });
  }, [sections]);

  // useEffect(() => {
  //   console.log(checklistData.linkedassets, checklistData.linkedassetids);
  // }, [checklistData.linkedassetids]);

  return (
    <>
      <ModuleMain>
        <ModuleHeader title="Cancel Checklist" header={"Cancel Checklist"}>
          <button
            className={"btn btn-secondary"}
            type="button"
            onClick={() => router.back()}
          >
            Back
          </button>
        </ModuleHeader>
        {isReady && props.checklist ? (
          <>
            <ChecklistPreview checklist={props.checklist} />

            <ModuleContent>
              <ChecklistTemplateCreator
                sections={sections}
                setSections={setSections}
              />
              <label>Remarks</label>
              <textarea
                className="form-control"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                rows={2}
                maxLength={100}
                style={{ resize: "none" }}
              />
            </ModuleContent>

            <ModuleFooter>
              {
                <>
                  <TooltipBtn
                    className="mb-1"
                    toolTip={false}
                    style={{
                      backgroundColor: "#F7C04A",
                      borderColor: "#F7C04A",
                    }}
                    onClick={() => approveCancelChecklist(remarks)}
                    disabled={successModal}
                  >
                    Cancel
                  </TooltipBtn>

                  <TooltipBtn
                    toolTip={false}
                    onClick={() => rejectCancelChecklist(remarks)}
                    disabled={successModal}
                  >
                    Reject
                  </TooltipBtn>
                </>
              }
            </ModuleFooter>
          </>
        ) : (
          <div
            style={{
              position: "absolute",
              top: "calc((100% - 8rem) / 2)",
              left: "50%",
              transform: "translate(-50%,-50%)",
            }}
          >
            <LoadingHourglass />
          </div>
        )}
      </ModuleMain>

      <ModuleSimplePopup
        setModalOpenState={setSuccessModal}
        modalOpenState={successModal}
        title="Success"
        text={"Cancel Checklist Successfully Approve"}
        icon={SimpleIcon.Check}
        shouldCloseOnOverlayClick={true}
      />
    </>
  );
}

const getServerSideProps = createChecklistGetServerSideProps([9, 10, 11]);
export { getServerSideProps };
