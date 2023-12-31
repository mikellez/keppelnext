import React, { useContext, useEffect, useState } from "react";
import { ImCross } from "react-icons/im";
import { SectionsContext } from "../../../pages/Checklist/Complete/[id]";
import styles from "../../../styles/Checklist.module.scss";
import CheckControl from "../../../types/common/CheckControl";
import { ModuleDivider } from "../../ModuleLayout/ModuleDivider";
import RequiredIcon from "../../RequiredIcon";
import ToggleSwitch from "../../ToggleSwitch/ToggleSwitch";
import checklistStyles from "../ChecklistTemplateCreator.module.css";

export class MultiChoiceControl extends CheckControl {
  choices: string[];
  constructor(
    question?: string,
    choices?: string[],
    value?: string,
    required?: boolean,
    id?: string
  ) {
    super(question, value, id, required);
    this.choices = choices !== undefined ? choices.slice() : [];
  }

  clone() {
    return new MultiChoiceControl(
      this.question,
      this.choices,
      this.value,
      this.required,
      this.id
    );
  }

  duplicate() {
    return new MultiChoiceControl(this.question, this.choices, this.value, this.required);
  }

  toString() {
    return `MultiChoiceControl<${this.id}>`;
  }

  toJSON() {
    return {
      type: "MultiChoice",
      question: this.question,
      value: this.value,
      choices: this.choices,
      required: this.required,
    };
  }

  render(onChange: Function, onDelete: Function) {
    return (
      <MultiChoice
        multiChoiceObj={this}
        onChange={onChange}
        onDelete={onDelete}
      />
    );
  }

  renderEditableForm(rowId: string, sectionId: string, index: number) {
    return (
      <MultiChoiceEditable
        multiChoiceObj={this}
        rowId={rowId}
        sectionId={sectionId}
        index={index}
      />
    );
  }
  // renderReassignedEditableForm(rowId: string, sectionId: string) {
  // 	return <MultiReassignedChoiceEditable multiChoiceObj={this} rowId={rowId} sectionId={sectionId} />
  // }

  renderViewOnlyForm() {
    return <MultiChoiceView multiChoiceObj={this} />;
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
      <input className="form-check-input" type="checkbox" disabled />
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
}

export function MultiChoice({
  multiChoiceObj,
  onChange,
  onDelete,
}: {
  multiChoiceObj: MultiChoiceControl;
  onChange: Function;
  onDelete: Function;
}) {
  const [newChoice, setNewChoice] = useState<string>("");
  const [isRequired, setIsRequired] = useState<boolean>(false);

  const updateChoiceInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewChoice(e.target.value);
  };

