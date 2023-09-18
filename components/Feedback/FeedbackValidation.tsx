/**
 * This component helps to add the required icon to any input lable
 * 
 * props: {
 *  value : any
 *  label : any
 * }
 * 
 *  - value : any, the placeholder value on the input tab
 *  - label : any, the name of the label 

 */

import React from "react";
import CMMSContact from "../../types/common/interfaces";
import RequiredIcon from "../RequiredIcon";

export default function FeedbackValidation(value: any, label: any) {
  if (value != "") {
    return (
      <div>
        <label className="form-label">
          {label} <RequiredIcon />
        </label>
        <input type="text" className="form-control" disabled value={value} />
      </div>
    );
  } else {
    return <div></div>;
  }
}
