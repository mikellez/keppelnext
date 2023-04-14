import React from "react";
import { ModuleMain, ModuleContent, ModuleHeader } from "../../../components";
import Link from "next/link";

const EditChangeOfPartsPage = () => {
    return (
        <ModuleMain>
            <ModuleHeader header="Edit Change of Parts">
                <Link href="/ChangeOfParts" className="btn btn-secondary">
                    Back
                </Link>
            </ModuleHeader>
            <ModuleContent>

            </ModuleContent>
        </ModuleMain>
    );
};

export default EditChangeOfPartsPage;