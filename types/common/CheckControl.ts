import { nanoid } from 'nanoid';

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
	abstract renderEditableForm(onChange: React.ChangeEventHandler): React.ReactNode;

	updateCheck(value: string) {
		this.value = value;
	};
}

export default CheckControl