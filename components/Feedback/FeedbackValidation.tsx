import React from "react";
import CMMSContact from "../../types/common/interfaces";
import RequiredIcon from "../RequiredIcon";

export default function FeedbackValidation(value: any, label: any) {
  if (value != "") {
    return (
      <div>
        <label className="form-label">
          <RequiredIcon /> {label}
        </label>
        <input type="text" className="form-control" disabled value={value} />
      </div>
    );
  } else {
    return <div></div>;
  }
}
