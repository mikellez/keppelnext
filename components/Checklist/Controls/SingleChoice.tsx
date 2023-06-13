import React, { useState, useContext } from 'react';
import { SectionsContext } from '../../../pages/Checklist/Complete/[id]';
import { updateSpecificCheck } from '../ChecklistEditableForm';
import CheckControl from "../../../types/common/CheckControl";
import { ImCross } from "react-icons/im";
import checklistStyles from "../ChecklistTemplateCreator.module.css";
import { ModuleDivider } from "../../ModuleLayout/ModuleDivider";
import styles from "../../../styles/Checklist.module.scss";

export class SingleChoiceControl extends CheckControl {
  choices: string[];

  constructor(
    question?: string,
    choices?: string[],
    value?: string,
    id?: string
  ) {
    super(question, value, id);
    this.choices = choices !== undefined ? choices.slice() : [];
  }

  clone() {
    return new SingleChoiceControl(
      this.question,
      this.choices,
      this.value,
      this.id
    );
  }

  duplicate() {
    return new SingleChoiceControl(this.question, this.choices, this.value);
  }

  toString() {
    return `SingleChoiceControl<${this.id}>`;
  }

  toJSON() {
    return {
      type: "SingleChoice",
      question: this.question,
      value: this.value,
      choices: this.choices,
    };
  }

	render(onChange: Function, onDelete: Function) {
		return <SingleChoice singleChoiceObj={this} onChange={onChange} onDelete={onDelete} />
	}

	renderEditableForm(rowId: string, sectionId: string) {
		return <SingleChoiceEditable singleChoiceObj={this} rowId={rowId} sectionId={sectionId} />
	}
  // renderReassignedEditableForm(rowId: string, sectionId: string) {
	// 	return <SingleChoiceReassignedEditable singleChoiceObj={this} rowId={rowId} sectionId={sectionId} />
	// }
  
  renderViewOnlyForm() {
    return <SingleChoiceView singleChoiceObj={this} />
  }

}

function Choice({
  choice,
  onChange,
  onDelete,
}: {
  choice: string;
  onChange: Function;
  onDelete: Function;
}) {
  const [hovered, setHovered] = useState<boolean>(false);

  const onHover = () => {
    setHovered(true);
  };

  const onLeave = () => {
    setHovered(false);
  };

  const deleteSelf = () => {
    onDelete(choice);
  };

  return (
    <div className="form-check" onMouseOver={onHover} onMouseOut={onLeave}>
      <input className="form-check-input" type="radio" disabled />
      <label className="form-check-label">{choice}</label>
      {hovered && (
        <ImCross
          color="#666666"
          onClick={deleteSelf}
          className={checklistStyles.controlRemoveChoiceButton}
          size={12}
        />
      )}
    </div>
  );
};

export function SingleChoice({
  singleChoiceObj,
  onChange,
  onDelete,
}: {
  singleChoiceObj: SingleChoiceControl;
  onChange: Function;
  onDelete: Function;
}) {
  const [newChoice, setNewChoice] = useState<string>("");

  const updateChoiceInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewChoice(e.target.value);
  };

  const handleAddKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") addChoice();
  };

  const deleteSelf = () => {
    onDelete(singleChoiceObj);
  };

  const addChoice = () => {
    const o = singleChoiceObj.clone();
    const choice = newChoice;

    // check if text is filled
    if (choice.length === 0) return;

    // check if option is already in
    if (o.choices.includes(choice)) return;

    o.choices.push(choice);
    onChange(o);
    setNewChoice("");
  };

  const deleteChoice = (c: string) => {
    const o = singleChoiceObj.clone();
    let i = o.choices.findIndex((v) => v === c);
    o.choices.splice(i, 1);
    onChange(o);
  };

  const handleQuestion = (e: React.ChangeEvent<HTMLInputElement>) => {
    const o = singleChoiceObj.clone();
    o.question = e.target.value;
    onChange(o);
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
      <div>Single Choice</div>
      <ModuleDivider />

      <div className="form-group">
        <input
          onChange={handleQuestion}
          className="form-control"
          defaultValue={singleChoiceObj.question}
          placeholder="Enter Question"
        />
      </div>

      <div className="form-group">
        {singleChoiceObj.choices.map((c) => {
          return (
            <Choice
              key={c}
              choice={c}
              onChange={() => {}}
              onDelete={deleteChoice}
            />
          );
        })}
      </div>

      <div className="form-group">
        <div className="input-group">
          <button type="button" onClick={addChoice} className="btn btn-primary">
            Add
          </button>
          <input
            onChange={updateChoiceInput}
            onKeyDown={handleAddKeyDown}
            className="form-control"
            placeholder="Enter Other Options"
            value={newChoice}
          />
        </div>
      </div>
    </div>
  );
};

function SingleChoiceEditable({ singleChoiceObj, rowId, sectionId }: { 
	singleChoiceObj: SingleChoiceControl,
	rowId: string,
	sectionId: string
}) {

	const { setSections } = useContext(SectionsContext);
	
	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		updateSpecificCheck(sectionId, rowId, singleChoiceObj.id, e.target.value, setSections)
	}

	return (
		<div className={styles.checkViewContainer}>
			<h6>{singleChoiceObj.question}</h6>
			{
				singleChoiceObj.choices.map(choice => {
					return (
						<div key={choice} className="form-check">
							<input 
								type="radio"
								value={choice}
								name={singleChoiceObj.id}
								className="form-check-input"
								onChange={handleChange}
                checked={choice === singleChoiceObj.value}
							/>
							<label className="form-check-label">
								{choice}
							</label>
						</div>
					)
				})
			}
		</div>
	);
};

function SingleChoiceView({singleChoiceObj}: {singleChoiceObj: SingleChoiceControl}) {
  return (
    <div className={styles.checkViewContainer}>
      <h6>{singleChoiceObj.question}</h6>
      {
				singleChoiceObj.choices.map(choice => {
					return (
						<div key={choice} className="form-check">
							<input 
								type="radio"
								className="form-check-input"
								disabled
                checked={choice === singleChoiceObj.value}
							/>
							<label className="form-check-label">
								{choice}
							</label>
						</div>
					)
				})
			}
    </div>
  );
};


// function SingleChoiceReassignedEditable({ singleChoiceObj, rowId, sectionId }: { 
// 	singleChoiceObj: SingleChoiceControl,
// 	rowId: string,
// 	sectionId: string
// }) {

// 	const { setSections } = useContext(SectionsContext);
	
// 	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
// 		updateSpecificCheck(sectionId, rowId, singleChoiceObj.id, e.target.value, setSections)
// 	}

// 	return (
// 		<div className={styles.checkViewContainer}>
// 			<h6>{singleChoiceObj.question}</h6>
// 			{
// 				singleChoiceObj.choices.map(choice => {
// 					return (
// 						<div key={choice} className="form-check">
// 							<input 
// 								type="radio"
// 								value={choice}
// 								name={singleChoiceObj.id}
// 								className="form-check-input"
// 								onChange={handleChange}
//                 checked={choice === singleChoiceObj.value}
// 							/>
// 							<label className="form-check-label">
// 								{choice}
// 							</label>
// 						</div>
// 					)
// 				})
// 			}
// 		</div>
// 	);
// };
