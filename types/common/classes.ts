import { nanoid } from 'nanoid';
import { FileUploadControl, FreeTextControl, MultiChoiceControl, SignatureControl, SingleChoice, SingleChoiceControl } from '../../components/Checklist/Controls';

import React from 'react'

// refer to components/Checklist/ChecklistTemplateCreator.tsx README

class ControlFactory {

	static fromJSON(checkObj: any): CheckControl {
		if( typeof checkObj.type !== "string"		||
			typeof checkObj.question !== "string"	|| 
			typeof checkObj.value !== "string"
		)
			throw Error("invalid json string in creating ChecklistControl")
		
		const question: string = checkObj.question;
		const value: string = checkObj.value;
		const type: string = checkObj.type;

		if(type === "SingleChoice")
		{
			if(!Array.isArray(checkObj.choices))
				throw Error("invalid json string in creating ChecklistControl")

			if(!(checkObj.choices as Array<any>).every(c => typeof c === "string" ))
				throw Error("invalid json string in creating ChecklistControl")

			const choices: Array<string> = checkObj.choices;

			return new SingleChoiceControl(question, choices, value);
		}

		if(type === "MultiChoice")
		{
			if(!Array.isArray(checkObj.choices))
				throw Error("invalid json string in creating ChecklistControl")

			if(!(checkObj.choices as Array<any>).every(c => typeof c === "string" ))
				throw Error("invalid json string in creating ChecklistControl")

			const choices: Array<string> = checkObj.choices;

			return new MultiChoiceControl(question, choices, value);
		}

		if(type === "FreeText")
			return new FreeTextControl(question, value);

		if(type === "FileUpload")
			return new FileUploadControl(question, value);

		if(type === "Signature")
			return new SignatureControl(question, value);

		throw Error("invalid type") 
	}
}

abstract class CheckControl {
	question: string;
	value: string;
	id: string;

	constructor(question?: string, value?: string, id?:string) {
		this.question = question !== undefined ? question : "";
		this.value = value !== undefined ? value : "";
		this.id = id !== undefined ? id : nanoid();
	}

	abstract clone(): CheckControl;
	abstract duplicate(): CheckControl;
	abstract toString(): string;
	abstract toJSON(): {
		type: string;
		question: string;
		value: string;
		[key: string]: any;
	};
	abstract render(onChange: Function, onDelete: Function): React.ReactNode;
}

class CheckRow {
	id: string; // id for internal use
	description: string;
	checks: CheckControl[];

	constructor(description?: string, checks?: CheckControl[], id?: string) {
		this.description	= description !== undefined ? description : "";
		this.checks			= checks !== undefined ? checks : [];
		this.id				= id !== undefined ? id : nanoid();
	}

	clone() {
		return new CheckRow(this.description, this.checks, this.id)
	}

	duplicate() { // similar to clone but more deeper and generates a new ID
		return new CheckRow(this.description, this.checks.map(check => check.duplicate()))
	}

	toString() {
		return `CheckRow<${this.id}>`
	}

	toJSON() {
		return {
			"description": this.description,
			"checks": this.checks
		}
	}
}

class CheckSection {
	id: string; // id for internal use
	description: string;
	rows: CheckRow[];

	constructor(description?: string, rows?: CheckRow[], id?: string) {
		this.description	= description !== undefined ? description : "";
		this.rows			= rows !== undefined ? rows : [];
		this.id				= id !== undefined ? id : nanoid();
	}

	clone() {
		return new CheckSection(this.description, this.rows, this.id)
	}

	toString() {
		return `Section<${this.id}>`
	}

	toJSON() {
		return {
			"description": this.description,
			"rows": this.rows
		}
	}

	static fromJSON(jsonStr: string) {
		console.log("string", jsonStr)
		let obj = JSON.parse(jsonStr)

		if(typeof obj.description !== "string" || !Array.isArray(obj.rows))
			throw Error("invalid json string in CheckSection")

		const description: string = obj.description;
		const rows: CheckRow[] = (obj.rows as Array<any>).map((row) => {
			if(typeof row.description !== "string" || !Array.isArray(row.checks))
				throw Error("invalid json string in creating CheckRow")

			const description: string = row.description;
			const checks: CheckControl[] = (row.checks as Array<any>).map((check) => {
				return ControlFactory.fromJSON(check)
			})
			
			return new CheckRow(description, checks)
		})

		return new CheckSection(description, rows)
	}
}

export {
	CheckControl, CheckRow, CheckSection
}