import React from "react";
import { ModuleContent, ModuleMain, ModuleHeader } from "../../../components";
import { GetServerSideProps, GetServerSidePropsContext } from "next";
import ChecklistDetails from "../../../components/Checklist/ChecklistDetails";
import { ChecklistPageProps } from "../New";
import { createChecklistGetServerSideProps } from "../../../types/common/props";



const CompleteChecklistPage = (props: ChecklistPageProps) => {
    return (
        <ModuleMain>
            <ModuleHeader header="Complete Checklist">
            </ModuleHeader>
            <ModuleContent>
                <ChecklistDetails checklist={props.checklist} />
            </ModuleContent>
        </ModuleMain>
    );
};

export default CompleteChecklistPage;
const getServerSideProps: GetServerSideProps = createChecklistGetServerSideProps("record");

export {
    getServerSideProps
}

