import React, { useState, useEffect } from "react";
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
import Link from "next/link";
import { useCurrentUser } from "../../../components/SWR";
import LoadingHourglass from "../../../components/LoadingHourglass";
import { AxiosResponse } from "axios";

const CompleteChangeOfPartsPage = (props: ChangeOfPartsPageProps) => {
    const [formData, setFormData] = useState<CMMSChangeOfParts>(props.changeOfParts[0]);
    const [successModal, setSuccessModal] = useState<boolean>(false);
    const [confirmModal, setConfirmModal] = useState<boolean>(false);
    const [isReady, setIsReady] = useState<boolean>(false);
    const router = useRouter();
    const user = useCurrentUser();

    const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData((prev) => {
            return {
                ...prev,
                changedDate: new Date(e.target.value),
            };
        });
    };

    const handleCompleteClick = () => {
        setConfirmModal(true);
    };

    const handleConfirmClick = () => {
        editChangeOfParts(formData).then((result) => {
            setSuccessModal(true);
        });
    };

    useEffect(() => {
        setIsReady(false);
        if (user.data?.id != formData.assignedUserId) {
            router.push("/403");
            return;
        } else {
            setTimeout(() => {
                setIsReady(true);
            }, 1500);
        }
    }, [user.data]);

    return (
        <>
            {isReady ? (
                <ModuleMain>
                    <ModuleHeader header="Complete Change of Parts">
                        <Link href="/ChangeOfParts" className="btn btn-secondary">
                            Back
                        </Link>
                    </ModuleHeader>
                    <ModuleContent>
                        <COPForm formData={formData} setFormData={setFormData} disableForm />
                    </ModuleContent>
                    <ModuleContent>
                        <div className="form-group" style={{ width: "150px" }}>
                            <label className="form-label">Date of Completion</label>
                            <input
                                type="date"
                                className="form-control"
                                onChange={handleOnChange}
                                max={new Date().toISOString().slice(0, 10)}
                                onKeyDown={(e) => e.preventDefault()}
                            />
                        </div>
                    </ModuleContent>
                    <ModuleFooter>
                        <TooltipBtn
                            toolTip={false}
                            disabled={!formData.changedDate}
                            onClick={handleCompleteClick}
                        >
                            Complete
                        </TooltipBtn>
                    </ModuleFooter>
                </ModuleMain>
            ) : (
                <LoadingHourglass />
            )}

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
                text="You have successfully completed change of part. Do you want to create another one?"
                buttons={[
                    <TooltipBtn
                        key={1}
                        toolTip={false}
                        onClick={() => router.push("/ChangeOfParts")}
                    >
                        No
                    </TooltipBtn>,
                    <TooltipBtn
                        key={2}
                        toolTip={false}
                        onClick={() => router.push("/ChangeOfParts/New?copId=" + formData.copId)}
                        style={{ backgroundColor: "#367E18", borderColor: "#367E18" }}
                    >
                        Yes
                    </TooltipBtn>,
                ]}
                icon={SimpleIcon.Check}
            />
        </>
    );
};

export default CompleteChangeOfPartsPage;

export const getServerSideProps: GetServerSideProps = createChangeOfPartsServerSideProps(
    true,
    (response: AxiosResponse<CMMSChangeOfParts[]>) => {
        return response.data && response.data[0].changedDate;
    }
);
