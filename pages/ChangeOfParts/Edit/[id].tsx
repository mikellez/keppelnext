import React, { useState, useEffect } from "react";
import { ModuleMain, ModuleContent, ModuleHeader, ModuleFooter } from "../../../components";
import TooltipBtn from "../../../components/TooltipBtn";
import Link from "next/link";
import { GetServerSideProps } from "next";
import { createChangeOfPartsServerSideProps } from "../../../types/common/props";
import { ChangeOfPartsPageProps } from "..";
import COPForm from "../../../components/ChangeOfParts/COPForm";
import { useRouter } from "next/router";
import { CMMSChangeOfParts } from "../../../types/common/interfaces";
import ModuleSimplePopup, { SimpleIcon } from "../../../components/ModuleLayout/ModuleSimplePopup";
import axios, { AxiosResponse } from "axios";
import instance from "../../../types/common/axios.config";

export const editChangeOfParts = async (formData: CMMSChangeOfParts) => {
    return await instance
        .patch(`/api/changeOfParts`, { formData })
        .then((res) => {
            return res.data;
        })
        .catch((err) => console.log(err));
};

const EditChangeOfPartsPage = (props: ChangeOfPartsPageProps) => {
    const [formData, setFormData] = useState<CMMSChangeOfParts>(props.changeOfParts[0]);
    const [isSubmitDisabled, setIsSubmitDisabled] = useState<boolean>(false);
    const [successModal, setSuccessModal] = useState<boolean>(false);
    const [failureModal, setFailureModal] = useState<boolean>(false);
    const router = useRouter();

    const handleSubmit = () => {
        setIsSubmitDisabled(true);

        if (!validateCOPFormData()) {
            setFailureModal(true);
            setIsSubmitDisabled(false);
            
        } else {
            editChangeOfParts(formData)
            .then(result => {
                setSuccessModal(true);
                setTimeout(() => [
                    router.push("/ChangeOfParts")
                ], 1000);
            });
        };  
    };

    const validateCOPFormData = () => {
        return (
            formData.psaId &&
            formData.description &&
            formData.description.trim() != "" &&
            formData.assignedUserId &&
            formData.scheduledDate
        );
    };
    
    return (
        <>
        <ModuleMain>
            <ModuleHeader header="Edit Change of Parts">
                <Link href="/ChangeOfParts" className="btn btn-secondary">
                    Back
                </Link>
            </ModuleHeader>
            <ModuleContent>
                <COPForm formData={formData} setFormData={setFormData} />
            </ModuleContent>
            <ModuleFooter>
                <TooltipBtn 
                    toolTip={false}
                    onClick={handleSubmit}
                    disabled={isSubmitDisabled}
                >
                    Submit
                </TooltipBtn>
            </ModuleFooter>
        </ModuleMain>

        <ModuleSimplePopup 
            modalOpenState={successModal}
            setModalOpenState={setSuccessModal}
            icon={SimpleIcon.Check}
            title="Success"
            text="Change of parts successfully updated"
            shouldCloseOnOverlayClick={true}
        />

        <ModuleSimplePopup 
            modalOpenState={failureModal}
            setModalOpenState={setFailureModal}
            icon={SimpleIcon.Exclaim}
            title="Incomplete Form"
            text="Please ensure that all fields have been filled"
            shouldCloseOnOverlayClick={true}
        />
        </>
    );
};

export default EditChangeOfPartsPage;
export const getServerSideProps: GetServerSideProps = createChangeOfPartsServerSideProps(true, 
    (response: AxiosResponse<CMMSChangeOfParts[]>) => {
        return (
            response.data &&
			response.data[0].changedDate
        );
    }
);