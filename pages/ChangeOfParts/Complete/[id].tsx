import React from "react";
import { ModuleMain, ModuleContent, ModuleHeader, ModuleFooter } from "../../../components";
import { ChangeOfPartsPageProps } from "..";
import { createChangeOfPartsServerSideProps } from "../../../types/common/props";
import { GetServerSideProps } from "next";

const CompleteChangeOfPartsPage = (props: ChangeOfPartsPageProps) => {
    return (
        <ModuleMain>
            <ModuleHeader header="Complete Change of Parts"></ModuleHeader>
            <ModuleContent>

            </ModuleContent>
            <ModuleFooter>

            </ModuleFooter>
        </ModuleMain>
    );
};

export default CompleteChangeOfPartsPage;

export const getServerSideProps: GetServerSideProps = createChangeOfPartsServerSideProps(true);

