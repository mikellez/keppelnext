import React, { useRef, useState, useEffect } from "react";
import RequiredIcon from "../RequiredIcon";
import AssetSelect, { AssetOption } from "../Checklist/AssetSelect";
import AssignToSelect, { AssignedUserOption } from "../Schedule/AssignToSelect";
import PlantSelect from "../PlantSelect";
import { SingleValue } from "react-select";
import { ModuleContent } from "../ModuleLayout/ModuleContent"
import { ModuleDivider } from "../ModuleLayout/ModuleDivider";
import formStyles from "../../styles/formStyles.module.css";
import { useCurrentUser } from "../SWR";
import { CMMSFeedback } from "../../types/common/interfaces";
import FeedbackContact from "./FeedbackContact";
import StarRatings from "react-star-ratings";
import ImagePreview from "../Request/ImagePreview";
import Image from "next/image";

interface FeedbackFormProps {
  feedbackData: CMMSFeedback;
  setFeedbackData?: React.Dispatch<React.SetStateAction<CMMSFeedback>>;
  disableForm?: boolean;
}

const FeedbackAssignmentForm = (props: FeedbackFormProps) => {
  const user = useCurrentUser();
  const [form, setForm] = useState<CMMSFeedback>(props.feedbackData);
  // const assetRef = useRef<any>();



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

  //   if (field === "plantId") {
  //     assetRef.current.setValue("");
  //   }
  // };

  useEffect(() => {
    setForm(props.feedbackData);
    console.log(props.feedbackData.image);
  }, [props.feedbackData])

  return (

    <ModuleContent includeGreyContainer grid>
      {/* <FeedbackContact></FeedbackContact> */}
      {/* <ModuleDivider></ModuleDivider> */}
      <div className={formStyles.halfContainer}>
        <div className="form-group">
          
          <label className="form-label">
            Plant
          </label>
          <input type="text" className="form-control" disabled value={form.plant_name} />
        </div>
        <div className="form-group">
          
          <label className="form-label">
            Plant Location
          </label>
          <input type="text" className="form-control" disabled value={`${form.loc_floor + " Floor - " + form.loc_room}`}/>
        </div>
        <div>

        <div className="form-group">
          <div>

          <label className="form-label">
            Rating
          </label>
          </div>
          <div>

            <StarRatings
            rating={form.rating} // The initial rating value
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
            value={form.description}
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
          {/* {form.image && <ImagePreview previewObjURL={form.image}></ImagePreview>} */}
          <Image src={form.image} width={480} height={270}/>
        </div>
        <div className="form-group">
          <label className="form-label">
            <RequiredIcon /> Assign to
          </label>
          <AssignToSelect
            plantId={form.plant_id as number}
            isSingle={true}
            onChange={(value) => {
              setForm(prev => {
                return {
                  ...prev,
                  ['assigned_user_id']: value
                }
              })
            }}
            defaultIds={
              form.assigned_user_id
              ? [form.assigned_user_id]
              : []
            }
          />
        </div>
      </div>
    </ModuleContent>
)}

export default FeedbackAssignmentForm;
