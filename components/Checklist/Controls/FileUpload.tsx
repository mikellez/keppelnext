import React, { useContext } from 'react';
// import { CheckControl } from '../../../types/common/classes';
import { updateSpecificCheck } from '../ChecklistEditableForm';
import CheckControl from '../../../types/common/CheckControl';
import { SectionsContext } from '../../../pages/Checklist/Complete/[id]';

import { ImCross } from "react-icons/im";

import checklistStyles from "../ChecklistTemplateCreator.module.css";
import { ModuleDivider } from "../../ModuleLayout/ModuleDivider";

export class FileUploadControl extends CheckControl {
  constructor(question?: string, value?: string, id?: string) {
    super(question, value, id);
  }

  clone() {
    return new FileUploadControl(this.question, this.value, this.id);
  }

  duplicate() {
    return new FileUploadControl(this.question, this.value);
  }

  toString() {
    return `FileUploadControl<${this.id}>`;
  }

  toJSON() {
    return {
      type: "FileUpload",
      question: this.question,
      value: this.value,
    };
  }

  render(onChange: Function, onDelete: Function) {
		return <FileUpload fileControlObj={this} onChange={onChange} onDelete={onDelete} />
	}

	renderEditableForm(rowId: string, sectionId: string) {
		return <FileUploadEditable fileControlObj={this} rowId={rowId} sectionId={sectionId} />
	}
}

export function FileUpload({
  fileControlObj,
  onChange,
  onDelete,
}: {
  fileControlObj: FileUploadControl;
  onChange: Function;
  onDelete: Function;
}) {
  const deleteSelf = () => {
    onDelete(fileControlObj);
  };

  const handleQuestion = (e: React.ChangeEvent<HTMLInputElement>) => {
    const o = fileControlObj.clone();
    o.question = e.target.value;
    onChange(o);
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    //TODO
    console.log("yeah");
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
      <div>File Upload</div>
      <ModuleDivider />

      <div className="form-group">
        <input
          onChange={handleQuestion}
          className="form-control"
          defaultValue={fileControlObj.question}
          placeholder="Enter Question"
        />
      </div>

		<div className="form-group">
			<input type="file" onChange={handleFile} className="form-control" disabled/>
		</div>
	</div>);
}

function FileUploadEditable({ fileControlObj, rowId, sectionId }: {
	fileControlObj: FileUploadControl,
	rowId: string,
	sectionId: string
}) {

	const { setSections } = useContext(SectionsContext);
	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files && e.target.files.length > 0) {
			addFileToValue(e.target.files[0]);
		} else {
			removeFileFromValue();
		}
	};

	const addFileToValue = (file: File) => {
		const reader = new FileReader();
		reader.readAsDataURL(file);
		reader.onload = () => {
			updateSpecificCheck(sectionId, rowId, fileControlObj.id, reader.result as string, setSections);
			// updateSection(reader.result as string)
		};
	};

	const removeFileFromValue = () => {
		updateSpecificCheck(sectionId, rowId, fileControlObj.id, "", setSections);
		// updateSection("")
	};

	const updateSection = (value: string) => {
		setSections((prevSections) => {
			const newSections = [...prevSections];
			newSections.forEach(section => {
				if (section.id === sectionId) {
					section.updateSection(rowId, fileControlObj.id, value)
				}
			})
			return newSections;
		});
	};
	
	return (
		<div>
			<h6>{fileControlObj.question}</h6>
			<input 
				type="file" 
				name={fileControlObj.id}
				className="form-control"
				onChange={handleChange}
			/>
		</div>
	)
}
