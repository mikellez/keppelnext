import React, { useRef } from "react";
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
    setFormData?: React.Dispatch<React.SetStateAction<CMMSChangeOfParts>>
    disableForm?: boolean
}

const COPForm = (props: COPFormProps) => {
    const user = useCurrentUser();
    const assetRef = useRef<any>();

    const updateDataField = (value: number | string | Date | null, field: string) => {
        if (props.setFormData) {
            props.setFormData((prev) => {
                return {
                    ...prev,
                    [field]: value,
                };
            });
        }
        
        if (field === "plantId") {
            assetRef.current.setValue("")
        }
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
                        disabled={props.disableForm}
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
                        disabled={props.disableForm}
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
                        ref={assetRef}
                        disabled={props.disableForm}
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
                        disabled={props.disableForm}
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
                        onChange={(e) => updateDataField(new Date(e.target.value), "scheduledDate")}
                        min={new Date().toISOString().slice(0, 10)}
                        value={new Date(new Date(props.formData.scheduledDate).getTime() + 8 * 3600 * 1000).toISOString().slice(0, 10)}
                        disabled={props.disableForm}
                    />
                </div>
            </div>
        </ModuleContent>
        
    )
};

export default COPForm;