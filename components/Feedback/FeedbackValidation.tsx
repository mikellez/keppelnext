import React from "react";
import CMMSContact from "../../types/common/interfaces";
import RequiredIcon from "../RequiredIcon";

export default function FeedbackValidation(contact: any) {
  var num;
  var email;
  if (contact.number != "") {
    num = (
      <div>
        <label className="form-label">
          <RequiredIcon />
          Contact
        </label>
        <input
          type="text"
          className="form-control"
          disabled
          value={contact.number}
        />
      </div>
    );
  } else {
    num = <div></div>;
  }

  if (contact.email != "") {
    email = (
      <div>
        <label className="form-label">
          <RequiredIcon />
          Email
        </label>
        <input
          type="text"
          className="form-control"
          disabled
          value={contact.email}
        />
      </div>
    );
  } else {
    email = <div></div>;
  }

  return (
    <>
      {num} {email}
    </>
  );
}
