/**
 *
 * EXPLANATION OF INPUT COMPONENT
 *
 * This module creates a input label that highlights the changes onBlur
 * Uses the contentEditable function for divs
 *
 * props :
 * - className : allows user to apply CSS to the input,
 * - inputID : unique id for each input to allow getElementByID to reference it (detail[inputID] should return the value)
 * - placeholder : default value for each input
 * - value : its current value, if null will display the placeholder
 * - setDetails : to update the value when the input is changed
 * - details : the details parsed into input
 *
 *
 */

import React, { useEffect, useState } from "react";
import { CMMSAssetDetails } from "../types/common/interfaces";
import { useAsset } from "./SWR";

interface InputProps {
  className: string;
  inputId: any;
  // onBlur: React.FormEventHandler;
  placeholder: string;
  value: string;
  setDetails: React.SetStateAction<any>;
  details: any;
}

export default function Input(props: InputProps) {
  const [oldData, setOldData] = useState<any>(props.details);
  const [isInitial, setIsInitial] = useState<boolean>(true);

  useEffect(() => {
    if (props.details && isInitial) {
      setOldData(props.details);
      setIsInitial(false);
    }
    // console.log("running");
  }, [props.details]);

  const handleBlur = (e: React.ChangeEvent<HTMLDivElement>) => {
    if (e.target.innerText !== props.placeholder) {
      props.setDetails((prevState: any) => {
        // console.log(
        //   e.target.innerText && e.target.innerText != "\n"
        //     ? e.target.innerText
        //     : ""
        // );
        return {
          ...prevState,
          [e.target.id]:
            e.target.innerText && e.target.innerText != "\n"
              ? e.target.innerText
              : "",
        };

        // console.log(e.target.innerHTML);
      });
    } else {
      props.setDetails((prevState: any) => {
        return {
          ...prevState,
          [e.target.id]: "",
        };

        // console.log(e.target.innerHTML);
      });
    }
    const currText = e.target.innerText;
    let oldText = props.details![props.inputId];
    // console.log(currText);
    // console.log(oldText);
    var result = "<div>";
    let idx = 0;
    if (oldText != null) {
      oldText = oldText.toString();
      while (idx < currText.length && idx < oldText.length) {
        if (currText[idx] === oldText[idx]) {
          result += currText[idx];
          idx++;
          // console.log(result);
        } else {
          const start = idx;
          while (currText[idx] != oldText[idx] && idx < currText.length) {
            idx++;
          }
          if (start != idx) {
            result += `<mark>${currText.slice(start, idx)}</mark>`;
            // console.log(result);
          } else {
            result += `<mark>${currText[idx]}</mark>`;
          }
        }
        // console.log("running loop");
      }
      if (currText.length > idx && currText != "\n") {
        // console.log("this is :" + currText + "'");
        result += `<mark>${currText.slice(idx)}</mark>`;
        // console.log("first if");
      }
      if (oldText.length - 6 > currText.length) {
        result += "<mark>&nbsp;</mark>";
        // console.log("sec if");
      }
      // result += ;
    } else {
      // console.log("last if");
      result += "<mark>" + currText + "</mark>";
    }
    result += "</div>";
    // console.log(result);
    const ref = document.getElementById(e.target.id);
    ref!.innerHTML = result;
  };

  // useEffect(() => {
  //   setOldData(props.oldDetails);
  //   console.log(props.oldDetails);
  // }, [props.oldDetails]);

  return (
    <div
      contentEditable
      className={props.className}
      id={props.inputId}
      style={{
        height: "10",
        minHeight: "40px",
      }}
      onBlur={handleBlur}
      // onFocus={handleFocus}
    >
      <div>{props.value ? props.value : props.placeholder}</div>
    </div>
  );
}
