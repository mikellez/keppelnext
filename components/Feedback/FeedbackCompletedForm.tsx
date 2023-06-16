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
  const [formData, setFormData] = useState<CMMSFeedback>(props.feedbackData);

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

  useEffect(() => {
    props.setFeedbackData(formData);
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
              value={formData.plant_name}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Plant Location</label>
            <input
              type="text"
              className="form-control"
              disabled
              value={`${formData.loc_floor + " Floor - " + formData.loc_room}`}
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
              value={formData.description}
              disabled
            ></textarea>
          </div>
        </div>
        <div className={formStyles.halfContainer}>
          <div className="form-group">
            <div>
              <label className="form-label">Feedback Image</label>
            </div>
            {/* {form.image} */}
            {/* <img src={form.image} alt="" /> */}
            {formData.image && <ImagePreview previewObjURL={formData.image} />}
            {/* <Image
            src={f.image}
            onError={({ currentTarget }) => {
              currentTarget.onerror = null; // prevents looping
              currentTarget.src = "";
            }}
            width={480}
            height={270}
            alt="/"
          /> */}
          </div>
          <div className="form-group">
            <label className="form-label">
              <RequiredIcon /> Assigned to
            </label>
            <input
              type="text"
              className="form-control"
              disabled
              value={formData.assigned_user_name}
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
              value={formData.createdbyuser}
            />
          </div>
          <div className="form-group">
            {formData.created_user_id != "1" ? (
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
                    formData.created_user_email
                      ? formData.created_user_email
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
                    formData.contact.tele
                      ? formData.contact.tele
                      : formData.contact.whatsapp
                      ? formData.contact.whatsapp
                      : formData.contact.email
                      ? formData.contact.email
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
              value={new Date(formData.created_date).toLocaleDateString()}
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
            onChange={(e) => {
              setFormData((prev: any) => {
                // console.log(e);
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
