import React, { useContext } from 'react';
import CheckControl from '../../../types/common/CheckControl';
import { SectionsContext } from '../../../pages/Checklist/Complete/[id]';
import { updateSpecificCheck } from '../ChecklistEditableForm';
import styles from "../../../styles/Checklist.module.scss";


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
		return <FreeText freeTextObj={this} onChange={onChange} onDelete={onDelete} />
	}

	renderEditableForm(rowId: string, sectionId: string, index: number) {
		return <FreeTextEditable freeTextObj={this} rowId={rowId} sectionId={sectionId} index={index} />
	}
  
  // renderReassignedEditableForm(rowId: string, sectionId: string) {
	// 	return <FreeTextReassignedEditable freeTextObj={this} rowId={rowId} sectionId={sectionId} />
	// }
  renderViewOnlyForm() {
    return <FreeTextView freeTextObj={this} />
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
			<textarea onChange={handleResponse} className="form-control" disabled></textarea>
		</div>
	</div>
  );
};

function FreeTextEditable({ freeTextObj, rowId, sectionId, index }: {
	freeTextObj: FreeTextControl,
	rowId: string,
	sectionId: string,
  index: number
}) {

	const { setSections } = useContext(SectionsContext);
	
	const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		updateSpecificCheck(sectionId, rowId, freeTextObj.id, e.target.value, setSections)
	};
  
	return (
		<div className={styles.checkViewContainer}>
			<h6>{index}. {freeTextObj.question}</h6>
			<textarea 
        className="form-control" 
        onChange={handleChange}
        style={{resize: "none"}}
        value = {freeTextObj.value}
      ></textarea>
		</div>
	)
};

function FreeTextView({freeTextObj}: {freeTextObj: FreeTextControl}) {
  return (
    <div className={styles.checkViewContainer}>
      <h6>{freeTextObj.question}</h6>
      <p>{freeTextObj.value}</p>
    </div>
  )
}

// function FreeTextReassignedEditable({ freeTextObj, rowId, sectionId }: {
// 	freeTextObj: FreeTextControl,
// 	rowId: string,
// 	sectionId: string
// }) {

// 	const { setSections } = useContext(SectionsContext);
	
// 	const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
// 		updateSpecificCheck(sectionId, rowId, freeTextObj.id, e.target.value, setSections)
// 	};

// 	return (
// 		<div className={styles.checkViewContainer}>
// 			<h6>{freeTextObj.question}</h6>
// 			<textarea 
//         className="form-control" 
//         onChange={handleChange}
//         style={{resize: "none"}}
//         value = {freeTextObj.value}
//       ></textarea>
// 		</div>
// 	)
// };



