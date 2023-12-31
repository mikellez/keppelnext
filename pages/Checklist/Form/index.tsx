/*
  EXPLANATION OF CHECKLIST FORM PAGE

  This is the landing page for creating a new checklist or 
  for assigning / editing a pending checklist

  This page is made up of 2 major components:
  
  - ChecklistCreationForm is allows users to edit overall details 
    of the new/pending checklists. This can be found in 
    /components/Checklist/ChecklistCreationForm.tsx

  - ChecklistTemplateCreator is responsible for adding (when creating)
    and displaying of checks in checklists. There are multiple levels of
    nested components that is further described within ChecklistTemplateCreator.
    This can be found in /components/Checklist/ChecklistTemplateCreator.tsx
*/

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

interface ChecklistPageProps {
  checklist: CMMSChecklist | null;
}

const createChecklist = async (checklist: CMMSChecklist, type: string) => {
  // console.log(checklist);
  return await instance
    .post(`/api/checklist/${type}`, { checklist })
    .then((res) => {
      return res.data;
    })
    .catch((err) => console.log(err));
};

const editChecklistAPI = async (
  checklistData: CMMSChecklist,
  checklistId: number,
  assigned: boolean
) => {
  // console.log(checklistData);
  return await instance
    .patch(`/api/checklist/record/${checklistId}`, { checklistData, assigned })
    .then((res) => {
      // console.log("Test")
      return res.data;
    })
    .catch((err) => console.log(err));
};

export default function ChecklistNew(props: ChecklistPageProps) {
  const [checklistData, setChecklistData] = useState<CMMSChecklist>(
    {} as CMMSChecklist
  );
  const [isReady, setIsReady] = useState<boolean>(false);
  const [sections, setSections] = useState<CheckSection[]>([]);
  const [incompleteModal, setIncompleteModal] = useState<boolean>(false);
  const [universalModal, setUniversalModal] = useState<boolean>(false);
  const [successModal, setSuccessModal] = useState<boolean>(false);
  const [changeAssigned, setChangeAssigned] = useState<boolean>(false);

  const resetChecklist = () => {
    setSections([]);
  };

  const user = useCurrentUser();
  const router = useRouter();

  const submitChecklist = (checklistType: string) => {
    if (!checkInputFields()) {
      setIncompleteModal(true);
    } 
    else if (checklistType == "record" && checklistData.plant_id == 0) {
      setUniversalModal(true);
    }
    else {
      setSuccessModal(true);
      // console.log(checklistData)
      createChecklist(checklistData, checklistType);
      setTimeout(() => {
        router.push("/Checklist");
      }, 1000);
    }
  };

  const updateChecklist = async () => {
    if (!checkInputFields()) {
      setIncompleteModal(true);
    } else {
      setSuccessModal(true);
      await editChecklistAPI(checklistData, +router.query.id!, changeAssigned);
      setTimeout(() => {
        router.push("/Checklist");
      }, 1000);
    }
  };

  const checkInputFields = () => {
    // Mandatory fields are: Checklist name, description and plant_id
    const fieldCond = checklistData.plant_id != undefined && 
    (checklistData.chl_name && checklistData.chl_name!= "") && 
    (checklistData.description && checklistData.description != "")
    
    return fieldCond;
  };

  useEffect(() => {
    setChecklistData((prev) => {
      return {
        ...prev,
        createdbyuser: user.data?.name as string,
        plant_id: props.checklist?.plant_id == 0 ? props.checklist?.plant_id : user.data?.allocated_plants[0] as number,
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
        <ModuleHeader
          title="New Checklist"
          header={
            checklistData.status_id ? "Edit Checklist" : "Create New Checklist"
          }
        >
          <Link href="/Checklist/Templates" className="btn btn-primary">
            Templates
          </Link>
          <button
            className={"btn btn-secondary"}
            type="button"
            onClick={() => router.back()}
          >
            Back
          </button>
        </ModuleHeader>
        {isReady ? (
          <>
            <ChecklistCreationForm
              checklistData={checklistData}
              setChecklistData={setChecklistData}
              successModal={successModal}
              updateChecklist={updateChecklist}
              action={router.query.action as string}
              setChangeAssigned={setChangeAssigned}
            />

            <ModuleContent>
              <ModuleHeader header="Add Checklists" headerSize="1.5rem">
                <button className="btn btn-primary" onClick={resetChecklist}>
                  Reset
                </button>
              </ModuleHeader>

              <ChecklistTemplateCreator
                sections={sections}
                setSections={setSections}
              />
            </ModuleContent>

            <ModuleFooter>
              {router.query.action === "New" && (
                <>
                  <TooltipBtn
                    className="mb-1"
                    toolTip={false}
                    style={{
                      backgroundColor: "#F7C04A",
                      borderColor: "#F7C04A",
                    }}
                    onClick={() => submitChecklist("template")}
                    disabled={successModal}
                  >
                    Save Template
                  </TooltipBtn>

                  <TooltipBtn
                    toolTip={false}
                    onClick={() => submitChecklist("record")}
                    disabled={successModal}
                  >
                    Submit
                  </TooltipBtn>
                </>
              )}
              {/* : (
                <TooltipBtn
                  toolTip={false}
                  style={{ backgroundColor: "#F7C04A", borderColor: "#F7C04A" }}
                  onClick={updateChecklist}
                  disabled={successModal}
                >
                  Update
                </TooltipBtn>
              )} */}
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
        text="New checklist successfully created"
        icon={SimpleIcon.Check}
        shouldCloseOnOverlayClick={true}
      />

      <ModuleSimplePopup
        setModalOpenState={setIncompleteModal}
        modalOpenState={incompleteModal}
        title="Missing details"
        text="Please ensure that all input fields have been filled"
        icon={SimpleIcon.Exclaim}
        shouldCloseOnOverlayClick={true}
      />

      <ModuleSimplePopup
        setModalOpenState={setUniversalModal}
        modalOpenState={universalModal}
        title="Invalid Plant Selected"
        text="Only checklist templates can be universal and not tagged to a plant. Checklists created must be tagged to a specific plant"
        icon={SimpleIcon.Exclaim}
        shouldCloseOnOverlayClick={true}
      />
    </>
  );
}

const getServerSideProps = createChecklistGetServerSideProps([1, 2, 3]);

export { type ChecklistPageProps, getServerSideProps };
