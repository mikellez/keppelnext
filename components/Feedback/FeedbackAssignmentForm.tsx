/**
 * EXPLANATION
 * The following is a form component used for assigning feedbacks
 * to other users. Due to the many features that the component supports,
 * it takes in the following props
 *
 * props = {
 * feedbackData
 * setFeedbackData
 * disableForm?
 * }
 *
 * - feedbackData : CMMSFeedback, this is the data to be displayed on the
 *   component, allowing the component to populate the nessary fields
 *
 * - setFeedbackData : React.Dispatch<React.SetStateAction<CMMSFeedback>>>
 *   allows the component to change the data in the the parent component
 *
 * - disableForm : boolean | null, this disable the form inputs if nessasary
 *
 *
 */

import React, { useRef, useState, useEffect, CSSProperties } from "react";
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
import { ModuleModal } from "../ModuleLayout/ModuleModal";
import FeedbackValidation from "./FeedbackValidation";
import { FullWidth } from "ag-grid-community/dist/lib/components/framework/componentTypes";

const FeedbackAssignmentForm = (props: FeedbackFormProps) => {
  const user = useCurrentUser();
  const [image, setImage] = useState<boolean>(false);
  const f = props.feedbackData;

  const centerTransform: CSSProperties = {
    position: "relative",
    left: "50%",
    top: "50%",
    transform: "translate(-50%, -50%)",
  };
  const previewContent: CSSProperties = {
    ...centerTransform,
    textAlign: "center",

    height: "100%",
    width: "100%",

    backgroundSize: "contain",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "center",
  };

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
  console.log(props);

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
              value={f.description}
              disabled
            ></textarea>
          </div>
        </div>
        <div className={formStyles.halfContainer}>
          <div className="form-group">
            <label className="form-label">
              <RequiredIcon /> Assign to
            </label>
            <AssignToSelect
              plantId={f.plant_id as number}
              isSingle={true}
              onChange={(option) => {
                props.setFeedbackData((prev: any) => {
                  return {
                    ...prev,
                    ["assigned_user_id"]: (
                      option as SingleValue<AssignedUserOption>
                    )?.value,
                    ["assigned_user_name"]: (
                      option as SingleValue<AssignedUserOption>
                    )?.label.split("|")[0],
                  };
                });
              }}
              defaultIds={f.assigned_user_id ? [f.assigned_user_id] : []}
            />
          </div>
          {f.image != "" && (
            <div
              className={`${formStyles.imageClick} form-group`}
              onClick={() => setImage(true)}
            >
              <div>
                <label className="form-label">
                  <p style={{ textDecoration: "underline" }}>
                    View Feedback Image
                  </p>
                </label>
              </div>
              {/* <ImagePreview previewObjURL={f.image} /> */}
              {/* <div style={{...previewContent, backgroundImage: 'url("' + f.image + '")'}}> */}
              {/* <img src={f.image} width="100%" height="100%" alt="" /> */}

              {/* </div> */}
              {/* <div style={centerTransform}><BsCameraFill size={104}/>
            <div style={{color: "rgba(0,0,0,0.1)"}}>
              No Image
            </div>
          </div> */}
            </div>
          )}
        </div>
      </ModuleContent>
      <ModuleDivider />
      <ModuleContent grid>
        <div className="form-group">
          <label className="form-label">
            <RequiredIcon /> Name
          </label>
          <input
            type="text"
            className="form-control"
            disabled
            value={f.name ? f.name : f.createdbyuser}
          />
        </div>
        <div
          className="form-group"
          style={{
            paddingLeft: 2 + "em",
          }}
        >
          <label className="form-label">
            <RequiredIcon /> Created Date
          </label>
          <input
            type="text"
            className="form-control"
            disabled
            value={new Date(f.created_date).toLocaleDateString()}
          />
        </div>
        <div className="form-group">
          {f.created_user_id != "55" ? (
            <div>
              <label className="form-label">
                <RequiredIcon /> Email
              </label>
              <input
                type="text"
                className="form-control"
                disabled
                value={
                  f.created_user_email
                    ? f.created_user_email
                    : f.contact.email
                    ? f.contact.email
                    : "No email"
                }
              />
            </div>
          ) : (
            <div>
              <div className="form-group">
                {FeedbackValidation(f.contact.number, "Contact")}
              </div>
              <div className="form-group">
                {FeedbackValidation(f.contact.email, "Email")}
              </div>
            </div>
          )}
        </div>

        <ModuleModal
          isOpen={image}
          closeModal={() => setImage(false)}
          closeOnOverlayClick={true}
          large
        >
          {/* <Image src={f.image} width={100} height={100} alt="" /> */}
          <img width={"85%"} height={"85%"} src={f.image} alt="" />
        </ModuleModal>
      </ModuleContent>
    </ModuleContent>
  );
};

export default FeedbackAssignmentForm;
