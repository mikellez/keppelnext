import checklistStyles from './ChecklistTemplateCreator.module.css'

import React, { useEffect, useState } from "react"
import useComponentVisible from "../TopBar/useComponentVisible";

import { BsTrash } from "react-icons/bs"
import { AiOutlinePlus } from "react-icons/ai"
import { FaRegCopy } from "react-icons/fa"

import { FileUploadControl, FreeTextControl, MultiChoiceControl, SignatureControl, SingleChoiceControl } from './Controls';
import { CheckControl, CheckRow, CheckSection } from "../../types/common/classes"

/*
    --- --- --- --- --- --- READ ME --- --- --- --- --- --- ---
    
    some explanation before diving into this file
    
    this component contains three classes
    + CheckControl     - Abstract class that defines the
                         handles for each control. The control
                         can be any object that extends from
                         CheckControl. Refer to
                         [[Controls/index.tsx]] for more info.
    + CheckRow         - Handles a collection of CheckControl
                         objects and description of Checks
                         through this.checks and
                         this.description respectively
    + CheckSection     - Handles a collection of CheckRow
                         objects and description of CheckRows
                         through this.rows and this.description
                         respectively

    each of these classes also contains a clone() method. this
    method should be used to clone the object, then mutating
    the cloned object before setting state as React dislikes
    direct state mutation.

    a duplicate() method may also be defined in the class. this
    should be used when the user wants to duplicate a CheckRow.
    this is because duplicate() does not copy IDs and instead
    generates a new one, unlike clone() which copies the entire
    object

    methods for serialization (and deserialization for
    CheckSection) are also included, which will be elaborated
    later on.
    
    to help with tracking objects throughout the app, each
    class contains the string this.id, generated with nanoID.
    The ID should only be used for internal use and never be
    stored anywhere else (e.g. Database should not contain the
    ID of each individual object, only the checklist itself)
    
    nanoID promises a similar collision probability compared
    to UUID v4:
    "For there to be a one in a billion chance of duplication,
    103 trillion version 4 IDs must be generated"

    collisions are not handled in the extremely unlikely event
    where nanoid does generate one. if this were to occur, a cry
    to god for mercy may not be necessary, but would be helpful

    serializing the CheckSection object (and its array) is easy
    with JSON.stringify(CheckSection | CheckSection[]). the ID
    will NOT be included in the serialization.

    deserializing a JSON formatted string to CheckSection is
    also simple with static method CheckSection.fromJSON(string).
    an error would be thrown if the deserialization fails.
    a new ID would be generated for the objects that require it,
    so a CheckSection that has been serialized, then deserialized
    would differ from its original CheckSection
    
    there are also four React components that are responsible
    for rendering the app
    + ChecklistChecks             - Handles Checks
    + ChecklistCheckRow           - Handles CheckRow
    + ChecklistSection            - Handles CheckSections
    + ChecklistTemplateCreator    - Main exported component

    full sections array would be as follows
	sections: CheckSection[
		{
			id: string
			description: string
			rows: CheckRow[
				{
					id: string
					description: string
					checks: CheckControl[
						{
							"type": string,
							"question": string,
							"value": string,
							[key: string]: any
						}
					]
				}
			]
		}
	]

    --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
*/

