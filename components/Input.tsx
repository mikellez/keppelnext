// import CaretPositioning from "./EditCaretPositioning";
import React, { useEffect, useState } from "react";
import { CMMSAssetDetails } from "../types/common/interfaces";

interface InputProps {
  className: string;
  inputId: any;
  onBlur: React.FormEventHandler;
  placeholder: string;
  value: string;
  setDetails: React.SetStateAction<any>;
  details: any;
  oldDetails: any;
}

export default function Input(props: InputProps) {
  const handleBlur = (e: React.ChangeEvent<HTMLDivElement>) => {
    props.setDetails((prevState: any) => {
      console.log(e.target.innerHTML);
      return { ...prevState, [e.target.id]: e.target.innerText };
    });
    const currText = e.target.innerText;
    let oldText = props.oldDetails[e.target.id];
    // console.log(currText);
    // console.log(oldText);
    var result = "<div>";
    let idx = 0;
    while (idx < currText.length && idx < oldText.length) {
      if (currText[idx] === oldText[idx]) {
        result += currText[idx];
        idx++;
        console.log(result);
      } else {
        const start = idx;
        while (currText[idx] != oldText[idx]) {
          idx++;
        }
        result += `<mark>${currText.slice(start, idx)}</mark>`;
        console.log(result);
      }
    }
    if (currText.length > idx) {
      result += `<mark>${currText.slice(idx)}</mark>`;
    }
    result += "</div>";
    // result += ;
    console.log(result);

    const ref = document.getElementById(e.target.id);
    ref!.innerHTML = result;
    console.log(ref?.innerHTML);
  };
  return (
    <div
      contentEditable
      className={props.className}
      id={props.inputId}
      onBlur={handleBlur}
      // onFocus={handleFocus}
    >
      <div>{props.value}</div>
    </div>
  );
}
