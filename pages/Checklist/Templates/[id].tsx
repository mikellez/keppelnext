import formStyles from "../../styles/formStyles.module.css";
import styles from "../../../styles/Checklist.module.scss";

import React, { useEffect, useState } from "react";
import Iframe from "react-iframe";

import Link from "next/link";
import { useRouter } from "next/router";

import {
    ModuleContent,
    ModuleDivider,
    ModuleHeader,
    ModuleMain,
    ModuleFooter,
} from "../../../components";
import ChecklistTemplateCreator from "../../../components/Checklist/ChecklistTemplateCreator";
import { GetServerSideProps, GetServerSidePropsContext } from "next";
import { CMMSPlant, CMMSChecklist } from "../../../types/common/interfaces";
import instance from '../../../types/common/axios.config';
import { useAsset, useCurrentUser } from "../../../components/SWR";

import PlantSelect from "../../../components/PlantSelect";
import AssignToSelect from "../../../components/Schedule/AssignToSelect";

import { CheckSection } from "../../../types/common/classes";
import LoadingIcon from "../../../components/LoadingIcon";
import LoadingHourglass from "../../../components/LoadingHourglass";
import TooltipBtn from "../../../components/TooltipBtn";


const ChecklistTemplate = () => {
    const router = useRouter();
    const { id } = router.query;
    const header = "Checklist Template " + id;

    return (
        <ModuleMain>
            <ModuleHeader title="Checklist Templates" header={header}>
                <Link href="/Checklist" className="btn btn-secondary">
                    Back
                </Link>
            </ModuleHeader>

            <ModuleContent includeGreyContainer>{id}</ModuleContent>

            <ModuleFooter></ModuleFooter>
        </ModuleMain>
    );
};

export default ChecklistTemplate;


