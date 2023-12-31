/*
  EXPLANATION OF CHECKLIST COMPLETE FORM PAGE

  This is the landing page for completing an assigned checklist

  This page is made up of 2 major components:
  
  - ChecklistDetails displays the overall details 
    of the checklist. This can be found in 
    /components/Checklist/ChecklistDetails.tsx

  - ChecklistEditableForm is responsible for displaying the input checks in checklists. 
    There are multiple levels of nested components that works similarly to ChecklistTemplateCreator.
    This can be found in /components/Checklist/ChecklistEditableForm.tsx


*/

import React, { useState, useEffect, createContext } from "react";
import {
  ModuleContent,
  ModuleMain,
  ModuleHeader,
  ModuleFooter,
  ModuleDivider,
} from "../../../components";
import { GetServerSideProps, GetServerSidePropsContext } from "next";
import ChecklistDetails from "../../../components/Checklist/ChecklistDetails";
import TooltipBtn from "../../../components/TooltipBtn";
import { ChecklistPageProps } from "../Form";
import { createChecklistGetServerSideProps } from "../../../types/common/props";
import { CheckSection } from "../../../types/common/classes";
import ChecklistEditableForm from "../../../components/Checklist/ChecklistEditableForm";
import ModuleSimplePopup, {
  SimpleIcon,
} from "../../../components/ModuleLayout/ModuleSimplePopup";
import { HiOutlineDownload } from "react-icons/hi";
import { useRouter } from "next/router";
import instance from "../../../types/common/axios.config";
import Link from "next/link";
import { downloadChecklistPDF } from "../View/[id]";
// import ChecklistEditableReassignedForm from "../../../components/Checklist/ChecklistEditableReassignedForm";

export const SectionsContext = createContext({
  sections: [] as CheckSection[],
  setSections: (() => {}) as React.Dispatch<
    React.SetStateAction<CheckSection[]>
  >,
});
const submitCompletedChecklist = async (data: CheckSection[], id: number) => {
  return await instance({
    url: "/api/checklist/complete/" + id,
    method: "patch",
    data: {
      datajson: data.map((section) => section.toJSON()),
    },
  })
    .then((res) => res.data)
    .catch((err) => console.log(err));
};

const saveChecklist = async (data: CheckSection[], id: number) => {
  return await instance({
    url: "/api/checklist/draft/" + id,
    method: "patch",
    data: {
      datajson: data.map((section) => section.toJSON()),
    },
  })
    .then((res) => res.data)
    .catch((err) => console.log(err));
};

const CompleteChecklistPage = (props: ChecklistPageProps) => {
  const [sections, setSections] = useState<CheckSection[]>([]);
  const [disableSubmit, setDisableSubmit] = useState<boolean>(false);
  const [disableSave, setDisableSave] = useState<boolean>(false);
  const [successCompleteModal, setSuccessCompleteModal] = useState<boolean>(false);
  const [successSaveModal, setSuccessSaveModal] = useState<boolean>(false);
  const [incompleteModal, setIncompleteModal] = useState<boolean>(false);

  const router = useRouter();
  useEffect(() => {
    if (props.checklist && props.checklist.datajson.length > 0) {
      const sectionsFromJSON = props.checklist.datajson.map((section: any) => {
        return CheckSection.fromJSON(JSON.stringify(section));
      });
      setSections(sectionsFromJSON);
    }
  }, [props.checklist]);

  const handleSubmit = () => {
    setDisableSubmit(false);

    if (!isCompleteChecklist()) {
      setIncompleteModal(true);
      setDisableSubmit(false);
      return;
    }

    submitCompletedChecklist(
      sections,
      parseInt(router.query.id as string)
    ).then((result) => {
      setSuccessCompleteModal(true);
      setTimeout(() => {
        router.push("/Checklist");
      }, 1000);
    });
  };

  const handleSave = () => {
    setDisableSave(false);

    saveChecklist(
      sections,
      parseInt(router.query.id as string)
    ).then((result) => {
      setSuccessSaveModal(true);
      setTimeout(() => {
        router.push("/Checklist");
      }, 1000);
    });
  };

  const isCompleteChecklist = () => {
    return sections.every((section) => section.isComplete());
  };

  return (
    <>
      <ModuleMain>
        <ModuleHeader header="Complete Checklist">
          <TooltipBtn
            text="Download PDF"
            onClick={() =>
              downloadChecklistPDF(parseInt(router.query.id as string))
            }
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
        <ModuleContent>
          <ChecklistDetails checklist={props.checklist} />
        </ModuleContent>
        <ModuleDivider />
        <ModuleContent>
          <SectionsContext.Provider value={{ sections, setSections }}>
            <ChecklistEditableForm />
            {/* {props.checklist.status_id !== 3 && <ChecklistEditableForm />}
                        {props.checklist.status_id === 3 && <ChecklistEditableReassignedForm sections={sections}/>} */}
          </SectionsContext.Provider>
        </ModuleContent>
        <ModuleFooter>
        ``<TooltipBtn
            toolTip={false}
            onClick={handleSave}
            disabled={disableSave}
          >
            Save
          </TooltipBtn>
          <TooltipBtn
            toolTip={false}
            onClick={handleSubmit}
            disabled={disableSubmit}
          >
            Submit
          </TooltipBtn>
        </ModuleFooter>
      </ModuleMain>

      <ModuleSimplePopup
        modalOpenState={successCompleteModal}
        setModalOpenState={setSuccessCompleteModal}
        icon={SimpleIcon.Check}
        title="Completed"
        text="Checklist is successfully completed"
        shouldCloseOnOverlayClick={true}
      />

      <ModuleSimplePopup
        modalOpenState={successSaveModal}
        setModalOpenState={setSuccessSaveModal}
        icon={SimpleIcon.Check}
        title="Saved"
        text="Checklist is successfully saved as Draft"
        shouldCloseOnOverlayClick={true}
      />

      <ModuleSimplePopup
        modalOpenState={incompleteModal}
        setModalOpenState={setIncompleteModal}
        icon={SimpleIcon.Exclaim}
        title="Incomplete checklist"
        text="Please ensure that all fields have been filled"
        shouldCloseOnOverlayClick={true}
      />
    </>
  );
};

export default CompleteChecklistPage;
const getServerSideProps: GetServerSideProps =
  createChecklistGetServerSideProps([2, 3, 6]);
export { getServerSideProps };