function ChecklistChecks(
	{
		checks,			// check objects
		onChange,		// change handler
		onDelete,		// delete self handler
	}: {checks: CheckControl[], onChange: Function, onDelete?: Function}
) {
    const { ref, isComponentVisible, setIsComponentVisible } = useComponentVisible(false);

	// TODO: consolidate all this into one function
	// i was lazy but this is getting a bit too much
	// ----------------------------------------

	const addCheck = () => {
		let c = [...checks]; // clone checks
		c.push(new SingleChoiceControl("", ["Yes", "No"]));
		onChange(c);
	}

	const addMulti = () => {
		let c = [...checks]; // clone checks
		c.push(new MultiChoiceControl("", []));
		onChange(c);
	}

	const addFree = () => {
		let c = [...checks]; // clone checks
		c.push(new FreeTextControl());
		onChange(c);
	}

	const addUpload = () => {
		let c = [...checks]; // clone checks
		c.push(new FileUploadControl());
		onChange(c);
	}

	const addSig = () => {
		let c = [...checks]; // clone checks
		c.push(new SignatureControl());
		onChange(c);
	}

	// ----------------------------------------

	const handleCheck = (check: CheckControl) => {
		let c = [...checks];
		let i = c.findIndex(v => v.id === check.id)
		c[i] = check; // replace old check with new
		onChange(c);
	}

	const deleteCheck = (check: CheckControl) => {
		let c = [...checks];
		let i = c.findIndex(v => v.id === check.id)
		c.splice(i, 1);
		onChange(c);
	}

	return (
		<div className={checklistStyles.checkObjs}>
			{
				checks.map(check => <React.Fragment key={check.id}>{check.render(handleCheck, deleteCheck)}</React.Fragment>)
			}

			<div ref={ref} className="input-group" style={{justifyContent: "center"}}>
				<button type="button" onClick={addCheck} className="btn btn-sm btn-outline-secondary">Add Check</button>
				<button type="button" onClick={addMulti} className="btn btn-sm btn-outline-secondary">Add Multi</button>
				<button type="button" onClick={addFree} className="btn btn-sm btn-outline-secondary">Add Free</button>
				<button type="button" onClick={addUpload} className="btn btn-sm btn-outline-secondary">Add File Upload</button>
				<button type="button" onClick={addSig} className="btn btn-sm btn-outline-secondary">Add Signature</button>
			</div>

			{
				isComponentVisible &&
				<div className={checklistStyles.checkDropdown} onClick={addCheck}>asd</div>
			}
		</div>
	)
}

function ChecklistCheckRow(
	{
		row,			// row object
		onChange,		// change handler
		onDuplicate,	// duplicate self handler
		onDelete,		// delete self handler
		SN				// number in checklist
	}: {row: CheckRow, onChange: Function, onDuplicate: Function, onDelete: Function, SN: number})
{

	const [isHover, setHover] = useState<boolean>(false)

	const deleteSelf = () => {
		onDelete(row);
	}

	const duplicateSelf = () => {
		onDuplicate(row);
	}

	const handleText = (e: React.ChangeEvent<HTMLInputElement>) => {
		row.description = e.target.value; // dangerous
	}

	const handleChecks = (checks: CheckControl[]) => {
		let r = row.clone();
		/*let i = r.checks.findIndex(v => v.id === check.id)

		r.checks[i] = check;*/

		r.checks = checks;
		// console.log("handleCheck")
		onChange(r);
	}

	return <tr
			onMouseOver={() => setHover(true)}
			onMouseLeave={() => setHover(false)}
			className={isHover ? checklistStyles.checklistHighlight : undefined}
	>
		<td>{SN}</td>
		<td>
			<input type={"text"} defaultValue={row.description} placeholder={"Check Description"} className="form-control" style={{border: "none"}} onChange={handleText}></input>
		</td>
		<td>
			<ChecklistChecks checks={row.checks} onChange={handleChecks}/>
		</td>
		<td>
			<button type="button" className="btn" title="Delete Row" onClick={deleteSelf}>
				<BsTrash size={26}/>
			</button>
			<button type="button" className="btn" title="Duplicate Row" onClick={duplicateSelf}>
				<FaRegCopy size={26}/>
			</button>
		</td>
	</tr>
}

