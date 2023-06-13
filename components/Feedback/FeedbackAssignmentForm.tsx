import React from "react";
import { ModuleContent } from "../";
import AssignToSelect, { AssignedUserOption } from "../Schedule/AssignToSelect";
import RequiredIcon from "../RequiredIcon";
import { SingleValue } from "react-select";
import formStyles from "../../styles/formStyles.module.css";
import { CMMSFeedback } from "../../types/common/interfaces";

interface FeedbackCreationFormProps {
  feedbackData: CMMSFeedback;
  setFeedbackData: React.Dispatch<React.SetStateAction<CMMSFeedback>>;
}

const FeedbackCreationForm = (props: FeedbackCreationFormProps) => {
  //   console.log(props.feedbackData);
  const updateFeedback = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const newInput =
      e.target.name === "plant_id" ? parseInt(e.target.value) : e.target.value;
    props.setFeedbackData((prev) => {
      return {
        ...prev,
        [e.target.name]: newInput,
      };
    });
  };

  const updateFeedbackField = (
    value: number | string | null,
    field: string
  ) => {
    props.setFeedbackData((prev) => {
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
          <label className="form-label">Plant Name</label>
          <input
            type="text"
            className="form-control"
            name="plant_id"
            value={props.feedbackData.plant_id}
            onChange={updateFeedback}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Remarks</label>
          <input
            type="text"
            className="form-control"
            name="description"
            value={
              props.feedbackData.description
                ? props.feedbackData.description
                : ""
            }
            onChange={updateFeedback}
          />
        </div>

        <div className={formStyles.halfContainer}>
          <div className="form-group">
            <label className="form-label">
              <RequiredIcon /> Assigned To
            </label>
            <AssignToSelect
              onChange={(value) => {
                updateFeedbackField(
                  (value as SingleValue<AssignedUserOption>)?.value as number,
                  "assigned_user_name"
                );
              }}
              plantId={props.feedbackData.plant_id}
              isSingle
              defaultIds={
                props.feedbackData && props.feedbackData.assigned_user_id
                  ? [props.feedbackData.assigned_user_id as number]
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
              defaultValue={props.feedbackData.createdbyuser}
              disabled
            />
          </div>
        </div>
      </div>
    </ModuleContent>
  );
};

export default FeedbackCreationForm;
