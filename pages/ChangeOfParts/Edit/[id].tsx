import React, { useState, useEffect } from "react";
import { ModuleMain, ModuleContent, ModuleHeader, ModuleFooter } from "../../../components";
import TooltipBtn from "../../../components/TooltipBtn";
import Link from "next/link";
import { GetServerSideProps } from "next";
import { createChangeOfPartsServerSideProps } from "../../../types/common/props";
import { ChangeOfPartsPageProps } from "..";
import COPForm, { ChangeOfPartsForm } from "../../../components/ChangeOfParts/COPForm";
import { useRouter } from "next/router";
import ModuleSimplePopup, { SimpleIcon } from "../../../components/ModuleLayout/ModuleSimplePopup";
import axios from "axios";

const editChangeOfParts = async (copId: number, formData: ChangeOfPartsForm) => {
    return await axios
        .patch(`/api/changeOfParts/${copId}`, { formData })
        .then((res) => {
            return res.data;
        })
        .catch((err) => console.log(err));
};

const EditChangeOfPartsPage = (props: ChangeOfPartsPageProps) => {
    const [formData, setFormData] = useState<ChangeOfPartsForm>({} as ChangeOfPartsForm);
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
            editChangeOfParts(+router.query.id!, formData)
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
            formData.linkedAsset &&
            formData.description &&
            formData.description.trim() != "" &&
            formData.assignedUser &&
            formData.scheduledDate
        );
    };
    
    useEffect(() => {
        if (props.changeOfParts[0]) {
            const cop = props.changeOfParts[0];
            const data = {
                linkedAsset: cop.psaId,
                description: cop.description,
                assignedUser: cop.assignedUserId,
                scheduledDate: new Date(cop.scheduledDate),
            }
            setFormData(data)
        }
    }, [props.changeOfParts]);

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
        />

        <ModuleSimplePopup 
            modalOpenState={failureModal}
            setModalOpenState={setFailureModal}
            icon={SimpleIcon.Exclaim}
            title="Incomplete Form"
            text="Please ensure that all fields have been filled"
        />
        </>
    );
};

export default EditChangeOfPartsPage;
export const getServerSideProps: GetServerSideProps = createChangeOfPartsServerSideProps("Edit")