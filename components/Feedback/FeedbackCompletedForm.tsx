import React, { useRef, useState, useEffect } from "react";
import RequiredIcon from "../RequiredIcon";
import { ModuleContent } from "../ModuleLayout/ModuleContent";
import { ModuleDivider } from "../ModuleLayout/ModuleDivider";
import formStyles from "../../styles/formStyles.module.css";
import { useCurrentUser } from "../SWR";
import ImagePreview from "../Request/ImagePreview";
import { FeedbackFormProps } from "../../pages/Feedback";
import { CMMSFeedback } from "../../types/common/interfaces";

const FeedbackCompletedForm = (props: FeedbackFormProps) => {
  const user = useCurrentUser();
  // const updateDataField = (
  //   value: number | string | Date | null,
  //   field: string
  // ) => {
  //   if (props.setFeedbackData) {
  //     props.setFeedbackData((prev) => {
  //       return {
  //         ...prev,
  //         [field]: value,
  //       };
  //     });
  //   }
  // };
  const disForm = props.disableForm ? props.disableForm : false;

  useEffect(() => {
    props.setFeedbackData(props.feedbackData);
    // console.log(props.feedbackData.image);
  }, [props.feedbackData]);

  // console.log(form.created_by_user_id);

  return (
    <ModuleContent includeGreyContainer>
      <ModuleContent grid>
        {/* <FeedbackContact></FeedbackContact> */}
        {/* <ModuleDivider></ModuleDivider> */}
        <div className={formStyles.halfContainer}>
          <div className="form-group">
            <label className="form-label">Plant</label>
            <input
              type="text"
              className="form-control"
              disabled
              value={props.feedbackData.plant_name}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Plant Location</label>
            <input
              type="text"
              className="form-control"
              disabled
              value={`${
                props.feedbackData.loc_floor +
                " Floor - " +
                props.feedbackData.loc_room
              }`}
            />
          </div>
          <div>
            {/* <div className="form-group">
            <div>
            <label className="form-label">Rating</label>
            </div>
            <div>
            <StarRatings
                rating={f.rating} // The initial rating value
                starRatedColor="orange" // Color of the selected stars
                numberOfStars={5} // Total number of stars
                starDimension="20px" // Size of the stars
                starSpacing="2px" // Spacing between the stars
                />
                </div>
          </div> */}
          </div>

          <div className="form-group">
            <label className="form-label">Feedback Description</label>
            <textarea
              className="form-control"
              name="description"
              id="formControlDescription"
              rows={5}
              value={props.feedbackData.description}
              disabled
            ></textarea>
          </div>
        </div>
        <div className={formStyles.halfContainer}>
        {props.feedbackData.image !== "" && <div className="form-group">
            <div>
              <label className="form-label">Feedback Image</label>
            </div>
            {/* {form.image} */}
            {/* <img src={form.image} alt="" /> */}
            
              <ImagePreview previewObjURL={props.feedbackData.image} />
            
          </div>}
          <div className="form-group">
            <label className="form-label">
              <RequiredIcon /> Assigned to
            </label>
            <input
              type="text"
              className="form-control"
              disabled
              value={props.feedbackData.assigned_user_name}
            />
          </div>
        </div>
      </ModuleContent>
      <ModuleDivider />

      <ModuleContent grid>
        <div className={formStyles.halfContainer}>
          <div className="form-group">
            <label className="form-label">
              <RequiredIcon />
              Name
            </label>
            <input
              type="text"
              className="form-control"
              disabled
              value={props.feedbackData.createdbyuser}
            />
          </div>
          <div className="form-group">
            {props.feedbackData.created_user_id != "1" ? (
              <>
                <label className="form-label">
                  <RequiredIcon />
                  Email
                </label>
                <input
                  type="text"
                  className="form-control"
                  disabled
                  value={
                    props.feedbackData.created_user_email
                      ? props.feedbackData.created_user_email
                      : "No email"
                  }
                />
              </>
            ) : (
              <>
                <label className="form-label">
                  <RequiredIcon />
                  Contact
                </label>
                <input
                  type="text"
                  className="form-control"
                  disabled
                  value={
                    props.feedbackData.contact.tele
                      ? props.feedbackData.contact.tele
                      : props.feedbackData.contact.whatsapp
                      ? props.feedbackData.contact.whatsapp
                      : props.feedbackData.contact.email
                      ? props.feedbackData.contact.email
                      : "No Contact"
                  }
                />
              </>
            )}
          </div>
          <div className="form-group">
            <label className="form-label">
              <RequiredIcon />
              Created Date
            </label>
            <input
              type="text"
              className="form-control"
              disabled
              value={new Date(
                props.feedbackData.created_date
              ).toLocaleDateString()}
            />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Remarks</label>
          <textarea
            className="form-control"
            name="description"
            id="formControlDescription"
            rows={5}
            disabled={disForm}
            value={props.feedbackData.remarks ? props.feedbackData.remarks : ""}
            onChange={(e) => {
              props.setFeedbackData((prev: CMMSFeedback) => {
                // console.log(e.target.value);
                return {
                  ...prev,
                  ["remarks"]: e.target.value,
                };
              });
            }}
          ></textarea>
        </div>
        {/* <div className="form-group">
          <label className="form-label">
            <RequiredIcon />
            Date of Completion
          </label>
          <input
            type="date"
            className="form-control"
            onChange={(value) => {
              props.setFeedbackData((prev: any) => {
                // console.log(value);
                return {
                  ...prev,
                  ["completed_date"]: value,
                };
              });
            }}
            max={new Date().toISOString().slice(0, 10)}
            onKeyDown={(e) => e.preventDefault()}
          />
        </div> */}
      </ModuleContent>
    </ModuleContent>
  );
};

export default FeedbackCompletedForm;
