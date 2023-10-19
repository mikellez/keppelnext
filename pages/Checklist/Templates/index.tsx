/*
  EXPLANATION OF CHECKLIST TEMPLATES PAGE

  This is the landing page for choosing a template to create
  a new checklist

  This page is made up of 2 major components:
  
  - checklistTemplateHTML which shows a list of all available templates
    Found within this page itself

  - ChecklistTemplatePlane is responsible for showing the preview of the 
    chosen checklist template
    This can be found in /components/Checklist/ChecklistTemplatePane.tsx
*/


import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import { RiDeleteBin6Line } from "react-icons/ri";
import {
  ModuleContent,
  ModuleFooter,
  ModuleHeader,
  ModuleMain
} from "../../../components";
import ChecklistTemplatePane from "../../../components/Checklist/ChecklistTemplatePane";
import ModuleSimplePopup, {
  SimpleIcon,
} from "../../../components/ModuleLayout/ModuleSimplePopup";
import { useCurrentUser } from "../../../components/SWR";
import SearchBar from "../../../components/SearchBar/SearchBar";
import TooltipBtn from "../../../components/TooltipBtn";
import styles from "../../../styles/Checklist.module.scss";
import instance from "../../../types/common/axios.config";
import { Role } from "../../../types/common/enums";
import { CMMSChecklist } from "../../../types/common/interfaces";

const deleteTemplate = async (checklistId: number) => {
  try {
    await instance.delete("/api/checklist/template/" + checklistId);
  } catch (err) {
    console.log(err);
  }
};

const Templates = () => {
  const user = useCurrentUser();

  const [checklistTemplates, setChecklistTemplates] = useState<CMMSChecklist[]>(
    []
  );
  const [selectedTemplate, setSelectedTemplate] = useState<CMMSChecklist>();
  const [confirmModal, setConfirmModal] = useState<boolean>(false);
  const [successModal, setSuccessModal] = useState<boolean>(false);
  const searchRef = useRef({ value: "" });
  const [isReady, setReady] = useState(false);

  const router = useRouter();

  async function getChecklistTemplates(plants: number[]) {
    return await instance({
      method: "get",
      url: `/api/checklist/templateNames?search=${searchRef.current.value}`,
    })
      .then((res) => {
        return res.data;
      })
      .catch((err) => {
        console.log(err);
      });
  }

  useEffect(() => {
    if (user.data) {
      getChecklistTemplates(user.data.allocated_plants)
        .then((result) => {
          setChecklistTemplates(result);
          setReady(true);
        })
        .catch((err) => console.log(err));
    }
  }, [user.data, isReady]);

  const checklistTemplateHTML = checklistTemplates?.map((checklist) => {
    return (
      <tr
        key={checklist.checklist_id}
        style={{
          backgroundColor:
            selectedTemplate?.checklist_id == checklist.checklist_id
              ? "#B2B2B2"
              : "transparent",
        }}
      >
        <th
          onClick={() => {
            setSelectedTemplate(checklist);
          }}
          style={{ cursor: "pointer" }}
        >
          {" "}
          {checklist.chl_name}
        </th>
      </tr>
    );
  });

  const handleConfirmDelete = async () => {
    setConfirmModal(false);
    await deleteTemplate(selectedTemplate?.checklist_id as number);
    setSuccessModal(true);
    setTimeout(() => {
      router.reload();
    }, 1000);
  };

  return (
    <>
      <ModuleMain>
        <ModuleHeader
          title="Checklist Templates"
          header="Create From Checklist Templates"
        >
        <SearchBar
          ref={searchRef}
          onSubmit={() => {
            setReady(false);
            setChecklistTemplates([]);
            setSelectedTemplate(undefined);
          }}
        />
          <Link href="/Checklist" className="btn btn-secondary">
            Back
          </Link>
        </ModuleHeader>

        <ModuleContent includeGreyContainer>
          <div className={styles.gridContainer}>
            <div style={{ maxHeight: "800px", overflow: "auto" }}>
              <table className="table" style={{backgroundColor: "grey"}}>
                <thead id="templates_list">{checklistTemplateHTML}</thead>
              </table>
            </div>
            <div>
              <ChecklistTemplatePane
                checklist={selectedTemplate as CMMSChecklist}
              />
            </div>
          </div>
        </ModuleContent>

        <ModuleFooter>
          {(user.data?.role_id === Role.Engineer ||
            user.data?.role_id === Role.Manager ||
            user.data?.role_id === Role.Admin) && (
            <TooltipBtn
              toolTip={false}
              disabled={!selectedTemplate}
              onClick={() => setConfirmModal(true)}
            >
              <RiDeleteBin6Line size={25} />
            </TooltipBtn>
          )}

          <TooltipBtn
            toolTip={false}
            disabled={!selectedTemplate}
            onClick={() => {
              router.push(
                `/Checklist/Form?action=New&id=${selectedTemplate?.checklist_id}`
              );
            }}
            style={{ backgroundColor: "#539165", borderColor: "#539165" }}
          >
            Use
          </TooltipBtn>
        </ModuleFooter>
      </ModuleMain>

      <ModuleSimplePopup
        modalOpenState={confirmModal}
        setModalOpenState={setConfirmModal}
        text="The following action will permanently delete the template and all related checklist & schedules"
        title="Confirm"
        icon={SimpleIcon.Exclaim}
        shouldCloseOnOverlayClick={true}
        buttons={
          <TooltipBtn toolTip={false} onClick={handleConfirmDelete}>
            Confirm
          </TooltipBtn>
        }
      />

      <ModuleSimplePopup
        modalOpenState={successModal}
        setModalOpenState={setSuccessModal}
        text="Template successfully deleted"
        title="Success"
        icon={SimpleIcon.Check}
        shouldCloseOnOverlayClick={true}
      />
    </>
  );
};

export default Templates;
