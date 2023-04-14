import React, { useEffect, useState } from "react";
import {
    ModuleContent,
    ModuleDivider,
    ModuleFooter,
    ModuleHeader,
    ModuleMain,
} from "../../../components";
import Link from "next/link";
import TooltipBtn from "../../../components/TooltipBtn";
import axios from "axios";
import { useRouter } from "next/router";
import COPForm, { ChangeOfPartsForm } from "../../../components/ChangeOfParts/COPForm";


const createChangeOfParts = async (formData: ChangeOfPartsForm) => {
    return await axios
        .post(`/api/changeOfParts/`, { formData })
        .then((res) => {
            return res.data;
        })
        .catch((err) => console.log(err));
};

const ChangeOfPartsNew = () => {
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [formData, setFormData] = useState<ChangeOfPartsForm>({} as ChangeOfPartsForm);
    const router = useRouter();

    return (
        <ModuleMain>
            <ModuleHeader title="New Change Of Parts" header="Create New Change Of Parts">
                <Link href="/ChangeOfParts" className="btn btn-secondary">
                    Back
                </Link>
            </ModuleHeader>
            <ModuleContent>
                <COPForm formData={formData} setFormData={setFormData} />
                <ModuleFooter>
                    {isSubmitting &&
                        !(
                            formData.linkedAsset &&
                            formData.description &&
                            formData.assignedUser &&
                            formData.scheduleDate
                        ) && (
                            <span style={{ color: "red" }}>Please fill in all required fields</span>
                        )}

                    <TooltipBtn
                        toolTip={false}
                        onClick={() => {
                            setIsSubmitting(true);
                            if (
                                formData.linkedAsset &&
                                formData.description &&
                                formData.assignedUser &&
                                formData.scheduleDate
                            ) {
                                createChangeOfParts(formData);
                                setTimeout(() => {
                                    router.push("/ChangeOfParts");
                                }, 1000);
                            }
                        }}
                        style={{ marginRight: "10px" }}
                    >
                        Submit
                    </TooltipBtn>
                </ModuleFooter>
            </ModuleContent>
        </ModuleMain>
    );
};

export default ChangeOfPartsNew;
