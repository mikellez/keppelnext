import React from "react";
import { ModuleMain, ModuleContent, ModuleHeader, ModuleFooter } from "../../../components";
import TooltipBtn from "../../../components/TooltipBtn";
import Link from "next/link";
import { GetServerSideProps } from "next";
import { createChangeOfPartsServerSideProps } from "../../../types/common/props";
import { ChangeOfPartsPageProps } from "..";

const EditChangeOfPartsPage = (props: ChangeOfPartsPageProps) => {
    console.log(props)
    return (
        <ModuleMain>
            <ModuleHeader header="Edit Change of Parts">
                <Link href="/ChangeOfParts" className="btn btn-secondary">
                    Back
                </Link>
            </ModuleHeader>
            <ModuleContent>

            </ModuleContent>
            <ModuleFooter>
                <TooltipBtn toolTip={false}>
                    Submit
                </TooltipBtn>
            </ModuleFooter>
        </ModuleMain>
    );
};

export default EditChangeOfPartsPage;
export const getServerSideProps: GetServerSideProps = createChangeOfPartsServerSideProps("Edit")