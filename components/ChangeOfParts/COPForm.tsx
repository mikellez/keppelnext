import React from "react";
import RequiredIcon from "../RequiredIcon";
import AssetSelect, { AssetOption } from "../Checklist/AssetSelect";
import AssignToSelect, { AssignedUserOption } from "../Schedule/AssignToSelect";
import PlantSelect from "../PlantSelect";
import { SingleValue } from "react-select";
import { ModuleContent } from "../ModuleLayout/ModuleContent";
import formStyles from "../../styles/formStyles.module.css";
import { useCurrentUser } from "../SWR";
import { CMMSChangeOfParts } from "../../types/common/interfaces";

interface COPFormProps {
    formData: CMMSChangeOfParts
    setFormData: React.Dispatch<React.SetStateAction<CMMSChangeOfParts>>
}

const COPForm = (props: COPFormProps) => {
    const user = useCurrentUser();

    const updateDataField = (value: number | string | null, field: string) => {
        props.setFormData((prev) => {
            return {
                ...prev,
                [field]: value,
            };
        });
    };

    return (
        props.formData.scheduledDate &&
        <ModuleContent includeGreyContainer grid>
            <div className={formStyles.halfContainer}>
                <div className="form-group">
                    <label className="form-label">
                        <RequiredIcon /> Plant
                    </label>
                    <PlantSelect 
                        onChange={(e) => updateDataField(+e.target.value, "plantId")}
                        accessControl
                        defaultPlant={props.formData.plantId ? props.formData.plantId : -1}
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
                        rows={5}
                        onChange={(e) => updateDataField(e.target.value, "description")}
                        value={props.formData.description}
                        style={{resize: "none"}}
                    ></textarea>
                </div>
            </div>
            <div className={formStyles.halfContainer}>
                <div className="form-group">
                    <label className="form-label">
                        <RequiredIcon /> Linked Assets
                    </label>
                    <AssetSelect
                        onChange={(value) => {
                            updateDataField(
                                (value as SingleValue<AssetOption>)?.value as number,
                                "psaId"
                            );
                        }}
                        plantId={props.formData.plantId ? props.formData.plantId : -1}
                        isSingle={true}
                        defaultIds={props.formData.psaId ? [props.formData.psaId] : []}
                    />

                </div>

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
                                "assignedUserId"
                            );
                        }}
                        defaultIds={props.formData.assignedUserId ? [props.formData.assignedUserId] : []}
                    />
                </div>
                        
                <div className="form-group">
                    <label className="form-label">
                        <RequiredIcon /> Schedule Date
                    </label>
                    <input
                        type="date"
                        className="form-control"
                        name="scheduledDate"
                        onChange={(e) => updateDataField(e.target.value, "scheduledDate")}
                        min={new Date().toISOString().slice(0, 10)}
                        value={new Date(new Date(props.formData.scheduledDate).getTime() + 8 * 3600 * 1000).toISOString().slice(0, 10)}
                    />
                </div>
            </div>
        </ModuleContent>
        
    )
};

export default COPForm;