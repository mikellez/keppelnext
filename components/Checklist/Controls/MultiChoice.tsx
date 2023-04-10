import React, { useContext, useState } from 'react';
// import { CheckControl } from '../../../types/common/classes';
import CheckControl from '../../../types/common/CheckControl';
import { SectionsContext } from '../../../pages/Checklist/Complete/[id]';

import { ImCross } from "react-icons/im";

import checklistStyles from "../ChecklistTemplateCreator.module.css";
import { ModuleDivider } from "../../ModuleLayout/ModuleDivider";

export class MultiChoiceControl extends CheckControl {
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
    return new MultiChoiceControl(
      this.question,
      this.choices,
      this.value,
      this.id
    );
  }

  duplicate() {
    return new MultiChoiceControl(this.question, this.choices, this.value);
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
    };
  }

    render(onChange: Function, onDelete: Function) {
		return <MultiChoice multiChoiceObj={this} onChange={onChange} onDelete={onDelete} />
	}

	renderEditableForm(rowId: string, sectionId: string) {
		return <MultiChoiceEditable multiChoiceObj={this} rowId={rowId} sectionId={sectionId} />
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
    </div>
  );
}

function MultiChoiceEditable ({ multiChoiceObj, rowId, sectionId }: {
	multiChoiceObj: MultiChoiceControl, 
	rowId: string,
	sectionId: string
}) {

	const { setSections } = useContext(SectionsContext);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setSections((prevSections) => {
            const newSections = [...prevSections];
            newSections.forEach(section => {
                if (section.id === sectionId) {
					const currentValue = section.getValue(rowId, multiChoiceObj.id);
					if (e.target.checked) {
						section.updateSection(rowId, multiChoiceObj.id, addEventTargetValue(currentValue, e.target.value));
					} else {
						section.updateSection(rowId, multiChoiceObj.id, removeEventTargetValue(currentValue, e.target.value));
					}	
                }
            })
            return newSections;
        });
	};

	const addEventTargetValue = (current: string, value: string) => {
		if (current.trim().length > 0) {
			return Array.from(new Set((current + ", " + value).split(", "))).join(", ");
		}
		return value;
	};

	const removeEventTargetValue = (current: string, value: string) => {
		return current.split(", ").filter(item => item != value).join(", ");
	};

	return (
		<div>
			<h6>{multiChoiceObj.question}</h6>
			{
				multiChoiceObj.choices.map(choice => {
					return (
						<div key={choice} className="form-check">
							<input 
								type="checkbox"
								value={choice}
								className="form-check-input"
								onChange={handleChange}
								name={multiChoiceObj.id}
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
