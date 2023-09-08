/*
  EXPLANATION OF CHECKLIST MANAGE FORM PAGE

  This is the landing page for managing a checklist

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


import React, { useEffect, useState } from "react";
import { ChecklistPageProps } from "../Form";
import { createChecklistGetServerSideProps } from "../../../types/common/props";
import { GetServerSideProps } from "next";
import { Checklist_Status } from "../../../types/common/enums";
import Completed from "./Completed";
import Reassign from "./Reassign";
import { CMMSChecklist } from "../../../types/common/interfaces";

const ManageChecklistPage = (props: ChecklistPageProps) => {
  const statusId = props.checklist?.status_id;

  return (
    <>
      {/*Route to the different management page based on status of the checklist*/}
      {statusId === Checklist_Status.Work_Done && <Completed checklist={props.checklist} />}
      {statusId === Checklist_Status.Reassignment_Request && <Reassign checklist={props.checklist}/>}
    </>
  );
};

export default ManageChecklistPage;

// Essentially the allowed statuses that can access the Manage Checklist Page
const getServerSideProps: GetServerSideProps =
  createChecklistGetServerSideProps([Checklist_Status.Work_Done,Checklist_Status.Reassignment_Request]);

export { getServerSideProps };
