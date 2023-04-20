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
import axios, { AxiosResponse } from "axios";
import { useRouter } from "next/router";
import COPForm from "../../../components/ChangeOfParts/COPForm";
import { CMMSAssetDetails, CMMSChangeOfParts } from "../../../types/common/interfaces";
import ModuleSimplePopup, { SimpleIcon } from "../../../components/ModuleLayout/ModuleSimplePopup";
import { createChangeOfPartsServerSideProps } from "../../../types/common/props";
import { GetServerSideProps } from "next";
import { ChangeOfPartsPageProps } from "..";
import LoadingHourglass from "../../../components/LoadingHourglass";
import { useCurrentUser } from "../../../components/SWR";

const createChangeOfParts = async (formData: CMMSChangeOfParts) => {
    return await axios
        .post(`/api/changeOfParts/`, { formData })
        .then((res) => {
            return res.data;
        })
        .catch((err) => console.log(err));
};

const ChangeOfPartsNew = (props: ChangeOfPartsPageProps) => {
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [formData, setFormData] = useState<CMMSChangeOfParts>({
        scheduledDate: new Date(),
    } as CMMSChangeOfParts);
    const [successModal, setSuccessModal] = useState<boolean>(false);
    const [displayErrorMsg, setDisplayErrorMsg] = useState<boolean>(false);
    const [isReady, setIsReady] = useState<boolean>(false);
    const router = useRouter();
    const user = useCurrentUser();

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
                setIsSubmitting(false);
            });
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

    useEffect(() => {
        setIsReady(false);
        // url query for copId
        if (props.changeOfParts[0] && router.query.copId) {
            const defaultCOP = props.changeOfParts[0];
            console.log(defaultCOP);

            setFormData((prev) => {
                return {
                    ...prev,
                    plantId: defaultCOP.plantId,
                    description: defaultCOP.description,
                    psaId: defaultCOP.psaId,
                    assignedUserId: defaultCOP.assignedUserId,
                };
            });

            setTimeout(() => {
                setIsReady(true);
            }, 1500);
        }
        // url query for assetId
        else if (props.changeOfParts[0] && router.query.assetId) {
            const defaultCOP = props.changeOfParts[0];
            // set data only if the asset is inside user's allocated plant
            if (user.data?.allocated_plants.includes(defaultCOP.plantId)) {
                setFormData((prev) => {
                    return {
                        ...prev,
                        plantId: defaultCOP.plantId,
                        psaId: defaultCOP.psaId,
                    };
                });
            }

            setTimeout(() => {
                setIsReady(true);
            }, 1500);
        } else {
            setIsReady(true);
        }
    }, [props.changeOfParts, router.query, user.data]);

    return (
        <>
            {isReady ? (
                <ModuleMain>
                    <ModuleHeader title="New Change Of Parts" header="Create New Change Of Parts">
                        <Link href="/ChangeOfParts" className="btn btn-secondary">
                            Back
                        </Link>
                    </ModuleHeader>
                    <ModuleContent>
                        <COPForm formData={formData} setFormData={setFormData} />
                        <ModuleFooter>
                            {displayErrorMsg && (
                                <span style={{ color: "red" }}>
                                    Please fill in all required fields
                                </span>
                            )}

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
            ) : (
                <LoadingHourglass />
            )}

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

export const getServerSideProps: GetServerSideProps = createChangeOfPartsServerSideProps(
    true,
    (response: AxiosResponse<CMMSChangeOfParts[]>) => {
        return !!response.data;
    }
);
