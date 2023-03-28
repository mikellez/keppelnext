import React from 'react';
import { useState } from 'react';
import { CheckControl } from '../../../types/common/classes';
import { ImCross } from "react-icons/im"

import checklistStyles from '../ChecklistTemplateCreator.module.css'
import { ModuleDivider } from '../../ModuleLayout/ModuleDivider';

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
		return `FileUploadControl<${this.id}>`
	}

	toJSON() {
		return {
			"type": "FileUpload",
			"question": this.question,
			"value": this.value
		}
	}

    render(onChange: Function, onDelete: Function) {
		return <FileUpload fileControlObj={this} onChange={onChange} onDelete={onDelete} />
	}
}

export function FileUpload({fileControlObj, onChange, onDelete}: {
	fileControlObj: FileUploadControl
	onChange: Function
	onDelete: Function
}) {

	const deleteSelf = () => {
		onDelete(fileControlObj);
	}

	const handleQuestion = (e: React.ChangeEvent<HTMLInputElement>) => {
		fileControlObj.question = e.target.value;
	}

    const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {

        //TODO
        console.log("yeah")

    }

	return <div className={checklistStyles.controlContainer}>
		<button type="button" className="btn" onClick={deleteSelf} style={{float: "right"}}><ImCross size={16}/></button>
		<div>File Upload</div>
		<ModuleDivider/>

		<div className="form-group">
			<input onChange={handleQuestion} className="form-control" defaultValue={fileControlObj.question} placeholder="Enter Question"/>
		</div>
		
		<div className="form-group">
			<input type="file" onChange={handleFile} className="form-control" disabled/>
		</div>
	</div>;
}