import React, { useState, useEffect } from "react";
import { ModuleMain, ModuleHeader, ModuleContent } from "../../../components";
import { ChecklistPageProps } from "../Form";
import { createChecklistGetServerSideProps } from "../../../types/common/props";
import { GetServerSideProps } from "next";
import ChecklistPreview from "../../../components/Checklist/ChecklistPreview";
import TooltipBtn from "../../../components/TooltipBtn";
import { HiOutlineDownload, HiBan } from "react-icons/hi";
import instance from "../../../types/common/axios.config";

import { useRouter } from "next/router";
import styles from "../../../styles/Checklist.module.scss";

const downloadChecklistPDF = async (checklistId: number) => {
  try {
    const headers = {
      "X-Download-PDF": "true",
    };
    const response = await instance({
      url: "/api/checklist/pdf/" + checklistId,
      method: "get",
      responseType: "arraybuffer",
      headers: headers,
    });

    // console.log();

    const blob = new Blob([response.data]);
    // console.log(blob);
    const url = URL.createObjectURL(blob);
    const temp = document.createElement("a");
    temp.download = `checklist ${checklistId}.pdf`;
    temp.href = url;
    temp.click();
    temp.remove();
  } catch (err) {
    console.log(err);
  }
};

const sendCancelChecklist = async (id: number) => {
  const remarks = "";
  // console.log(id);
  return await instance({
    url: "/api/checklist/cancel/" + id,
    method: "patch",
    data: { remarks: remarks },
  })
    .then((res) => res.data)
    .catch(console.log);
};

const ManageChecklistPage = (props: ChecklistPageProps) => {
  const [remarks, setRemarks] = useState<string>("");
  const router = useRouter();

  useEffect(() => {
    if (props.checklist?.status_id == 5) {
      setRemarks(props.checklist?.activity_log.at(-1)!.remarks as string);
    }
  }, [props.checklist]);

  return (
    <ModuleMain>
      <ModuleHeader header="View Checklist">
        <TooltipBtn
          text="Download PDF"
          onClick={() =>
            downloadChecklistPDF(parseInt(router.query.id as string))
          }
        >
          <HiOutlineDownload size={24} />
        </TooltipBtn>
        <TooltipBtn
          text="Cancel"
          onClick={() => sendCancelChecklist(props.checklist!.checklist_id)}
        >
          <HiBan size={24} />
        </TooltipBtn>
        <button
          className={"btn btn-secondary"}
          type="button"
          onClick={() => router.back()}
        >
          Back
        </button>
      </ModuleHeader>
      <ChecklistPreview checklist={props.checklist} />
      <ModuleContent>
        {remarks && (
          <>
            <label className={styles.checklistDetailsHeading}>
              Approval Remarks
            </label>
            <p>{remarks}</p>
          </>
        )}
      </ModuleContent>
    </ModuleMain>
  );
};

export default ManageChecklistPage;
const getServerSideProps: GetServerSideProps =
  createChecklistGetServerSideProps();

export { getServerSideProps, downloadChecklistPDF };
