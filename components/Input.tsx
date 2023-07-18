// import CaretPositioning from "./EditCaretPositioning";
import React, { useEffect, useState } from "react";
import { CMMSAssetDetails } from "../types/common/interfaces";

interface InputProps {
  className: string;
  inputId: any;
  onBlur: React.FormEventHandler;
  placeholder: string;
  value: string;
}

export default function Input(props: InputProps) {
  return (
    <div
      contentEditable
      className={props.className}
      id={props.inputId}
      onBlur={props.onBlur}
      // onFocus={handleFocus}
    >
      {props.value}
    </div>
  );
}
