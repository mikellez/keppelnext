import React from "react";
import RequiredIcon from "../RequiredIcon";
import AssetSelect, { AssetOption } from "../Checklist/AssetSelect";
import AssignToSelect, { AssignedUserOption } from "../Schedule/AssignToSelect";
import { SingleValue } from "react-select";
import { ModuleContent } from "../ModuleLayout/ModuleContent";
import formStyles from "../../styles/formStyles.module.css";
import { useCurrentUser } from "../SWR";

export interface ChangeOfPartsForm {
    linkedAsset: AssetOption;
    description: string;
    assignedUser: AssignedUserOption;
    scheduleDate: Date;
}

interface COPFormProps {
    formData: ChangeOfPartsForm
    setFormData: React.Dispatch<React.SetStateAction<ChangeOfPartsForm>>
}

const COPForm = (props: COPFormProps) => {
    const user = useCurrentUser();

    const updateData = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
        const newInput = e.target.value;
        props.setFormData((prev) => {
            return {
                ...prev,
                [e.target.name]: newInput,
            };
        });
    };

    const updateDataField = (value: number | string | null, field: string) => {
        props.setFormData((prev) => {
            return {
                ...prev,
                [field]: value,
            };
        });
    };


    return (
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
    )
};

export default COPForm;