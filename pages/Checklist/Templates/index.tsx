import styles from "../../../styles/Checklist.module.scss";
import React, { useEffect, useState } from "react";
import Iframe from "react-iframe";
import Link from "next/link";
import {
  ModuleContent,
  ModuleDivider,
  ModuleHeader,
  ModuleMain,
  ModuleFooter,
} from "../../../components";
import ModuleSimplePopup, {
  SimpleIcon,
} from "../../../components/ModuleLayout/ModuleSimplePopup";
import { CMMSChecklist } from "../../../types/common/interfaces";
import instance from "../../../types/common/axios.config";
import { useCurrentUser } from "../../../components/SWR";
import TooltipBtn from "../../../components/TooltipBtn";
import { useRouter } from "next/router";
import { Role } from "../../../types/common/enums";
import { RiDeleteBin6Line } from "react-icons/ri";
import ChecklistTemplatePane from "../../../components/Checklist/ChecklistTemplatePane";

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

  const router = useRouter();

  async function getChecklistTemplates(plants: number[]) {
    return await instance({
      method: "get",
      url: `/api/checklist/templateNames`,
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
        })
        .catch((err) => console.log(err));
    }
  }, [user.data]);

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
          <Link href="/Checklist" className="btn btn-secondary">
            Back
          </Link>
        </ModuleHeader>

        <ModuleContent includeGreyContainer>
          <div className={styles.gridContainer}>
            <div style={{ maxHeight: "800px", overflow: "auto" }}>
              <table className="table">
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
