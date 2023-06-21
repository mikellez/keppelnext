import React from "react";
import { ModuleContent, ModuleDivider } from "../";
import AssetSelect from "./AssetSelect";
import AssignToSelect, { AssignedUserOption } from "../Schedule/AssignToSelect";
import PlantSelect from "../PlantSelect";
import RequiredIcon from "../RequiredIcon";
import { SingleValue } from "react-select";
import formStyles from "../../styles/formStyles.module.css";
import { CMMSChecklist } from "../../types/common/interfaces";
import TooltipBtn from "../TooltipBtn";

interface ChecklistCreationFormProps {
    checklistData: CMMSChecklist,
    setChecklistData: React.Dispatch<React.SetStateAction<CMMSChecklist>>,
    successModal: boolean,
    updateChecklist: () => Promise<void>,
    action: string | undefined,
};

const ChecklistCreationForm = (props: ChecklistCreationFormProps) => {
    console.log(props.checklistData)
    const updateChecklist = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const newInput = e.target.name === "plant_id" ? parseInt(e.target.value) : e.target.value;
        props.setChecklistData((prev) => {
            return {
                ...prev,
                [e.target.name]: newInput,
            };
        });
    };

    const updateChecklistField = (value: number | string | null, field: string) => {
        props.setChecklistData((prev) => {
            return {
                ...prev,
                [field]: value,
            };
        });
    };

    return (
        <ModuleContent includeGreyContainer>
        <div className="d-flex row">
            <div className={`col-6 ${formStyles.halfContainer}`}>
                <div className="form-group">
                    <label className="form-label">
                        Checklist Name
                    </label>
                    <input
                        type="text"
                        className="form-control"
                        name="chl_name"
                        value={props.checklistData.chl_name ? props.checklistData.chl_name : ""}
                        onChange={updateChecklist}
                    />
                </div>

                <div className="form-group">
                    <label className="form-label">
                        Description
                    </label>
                    <input
                        type="text"
                        className="form-control"
                        name="description"
                        value={
                            props.checklistData.description
                                ? props.checklistData.description
                                : ""
                        }
                        onChange={updateChecklist}
                    />
                </div>

                <div className="form-group">
                    <label className="form-label">
                        <RequiredIcon /> Plant
                    </label>
                    <PlantSelect
                        onChange={updateChecklist}
                        name="plant_id"
                        accessControl
                        defaultPlant={props.checklistData.plant_id}
                    />
                </div>
            </div>

            <div className={`col-6 ${formStyles.halfContainer}`} style={{ gridRow: "span 3" }}>
                <div className="form-group">
                    <label className="form-label">
                        <RequiredIcon /> Linked Assets
                    </label>

                    <AssetSelect
                        onChange={(values) => {
                            if (Array.isArray(values)) {
                                const assetIdsString =
                                    values.length > 0
                                        ? values
                                            .map((option) =>
                                                option.value.toString()
                                            )
                                            .join(", ")
                                        : null;
                                updateChecklistField(
                                    assetIdsString,
                                    "linkedassetids"
                                );
                            }
                        }}
                        plantId={props.checklistData.plant_id}
                        defaultIds={props.checklistData.linkedassetids ? props.checklistData.linkedassetids.split(", ").map(id => +id) : []}
                    />
                </div>
            </div>
        </div>
        <ModuleDivider />
        <div className="row">

        
            <div className={`col-6 ${formStyles.halfContainer}`}>
                <div className="form-group">
                    <label className="form-label">
                        <RequiredIcon /> Assigned To
                    </label>
                    <AssignToSelect
                        onChange={(value) => {
                            updateChecklistField(
                                (value as SingleValue<AssignedUserOption>)
                                    ?.value as number,
                                "assigned_user_id"
                            );
                        }}
                        plantId={props.checklistData.plant_id}
                        isSingle
                        defaultIds={
                            props.checklistData && props.checklistData.assigned_user_id
                                ? [props.checklistData.assigned_user_id as number]
                                : []
                        }
                    />
                </div>

                <div className="form-group">
                    <label className="form-label">
                        <RequiredIcon /> Created By
                    </label>
                    <input
                        className="form-control"
                        defaultValue={props.checklistData.createdbyuser}
                        disabled
                    />
                </div>

                <div className="form-group">
                    <label className="form-label">
                        <RequiredIcon /> Sign Off By
                    </label>
                    <AssignToSelect
                        onChange={(value) => {
                            updateChecklistField(
                                (value as SingleValue<AssignedUserOption>)
                                    ?.value as number,
                                "signoff_user_id"
                            );
                        }}
                        plantId={props.checklistData.plant_id}
                        isSingle
                        defaultIds={
                            props.checklistData &&  props.checklistData.signoff_user_id
                                ? [props.checklistData.signoff_user_id as number]
                                : []
                        }
                    />
                </div>
            </div>
            {/* <ModuleDivider></ModuleDivider> */}
            <div className={`col-6 ${formStyles.halfContainer} d-flex align-items-end`}>
                <div style={{display: "flex", flexDirection: "row", alignItems: "end", width: "100%"}}>
                    <div className="ms-auto">

                    
                {props.action !== "New" && <TooltipBtn
                    toolTip={false}
                    style={{ backgroundColor: "#F7C04A", borderColor: "#F7C04A" }}
                    onClick={props.updateChecklist}
                    disabled={props.successModal}
                    >
                    Update
                </TooltipBtn>}
                        </div>
                </div>
            </div>
        </div>
    </ModuleContent>
    )
}

export default ChecklistCreationForm