function ChecklistSection(
	{
		section,		// section object
		onChange,		// change handler
		onDelete		// delete self handler
	}: {section: CheckSection, onChange: Function, onDelete: Function})
{

	const addRow = () => {
		let s = section.clone();
		s.rows.push(new CheckRow())

		onChange(s);
	}

	const duplicateRow = (row: CheckRow) => {
		let s = section.clone();
		let i = s.rows.findIndex(v => v.id === row.id)

		s.rows.splice(i+1, 0, row.duplicate());
		onChange(s);
	}

	const deleteRow = (row: CheckRow) => {
		let s = section.clone();
		s.rows = s.rows.filter(v =>  v.id !== row.id)

		onChange(s);
	}

	const handleText = (e: React.ChangeEvent<HTMLInputElement>) => {
		section.description = e.target.value; // dangerous
		/*
		// valid
		let s = section.clone();
		s.description = e.target.value;
		onChange(s);*/
	}

	const handleRow = (row: CheckRow) => {
		let s = section.clone();
		let i = 0;

		s.rows.filter((value, index) => {
			if(value.id === row.id)
			{
				i = index;
				return true;
			}
			return false;
		})[0];

		s.rows[i] = row;

		onChange(s);
	}

	const deleteSelf = () => {
		onDelete(section);
	}

	return (<>
		<tr>
			<td/>
			<td colSpan={2}>
				<input type={"text"} placeholder={"Section Name"} className="form-control" style={{border: "none"}} onChange={handleText}></input>
			</td>
			<td>
				<button type="button" className="btn" title="Delete Entire Section" onClick={deleteSelf}>
					<BsTrash size={26}/>
				</button>
				<button type="button" className="btn" title="Add Row" onClick={addRow}>
					<AiOutlinePlus size={26}/>
				</button>
			</td>
		</tr>

		{
			section.rows.map((row, index) => {
				return <ChecklistCheckRow key={row.id} row={row} SN={index+1} onChange={handleRow} onDuplicate={duplicateRow} onDelete={deleteRow}/>
			})
		}
	</>)
}

export default function ChecklistTemplateCreator({ sections, setSections }: {
	sections: CheckSection[],
	setSections: React.Dispatch<React.SetStateAction<CheckSection[]>>
}) {

	const addSection = () => {
		setSections((sections) => [...sections, new CheckSection()])
	}

	const deleteSection = (s: CheckSection) => {
		setSections(() => {
			return sections.filter((value) => value.id !== s.id)
		})
	}

	const handleSectionEdit = (section: CheckSection) => {
		let i = 0;
		let s = [...sections];
		sections.filter((value, index) => {
			if(value.id === section.id)
			{
				i = index;
				return true;
			}
			return false;
		})[0];

		s[i] = section;

		setSections(s);
	}

	/*useEffect(() => {
		let ix = setInterval(() => {
			console.log(sections);
		}, 3000)

		return () => clearInterval(ix);
	}, [sections])*/

	useEffect(() => {
		if(sections.length < 1)
			return

		// console.log(CheckSection.fromJSON(JSON.stringify(sections[0])))
		// console.log(JSON.stringify(CheckSection.fromJSON(JSON.stringify(sections[0]))))
	}, [sections])

	return (<>
		<table className="table">
			<colgroup>
				<col style={{width:"50px"}}/>
				<col style={{width:"calc((40% - 250px) / 2)"}}/>
				<col style={{width:"40%"}}/>
				<col style={{width:"200px"}}/>
			</colgroup>  
			<thead>
				<tr>
					<th>SN</th>
					<th>Description</th>
					<th>Checks</th>
					<th>Actions</th>
				</tr>
			</thead>
			<tbody className={checklistStyles.checklistLowlight}>
				{
					sections.map((sect, index) => {
						return <ChecklistSection
							key={sect.id}
							section={sect}
							onChange={handleSectionEdit}
							onDelete={deleteSection}
						/>
					})
				}
				<tr>
					<td/><td/><td/>
					<td>
						<button type="button" onClick={addSection} className="btn btn-secondary">Add Section</button>
					</td>
				</tr>
			</tbody>
		</table>
		{/* <textarea value={JSON.stringify(sections, undefined, 4)} rows={16} style={{width: "100%"}}/> */}
		</>
	);
}