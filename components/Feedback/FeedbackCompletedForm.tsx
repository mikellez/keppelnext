import React, { useRef, useState, useEffect } from "react";
import RequiredIcon from "../RequiredIcon";
import { ModuleContent } from "../ModuleLayout/ModuleContent";
import { ModuleDivider } from "../ModuleLayout/ModuleDivider";
import formStyles from "../../styles/formStyles.module.css";
import { useCurrentUser } from "../SWR";
import ImagePreview from "../Request/ImagePreview";
import { FeedbackFormProps } from "../../pages/Feedback";
import { CMMSFeedback } from "../../types/common/interfaces";
import { ModuleModal } from "../ModuleLayout/ModuleModal";
import Image from "next/image";
import FeedbackValidation from "./FeedbackValidation";

const FeedbackCompletedForm = (props: FeedbackFormProps) => {
  const user = useCurrentUser();
  const [selectedFile, setSelectedFile] = useState<File>();
  const [previewedFile, setPreviewedFile] = useState<string>();
  const [feedbackImage, setFeedbackImage] = useState<boolean>(false);
  const [completeImage, setCompleteImage] = useState<boolean>(false);

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
  // console.log(props.feedbackData.created_user_id);

  useEffect(() => {
    if (selectedFile) {
      const reader = new FileReader();

      reader.readAsDataURL(selectedFile);
      reader.onload = () => {
        setPreviewedFile(reader.result as string);
        props.setFeedbackData((prevState: any) => {
          return { ...prevState, completed_img: reader.result };
        });
      };
    } else {
      setPreviewedFile("");
    }
  }, [selectedFile]);

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
          {props.feedbackData.image != "" && (
            <div
              className={`${formStyles.imageClick} form-group`}
              onClick={() => setFeedbackImage(true)}
            >
              <div>
                <label className="form-label">
                  <p style={{ textDecoration: "underline" }}>
                    View Feedback Image
                  </p>
                </label>
              </div>
            </div>
          )}
        </div>
      </ModuleContent>
      <ModuleDivider />

      <ModuleContent grid>
        <div className={formStyles.halfContainer}>
          <div className="form-group">
            <label className="form-label">
              <RequiredIcon /> Name
            </label>
            <input
              type="text"
              className="form-control"
              disabled
              value={
                props.feedbackData.name
                  ? props.feedbackData.name
                  : props.feedbackData.createdbyuser
              }
            />
          </div>
          <div className="form-group">
            {props.feedbackData.created_user_id != "55" ? (
              <>
                <label className="form-label">
                  <RequiredIcon /> Email
                </label>
                <input
                  type="text"
                  className="form-control"
                  disabled
                  value={
                    props.feedbackData.created_user_email
                      ? props.feedbackData.created_user_email
                      : props.feedbackData.contact.email
                      ? props.feedbackData.contact.email
                      : "No email"
                  }
                />
              </>
            ) : (
              <div>
                <div className="form-group">
                  {FeedbackValidation(
                    props.feedbackData.contact.number,
                    "Contact"
                  )}
                </div>
                <div className="form-group">
                  {FeedbackValidation(
                    props.feedbackData.contact.email,
                    "Email"
                  )}
                </div>
              </div>
            )}
          </div>
          <div className="form-group">
            <label className="form-label">
              <RequiredIcon /> Created Date
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
          <div className="form-group">
            <div>
              <label className="form-label">Complete Feedback Image</label>
              <input
                className="form-control"
                type="file"
                accept="image/jpeg,image/png,image/gif"
                id="formFile"
                onChange={(e) => {
                  // console.log(e.target.files![0]);
                  setCompleteImage(false);
                  setSelectedFile(e.target.files![0]);
                }}
              />
            </div>
            {previewedFile && (
              <div
                className={`${formStyles.imageClick} form-group`}
                onClick={() => setCompleteImage(true)}
              >
                <div>
                  <label className="form-label">
                    <p style={{ textDecoration: "underline" }}>
                      View Complete Feedback Image
                    </p>
                  </label>
                </div>
              </div>
            )}
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
        </div>
      </ModuleContent>
      <ModuleModal
        isOpen={feedbackImage}
        closeModal={() => setFeedbackImage(false)}
        closeOnOverlayClick={true}
      >
        <Image src={props.feedbackData.image} fill={true} alt="" />
      </ModuleModal>
      <ModuleModal
        isOpen={completeImage}
        closeModal={() => setCompleteImage(false)}
        closeOnOverlayClick={true}
      >
        <div style={{ textAlign: "center" }}>
          <img width={"100%"} height={"100%"} src={previewedFile} alt="" />
        </div>{" "}
      </ModuleModal>
    </ModuleContent>
  );
};

export default FeedbackCompletedForm;
