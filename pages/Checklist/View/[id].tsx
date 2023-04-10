import React from "react";
import { ModuleMain, ModuleHeader } from "../../../components";
import { ChecklistPageProps } from "../New";
import { createChecklistGetServerSideProps } from "../../../types/common/props";
import { GetServerSideProps } from "next";
import ChecklistPreview from "../../../components/Checklist/ChecklistPreview";

const ManageChecklistPage = (props: ChecklistPageProps) => {

    return (
        <ModuleMain>
            <ModuleHeader header="Mange Checklist">
            </ModuleHeader>
            <ChecklistPreview checklist={props.checklist} />
        </ModuleMain>
    );
};

export default ManageChecklistPage;
const getServerSideProps: GetServerSideProps = createChecklistGetServerSideProps("record");

export {
    getServerSideProps
}
