import React from "react";
import { SingleValue } from "react-select";
import { ModuleContent, ModuleDivider } from "../";
import formStyles from "../../styles/formStyles.module.css";
import { CMMSChecklist } from "../../types/common/interfaces";
import PlantSelect from "../PlantSelect";
import RequiredIcon from "../RequiredIcon";
import AssignToSelect, { AssignedUserOption } from "../Schedule/AssignToSelect";
import TooltipBtn from "../TooltipBtn";
import AssetSelect from "./AssetSelect";

interface ChecklistCreationFormProps {
  checklistData: CMMSChecklist;
  setChecklistData: React.Dispatch<React.SetStateAction<CMMSChecklist>>;
  successModal: boolean;
  updateChecklist: () => Promise<void>;
  action: string | undefined;
  setChangeAssigned: React.Dispatch<React.SetStateAction<boolean>>;
}

const ChecklistCreationForm = (props: ChecklistCreationFormProps) => {
  // console.log(props.checklistData)
  const updateChecklist = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const newInput =
      e.target.name === "plant_id" ? parseInt(e.target.value) : e.target.value;
    props.setChecklistData((prev) => {
      return {
        ...prev,
        [e.target.name]: newInput,
      };
    });
  };

  const updateChecklistField = (
    value: number | string | null,
    field: string
  ) => {
    // console.log(props.checklistData);
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
              <RequiredIcon /> Checklist Name
            </label>
            <input
              type="text"
              className="form-control"
              name="chl_name"
              value={
                props.checklistData.chl_name ? props.checklistData.chl_name : ""
              }
              onChange={updateChecklist}
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              <RequiredIcon /> Description
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
              universalPlants
              defaultPlant={props.checklistData.plant_id}
            />
          </div>
        </div>

        <div
          className={`col-6 ${formStyles.halfContainer}`}
          style={{ gridRow: "span 3" }}
        >
          <div className="form-group">
            <label className="form-label">
              Linked Assets
            </label>
            <AssetSelect
              onChange={(values) => {
                if (Array.isArray(values)) {
                  const assetIdsString =
                    values.length > 0
                      ? values
                          .map((option) => option.value.toString())
                          .join(", ")
                      : null;
                  updateChecklistField(assetIdsString, "linkedassetids");
                }
              }}
              plantId={props.checklistData.plant_id}
              defaultIds={
                props.checklistData.linkedassetids
                  ? props.checklistData.linkedassetids
                      .split(", ")
                      .map((id) => +id)
                  : []
              }
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              Checklist Overdue Tracking
            </label>
            <select
              className="form-select"
              name="overdue"
              onChange={updateChecklist}
              value={
                props.checklistData.overdue
                  ? props.checklistData.overdue
                  : ""
              }
            >
              <option hidden selected
              >
              -- Select Overdue Time Period Category --
              </option>
              <option value="daily">Daily (Overdue if exceeds 1 day)</option>
              <option value="weekly">Weekly (Overdue if exceeds 7 days)</option>
              <option value="monthly">Monthly (Overdue if exceeds 30 days)</option>
              <option value="quarterly">Quarterly (Overdue if exceeds 3 months)</option>
              <option value="half yearly">Half Yearly (Overdue if exceeds 6 months)</option>
              <option value="annually">Annually (Overdue if excees 1 year)</option>
            </select>
          </div>
        </div>
      </div>

      <ModuleDivider />
      <div className="row">
        <div className={`col-6 ${formStyles.halfContainer}`}>
          <div className="form-group">
            <label className="form-label">
              Assigned To
            </label>
            <AssignToSelect
              onChange={(option) => {
                updateChecklistField(
                  (option as SingleValue<AssignedUserOption>)?.value as number,
                  "assigned_user_id"
                );
                updateChecklistField(
                  (option as SingleValue<AssignedUserOption>)?.label as string,
                  "assigneduser"
                );
                props.setChangeAssigned(true);
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
              defaultValue={
                props.checklistData.createdbyuser !== " "
                  ? props.checklistData.createdbyuser
                  : "System Generated"
              }
              disabled
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              Sign Off By
            </label>
            <AssignToSelect
              onChange={(value) => {
                updateChecklistField(
                  (value as SingleValue<AssignedUserOption>)?.value as number,
                  "signoff_user_id"
                );
              }}
              plantId={props.checklistData.plant_id}
              isSingle
              defaultIds={
                props.checklistData && props.checklistData.signoff_user_id
                  ? [props.checklistData.signoff_user_id as number]
                  : []
              }
              signoff={true}
            />
          </div>
        </div>
        {/* <ModuleDivider></ModuleDivider> */}
        <div
          className={`col-6 ${formStyles.halfContainer} d-flex align-items-end`}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "end",
              width: "100%",
            }}
          >
            <div className="ms-auto">
              {props.action !== "New" && (
                <TooltipBtn
                  toolTip={false}
                  style={{ backgroundColor: "#F7C04A", borderColor: "#F7C04A" }}
                  onClick={props.updateChecklist}
                  disabled={props.successModal}
                >
                  Update
                </TooltipBtn>
              )}
            </div>
          </div>
        </div>
      </div>
    </ModuleContent>
  );
};

export default ChecklistCreationForm;
