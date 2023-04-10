import React from "react";
import { useState } from "react";
// import { CheckControl } from '../../../types/common/classes';
import CheckControl from "../../../types/common/CheckControl";

import { ImCross } from "react-icons/im";

import checklistStyles from "../ChecklistTemplateCreator.module.css";
import { ModuleDivider } from "../../ModuleLayout/ModuleDivider";

export class FreeTextControl extends CheckControl {
  constructor(question?: string, value?: string, id?: string) {
    super(question, value, id);
  }

  clone() {
    return new FreeTextControl(this.question, this.value, this.id);
  }

  duplicate() {
    return new FreeTextControl(this.question, this.value);
  }

  toString() {
    return `FreeTextControl<${this.id}>`;
  }

  toJSON() {
    return {
      type: "FreeText",
      question: this.question,
      value: this.value,
    };
  }

  render(onChange: Function, onDelete: Function) {
    return (
      <FreeText freeTextObj={this} onChange={onChange} onDelete={onDelete} />
    );
  }
}

export function FreeText({
  freeTextObj,
  onChange,
  onDelete,
}: {
  freeTextObj: FreeTextControl;
  onChange: Function;
  onDelete: Function;
}) {
  const deleteSelf = () => {
    onDelete(freeTextObj);
  };

  const handleQuestion = (e: React.ChangeEvent<HTMLInputElement>) => {
    const o = freeTextObj.clone();
    o.question = e.target.value;
    onChange(o);
  };

  const handleResponse = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    freeTextObj.value = e.target.value;
  };

  return (
    <div className={checklistStyles.controlContainer}>
      <button
        type="button"
        className="btn"
        onClick={deleteSelf}
        style={{ float: "right" }}
      >
        <ImCross size={16} />
      </button>
      <div>Free Text Response</div>
      <ModuleDivider />

      <div className="form-group">
        <input
          onChange={handleQuestion}
          className="form-control"
          defaultValue={freeTextObj.question}
          placeholder="Enter Question"
        />
      </div>

      <div className="form-group">
        <textarea
          onChange={handleResponse}
          className="form-control"
          disabled
        ></textarea>
      </div>
    </div>
  );
}
