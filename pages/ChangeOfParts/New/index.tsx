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
import COPForm from "../../../components/ChangeOfParts/COPForm";
import { CMMSChangeOfParts } from "../../../types/common/interfaces";
import ModuleSimplePopup, { SimpleIcon } from "../../../components/ModuleLayout/ModuleSimplePopup";


const createChangeOfParts = async (formData: CMMSChangeOfParts) => {
    return await axios
        .post(`/api/changeOfParts/`, { formData })
        .then((res) => {
            return res.data;
        })
        .catch((err) => console.log(err));
};

const ChangeOfPartsNew = () => {
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [formData, setFormData] = useState<CMMSChangeOfParts>({scheduledDate: new Date()} as CMMSChangeOfParts);
    const [successModal, setSuccessModal] = useState<boolean>(false);
    const [displayErrorMsg, setDisplayErrorMsg] = useState<boolean>(false);
    const router = useRouter();


    const handleSubmit = () => {
        setIsSubmitting(true);
        if (validateCOPFormData()) {
            createChangeOfParts(formData);
            setSuccessModal(true);
            setTimeout(() => {
                router.push("/ChangeOfParts");
            }, 1000);
        } else {
            setDisplayErrorMsg(true);
            setTimeout(() => {
                setIsSubmitting(false)
            })
        }
    };

    const validateCOPFormData = () => {
        return (
            formData.psaId &&
            formData.description &&
            formData.assignedUserId &&
            formData.scheduledDate
        );
    };

    return (
        <>
        <ModuleMain>
            <ModuleHeader title="New Change Of Parts" header="Create New Change Of Parts">
                <Link href="/ChangeOfParts" className="btn btn-secondary">
                    Back
                </Link>
            </ModuleHeader>
            <ModuleContent>
                <COPForm formData={formData} setFormData={setFormData} />
                <ModuleFooter>
               
                    {displayErrorMsg && <span style={{ color: "red" }}>Please fill in all required fields</span>}
                    
                    <TooltipBtn
                        toolTip={false}
                        onClick={handleSubmit}
                        style={{ marginRight: "10px" }}
                        disabled={isSubmitting}
                    >
                        Submit
                    </TooltipBtn>
                </ModuleFooter>
            </ModuleContent>
        </ModuleMain>

        <ModuleSimplePopup 
            modalOpenState={successModal}
            setModalOpenState={setSuccessModal}
            icon={SimpleIcon.Check}
            title="Success"
            text="Change of parts successfully updated"
        />
        </>
    );
};

export default ChangeOfPartsNew;
