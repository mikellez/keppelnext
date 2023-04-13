import React, { useEffect, useState } from "react";
import {
    ModuleContent,
    ModuleDivider,
    ModuleFooter,
    ModuleHeader,
    ModuleMain,
} from "../../../components";
import Link from "next/link";
import AssetSelect, { AssetOption } from "../../../components/Checklist/AssetSelect";
import formStyles from "../../../styles/formStyles.module.css";
import RequiredIcon from "../../../components/RequiredIcon";
import AssignToSelect, { AssignedUserOption } from "../../../components/Schedule/AssignToSelect";
import TooltipBtn from "../../../components/TooltipBtn";
import { SingleValue } from "react-select";
import axios from "axios";
import { useCurrentUser } from "../../../components/SWR";
import { useRouter } from "next/router";

interface ChangeOfPartsForm {
    linkedAsset: AssetOption;
    description: string;
    assignedUser: AssignedUserOption;
    scheduleDate: Date;
}

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
    console.log(formData);

    const user = useCurrentUser();
    const router = useRouter();

    const updateData = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
        const newInput = e.target.value;
        setFormData((prev) => {
            return {
                ...prev,
                [e.target.name]: newInput,
            };
        });
    };

    const updateDataField = (value: number | string | null, field: string) => {
        setFormData((prev) => {
            return {
                ...prev,
                [field]: value,
            };
        });
    };

    return (
        <ModuleMain>
            <ModuleHeader title="New Change Of Parts" header="Create New Change Of Parts">
                <Link href="/ChangeOfParts" className="btn btn-secondary">
                    Back
                </Link>
            </ModuleHeader>
            <ModuleContent>
                <ModuleContent includeGreyContainer grid>
                    <div className={formStyles.halfContainer}>
                        <div className="form-group">
                            <label className="form-label">
                                <RequiredIcon /> Linked Assets
                            </label>
                            <AssetSelect
                                onChange={(value) => {
                                    updateDataField(
                                        (value as SingleValue<AssetOption>)?.value as number,
                                        "linkedAsset"
                                    );
                                }}
                                plantId={user.data?.allocated_plants[0] as number}
                                isSingle={true}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">
                                <RequiredIcon /> Description
                            </label>
                            <textarea
                                className="form-control"
                                name="description"
                                id="formControlDescription"
                                rows={6}
                                onChange={updateData}
                            ></textarea>
                        </div>
                    </div>
                    <div className={formStyles.halfContainer}>
                        <div className="form-group">
                            <label className="form-label">
                                <RequiredIcon /> Assign to
                            </label>
                            <AssignToSelect
                                plantId={user.data?.allocated_plants[0] as number}
                                isSingle={true}
                                onChange={(value) => {
                                    updateDataField(
                                        (value as SingleValue<AssignedUserOption>)?.value as number,
                                        "assignedUser"
                                    );
                                }}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">
                                <RequiredIcon /> Schedule Date
                            </label>
                            <input
                                type="date"
                                className="form-control"
                                name="scheduleDate"
                                onChange={updateData}
                                min={new Date().toISOString().slice(0, 10)}
                            />
                        </div>
                    </div>
                </ModuleContent>
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
