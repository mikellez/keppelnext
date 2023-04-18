import React, { useState } from "react";
import { ModuleMain, ModuleContent, ModuleHeader, ModuleFooter } from "../../../components";
import { ChangeOfPartsPageProps } from "..";
import { createChangeOfPartsServerSideProps } from "../../../types/common/props";
import { GetServerSideProps } from "next";
import COPForm from "../../../components/ChangeOfParts/COPForm";
import { CMMSChangeOfParts } from "../../../types/common/interfaces";
import TooltipBtn from "../../../components/TooltipBtn";
import { useRouter } from "next/router";
import ModuleSimplePopup, { SimpleIcon } from "../../../components/ModuleLayout/ModuleSimplePopup";
import { editChangeOfParts } from "../Edit/[id]";

const CompleteChangeOfPartsPage = (props: ChangeOfPartsPageProps) => {
    const [formData, setFormData] = useState<CMMSChangeOfParts>(props.changeOfParts[0]);
    const [successModal, setSuccessModal] = useState<boolean>(false);
    const [confirmModal, setConfirmModal] = useState<boolean>(false);
    const router = useRouter();

    const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => {
            return {
                ...prev,
                changedDate: new Date(e.target.value) 
            }
        });
    };

    const handleCompleteClick = () => {
        setConfirmModal(true);
    };

    const handleConfirmClick = () => {
        editChangeOfParts(formData).then(result => {
            setSuccessModal(true);
            setTimeout(() => {
                router.push("/ChangeOfParts")
            }, 1000);
        });
    };
    console.log(formData)
    return (
        <>
        <ModuleMain>
            <ModuleHeader header="Complete Change of Parts"></ModuleHeader>
            <ModuleContent>
                <COPForm formData={formData} setFormData={setFormData} disableForm />
            </ModuleContent>
            <ModuleContent>
                <div className="form-group" style={{width: "150px"}}>
                    <label className="form-label">
                        Date of Completion
                    </label>
                    <input 
                        type="date" 
                        className="form-control"
                        onChange={handleOnChange}
                    />
                </div>  
            </ModuleContent>
            <ModuleFooter>
                <TooltipBtn
                    toolTip={false}
                    disabled={!formData.changedDate}
                    onClick={handleCompleteClick}
                >Complete</TooltipBtn>
            </ModuleFooter>
        </ModuleMain>

            <ModuleSimplePopup
                modalOpenState={confirmModal}
                setModalOpenState={setConfirmModal}
                buttons={
                    <TooltipBtn toolTip={false} onClick={handleConfirmClick}>
                        Confirm
                    </TooltipBtn>
                }
                title="Confirm"
                text="Please confirm that you have completed the change of part"
                icon={SimpleIcon.Info}
            />

            <ModuleSimplePopup
                modalOpenState={successModal}
                setModalOpenState={setSuccessModal}
                title="Success"
                text="You have successfully completed change of part"
                icon={SimpleIcon.Check}
            />
        </>
    );
};

export default CompleteChangeOfPartsPage;

export const getServerSideProps: GetServerSideProps = createChangeOfPartsServerSideProps(true);

