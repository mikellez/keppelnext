import React from "react";
import { ModuleMain, ModuleHeader, ModuleContent } from "../../../components";
import { ChecklistPageProps } from "../Form";
import { createChecklistGetServerSideProps } from "../../../types/common/props";
import { GetServerSideProps } from "next";
import ChecklistPreview from "../../../components/Checklist/ChecklistPreview";
import Link from "next/link";
import TooltipBtn from "../../../components/TooltipBtn";
import { HiOutlineDownload } from "react-icons/hi";
import instance from '../../axios.config.js';
import { useRouter } from "next/router";
import styles from "../../../styles/Checklist.module.scss";

const downloadChecklistPDF = async (checklistId: number) => {
    try {
        const response = await instance({
            url: "/api/checklist/pdf/" + checklistId,
            method: "get",
            responseType: "arraybuffer",
        });

        const blob = new Blob([response.data]);
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

const ManageChecklistPage = (props: ChecklistPageProps) => {
    const router = useRouter();

    return (
        <ModuleMain>
            <ModuleHeader header="Mange Checklist">
                <TooltipBtn
                    text="Download PDF"
                    onClick={() => downloadChecklistPDF(parseInt(router.query.id as string))}
                >
                    <HiOutlineDownload size={24} />
                </TooltipBtn>
                <Link href="/Checklist" className="btn btn-secondary">
                    Back
                </Link>
            </ModuleHeader>
            <ChecklistPreview checklist={props.checklist} />
            <ModuleContent>
                {props.checklist?.status_id == 6 && (
                    <>
                        <label className={styles.checklistDetailsHeading}>Remarks</label>
                        <p className={styles.checklistDetailsContent}>
                            {
                                props.checklist?.history
                                    .split(",")
                                    .slice(-1)[0]
                                    .split("_")
                                    .slice(-1)[0]
                            }
                        </p>
                    </>
                )}
            </ModuleContent>
        </ModuleMain>
    );
};

export default ManageChecklistPage;
const getServerSideProps: GetServerSideProps = createChecklistGetServerSideProps();

export { getServerSideProps, downloadChecklistPDF };
