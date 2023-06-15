import React, { useRef, useState, useEffect } from "react";
import RequiredIcon from "../RequiredIcon";
import AssetSelect, { AssetOption } from "../Checklist/AssetSelect";
import AssignToSelect, { AssignedUserOption } from "../Schedule/AssignToSelect";
import PlantSelect from "../PlantSelect";
import { SingleValue } from "react-select";
import { ModuleContent } from "../ModuleLayout/ModuleContent";
import { ModuleDivider } from "../ModuleLayout/ModuleDivider";
import formStyles from "../../styles/formStyles.module.css";
import { useCurrentUser } from "../SWR";
import { CMMSFeedback } from "../../types/common/interfaces";
import FeedbackContact from "./FeedbackContact";
import StarRatings from "react-star-ratings";
import ImagePreview from "../Request/ImagePreview";
import Image from "next/image";
import { FeedbackFormProps } from "../../pages/Feedback";

const FeedbackCompletedForm = (props: FeedbackFormProps) => {
  const user = useCurrentUser();
  const f = props.feedbackData;
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
    props.setFeedbackData(f);
    // console.log(props.feedbackData.image);
  }, [props.feedbackData]);

  // console.log(form.created_by_user_id);
  return (
    <ModuleContent includeGreyContainer grid>
      {/* <FeedbackContact></FeedbackContact> */}
      {/* <ModuleDivider></ModuleDivider> */}
      <div className={formStyles.halfContainer}>
        <div className="form-group">
          <label className="form-label">Plant</label>
          <input
            type="text"
            className="form-control"
            disabled
            value={f.plant_name}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Plant Location</label>
          <input
            type="text"
            className="form-control"
            disabled
            value={`${f.loc_floor + " Floor - " + f.loc_room}`}
          />
        </div>
        <div>
          <div className="form-group">
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
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Feedback Description</label>
          <textarea
            className="form-control"
            name="description"
            id="formControlDescription"
            rows={5}
            value={f.description}
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
          {f.image && <ImagePreview previewObjURL={f.image} />}
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
            <RequiredIcon /> Assigned
          </label>
          <input
            type="text"
            className="form-control"
            disabled
            value={`${f.assigned_user_name}`}
          />
        </div>
      </div>

      <div className={formStyles.halfContainer}>
        <ModuleDivider />

        <div className="form-group">
          <label className="form-label">
            <RequiredIcon />
            Name
          </label>
          <input
            type="text"
            className="form-control"
            disabled
            value={f.createdbyuser}
          />
        </div>
        <div className="form-group">
          {f.created_user_id != "1" ? (
            <>
              <label className="form-label">
                <RequiredIcon />
                Email
              </label>
              <input
                type="text"
                className="form-control"
                disabled
                value={f.created_user_email ? f.created_user_email : "No email"}
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
                  f.contact.tele
                    ? f.contact.tele
                    : f.contact.whatsapp
                    ? f.contact.whatsapp
                    : f.contact.email
                    ? f.contact.email
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
            value={new Date(f.created_date).toLocaleDateString()}
          />
        </div>
      </div>
    </ModuleContent>
  );
};

export default FeedbackCompletedForm;
