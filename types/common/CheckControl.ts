import { nanoid } from 'nanoid';

abstract class CheckControl {
	question: string;
	value: string;
	id: string;
	required: boolean;

	constructor(question?: string, value?: string, id?:string, required?: boolean) {
		this.question = question !== undefined ? question : "";
		this.value = value !== undefined ? value : "";
		this.id = id !== undefined ? id : nanoid();
		this.required = required !== undefined ? required : false;
	}

	abstract clone(): CheckControl;
	abstract duplicate(): CheckControl;
	abstract toString(): string;
	abstract toJSON(): {
		type: string;
		question: string;
		value: string;
		[key: string]: any;
		required: boolean;
	};
	abstract render(onChange: Function, onDelete: Function): React.ReactNode;
	abstract renderEditableForm(rowId: string, sectionId: string): React.ReactNode;
	// abstract renderReassignedEditableForm(rowId: string, sectionId: string): React.ReactNode;
	abstract renderViewOnlyForm(): React.ReactNode;

	updateCheck(value: string) {
		this.value = value;
	};
}

export default CheckControl