  const handleAddKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") addChoice();
  };

  const deleteSelf = () => {
    onDelete(multiChoiceObj);
  };

  const addChoice = () => {
    const o = multiChoiceObj.clone();
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
    const o = multiChoiceObj.clone();
    let i = o.choices.findIndex((v) => v === c);
    o.choices.splice(i, 1);
    onChange(o);
  };

  const handleQuestion = (e: React.ChangeEvent<HTMLInputElement>) => {
    const o = multiChoiceObj.clone();
    o.question = e.target.value;
    onChange(o);
  };

  const handleRequired = () => {
    setIsRequired(!isRequired);
  }

  useEffect(() => {
    const retrievedIsRequired = multiChoiceObj.required;
    setIsRequired(retrievedIsRequired);
  }, []);
  
  useEffect (() => {
    // console.log(isRequired);
    const o = multiChoiceObj.clone();
    o.required = isRequired;
    onChange(o);

  },[isRequired])

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
      <div>Multi Choice</div>
      <ModuleDivider />

      <div className="form-group">
        <input
          onChange={handleQuestion}
          className="form-control"
          defaultValue={multiChoiceObj.question}
          placeholder="Enter Question"
        />
      </div>

      <div className="form-group">
        {multiChoiceObj.choices.map((c) => {
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
      <div style={{display: "flex", alignItems:"center", gap:"10px", justifyContent:"flex-end"}}>
        <div>Required</div>
        <ToggleSwitch 
          isSelected = {isRequired}
          onChange = {handleRequired}
        />
      </div>
    </div>
  );
}

function MultiChoiceEditable({
  multiChoiceObj,
  rowId,
  sectionId,
  index,
}: {
  multiChoiceObj: MultiChoiceControl;
  rowId: string;
  sectionId: string;
  index: number;
}) {
  const { setSections } = useContext(SectionsContext);
  // console.log(multiChoiceObj)
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSections((prevSections) => {
      const newSections = [...prevSections];
      newSections.forEach((section) => {
        if (section.id === sectionId) {
          const currentValue = section.getValue(rowId, multiChoiceObj.id);
          if (e.target.checked) {
            section.updateSection(
              rowId,
              multiChoiceObj.id,
              addEventTargetValue(currentValue, e.target.value)
            );
          } else {
            section.updateSection(
              rowId,
              multiChoiceObj.id,
              removeEventTargetValue(currentValue, e.target.value)
            );
          }
        }
      });
      return newSections;
    });
  };

  const addEventTargetValue = (current: string, value: string) => {
    if (current.trim().length > 0) {
      return Array.from(new Set((current + "," + value).split(","))).join(",");
    }
    return value;
  };

  const removeEventTargetValue = (current: string, value: string) => {
    return current
      .split(",")
      .filter((item) => item != value)
      .join(",");
  };

  return (
    <div className={styles.checkViewContainer}>
      <h6>
        {multiChoiceObj.required === true ? <RequiredIcon />: null}&nbsp;
        { multiChoiceObj.question}
      </h6>
      {multiChoiceObj.choices.map((choice) => {
        return (
          <div key={choice} className="form-check">
            <input
              type="checkbox"
              value={choice}
              className="form-check-input"
              onChange={handleChange}
              name={multiChoiceObj.id}
              checked={multiChoiceObj.value.split(",").includes(choice)}
            />
            <label className="form-check-label">{choice}</label>
          </div>
        );
      })}
    </div>
  );
}

function MultiChoiceView({
  multiChoiceObj,
}: {
  multiChoiceObj: MultiChoiceControl;
}) {
  return (
    <div className={styles.checkViewContainer}>
      <h6>
        {multiChoiceObj.required === true ? <RequiredIcon />: null}&nbsp;
        { multiChoiceObj.question}
      </h6>
      {multiChoiceObj.choices.map((choice) => {
        return (
          <div key={choice} className="form-check">
            <input
              type="checkbox"
              className="form-check-input"
              disabled
              checked={multiChoiceObj.value.split(",").includes(choice)}
            />
            <label className="form-check-label">{choice}</label>
          </div>
        );
      })}
    </div>
  );
}

// function MultiReassignedChoiceEditable ({ multiChoiceObj, rowId, sectionId }: {
// 	multiChoiceObj: MultiChoiceControl,
// 	rowId: string,
// 	sectionId: string
// }) {

// 	const { setSections } = useContext(SectionsContext);

// 	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
// 		setSections((prevSections) => {
//             const newSections = [...prevSections];
//             newSections.forEach(section => {
//                 if (section.id === sectionId) {
// 					const currentValue = section.getValue(rowId, multiChoiceObj.id);
// 					if (e.target.checked) {
// 						section.updateSection(rowId, multiChoiceObj.id, addEventTargetValue(currentValue, e.target.value));
// 					} else {
// 						section.updateSection(rowId, multiChoiceObj.id, removeEventTargetValue(currentValue, e.target.value));
// 					}
//                 }
//             })
//             return newSections;
//         });
// 	};

// 	const addEventTargetValue = (current: string, value: string) => {
// 		if (current.trim().length > 0) {
// 			return Array.from(new Set((current + "," + value).split(","))).join(",");
// 		}
// 		return value;
// 	};

// 	const removeEventTargetValue = (current: string, value: string) => {
// 		return current.split(",").filter(item => item != value).join(",");
// 	};

// 	return (
// 		<div className={styles.checkViewContainer}>
// 			<h6>{multiChoiceObj.question}</h6>
// 			{
// 				multiChoiceObj.choices.map(choice => {
// 					return (
// 						<div key={choice} className="form-check">
// 							<input
// 								type="checkbox"
// 								value={choice}
// 								className="form-check-input"
// 								onChange={handleChange}
// 								name={multiChoiceObj.id}
//                 checked={multiChoiceObj.value.split(",").includes(choice)}
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
