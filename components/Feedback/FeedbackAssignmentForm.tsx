import React, { useRef } from "react";
import RequiredIcon from "../RequiredIcon";
import AssetSelect, { AssetOption } from "../Checklist/AssetSelect";
import AssignToSelect, { AssignedUserOption } from "../Schedule/AssignToSelect";
import PlantSelect from "../PlantSelect";
import { SingleValue } from "react-select";
import { ModuleContent } from "../ModuleLayout/ModuleContent";
import formStyles from "../../styles/formStyles.module.css";
import { useCurrentUser } from "../SWR";
import { CMMSFeedback } from "../../types/common/interfaces";

interface FeedbackFormProps {
  feedbackData: CMMSFeedback;
  setFeedbackData?: React.Dispatch<React.SetStateAction<CMMSFeedback>>;
  disableForm?: boolean;
}

const FeedbackAssignmentForm = (props: FeedbackFormProps) => {
  const user = useCurrentUser();
  const assetRef = useRef<any>();

  const updateDataField = (
    value: number | string | Date | null,
    field: string
  ) => {
    if (props.setFeedbackData) {
      props.setFeedbackData((prev) => {
        return {
          ...prev,
          [field]: value,
        };
      });
    }

    if (field === "plantId") {
      assetRef.current.setValue("");
    }
  };

  return (
    <ModuleContent includeGreyContainer grid>
      <div className={formStyles.halfContainer}>
        <div className="form-group">
          <label className="form-label">
            <RequiredIcon /> Plant
          </label>
          <PlantSelect
            onChange={(e) => updateDataField(+e.target.value, "plantId")}
            accessControl
            defaultPlant={
              props.feedbackData.plant_id ? props.feedbackData.plant_id : -1
            }
            disabled={props.disableForm}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Description</label>
          <textarea
            className="form-control"
            name="description"
            id="formControlDescription"
            rows={5}
            onChange={(e) => updateDataField(e.target.value, "description")}
            value={props.feedbackData.description}
            style={{ resize: "none" }}
            disabled={props.disableForm}
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
                "assignedUserId"
              );
            }}
            defaultIds={
              props.feedbackData.assigned_user_id
                ? [props.feedbackData.assigned_user_id]
                : []
            }
            disabled={props.disableForm}
          />
        </div>
      </div>
    </ModuleContent>
  );
};

export default FeedbackAssignmentForm;
