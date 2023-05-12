/*import formStyles from '../../styles/formStyles.module.css'
import React, { useEffect, useState } from 'react'
import { CMMSMasterField, CMMSMasterSubmission, CMMSSystem } from '../../types/common/interfaces'
import instance from '../../axios.config.js'
import { Select } from 'antd'
import { get } from 'http'

interface FieldProps {
	label: string
	name: string
	value?: string
	onChange: React.ChangeEventHandler<HTMLInputElement | HTMLSelectElement>
	system?: CMMSSystem[]
}

interface MultiFieldProps {
	fields: CMMSMasterField[],
	values?: {
		[column_name:string]: string
	}
	onChange: Function
	system?: CMMSSystem[]
}

function Field(props: FieldProps) {
	const [value, setValue] = useState<string>(props.value === undefined ? "" : props.value)

	useEffect(() => {
		console.log("val", value)
	})
	

	if (props.name === "system_id") {
		return (
			<div className="form-group">
				<label className='form-label'>{props.label}</label>
				<select 
					className="form-select"
					onChange={(e) => {
						setValue(e.target.value)
						props.onChange(e)
					}}
					value={value}
				>
					<option hidden>--Select--</option>
					{
						props.system!.map(system => (
							<option key={system.system_id} value={system.system_id}>
								{system.system_name}
							</option>
              			))
					}
				</select>
			</div>
		)
	} else {
		return (
			<div className="form-group">
				<label className='form-label'>{props.label}</label>
				<input className="form-control"
					type="text"
					onChange={(e) => {
						setValue(e.target.value)
						props.onChange(e)
					}}
					value={value}
				/>
			</div>
		)
	}
	
}

export function MultiFields(props: MultiFieldProps) {
	const toProps = (ac: any,a: CMMSMasterField) => ({...ac,[a.column_name]:undefined});
	const [entries, setEntries] = useState<CMMSMasterSubmission>(props.values === undefined ? props.fields.reduce(toProps,{}) : props.values )
	const [isLoading, setIsLoading] = useState<boolean>(false)
	const [values, setValues] = useState(null)
	

	useEffect(() => {
		const newEntries = props.values === undefined ? props.fields.reduce(toProps,{}) : props.values;
		console.log("fields changed", props.fields, newEntries)
		setEntries(newEntries);

		props.onChange({
			target: {
				value: newEntries
			}
		});
	}, [props.fields])

	console.log(entries)

	const getValueOnChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>, column_name: string) => {
		let newEntries = entries;
		newEntries[column_name] = e.target.value;
		setEntries(newEntries);

		props.onChange({
			target: {
				value: entries
			}
		});
	}
	async function getDropdownValues(url: string, value: string, options: string) {
		// setIsLoading(true)
		const res = await instance.get(url)
		const data = res.data
		const dropdownValues = data.map((d: any) => {
			return {
				value: d[value],
				label: d[options]
			}
		}
		)
		// setValues(dropdownValues)
		// setIsLoading(false)
		return dropdownValues
	}

	if (isLoading) {
		return <p>Loading...</p>
	}

	const [fieldE, setFieldE] = useState<JSX.Element[]>([])
	
	const toJSX = async (fields: any) => {

		const dropdowns = await Promise.all(fields.map(async(f: any) => {
			if (f.type == "dropdown") return await getDropdownValues(f.url!, f.value, f.options);
		}))

		return fields.map((f:any, i:any) => {
			let v: string | undefined = undefined;
			if(props.values !== undefined) v = props.values[f.column_name];

			if (dropdowns[i]) {
				return (
					<div className="form-group">
				<label className='form-label'>{f.column_label}</label>

					<select className="form-select" 
					onChange={(e) => {
						getValueOnChange(e, f.column_name);
						// console.log("e", e.target.value)
						}} >
						<option hidden>--Select--</option>
						{
							dropdowns[i].map((d) => {
								return <option value={d.value} key={d.value}>{d.label}</option>
							})
						}
					</select>
				</div>
				)
			}

			return (
				<Field 
					label={f.column_label} 
					name={f.column_name} 
					value={v} 
					key={f.column_name} 
					onChange={(e) => {getValueOnChange(e, f.column_name)}} 
					system={props.system}
				/>
			)
		})
	}

	useEffect(() => {
		toJSX(props.fields).then((jsx) => setFieldE(jsx))
		
	}, [props.fields])

	return (
		<div className={formStyles.halfContainer}>
			{fieldE && fieldE}
		</div>
	)
}






*/