import formStyles from '../../styles/formStyles.module.css'

import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import { ModuleMain, ModuleHeader, ModuleContent, ModuleFooter } from '../../components'

import { Controller, useForm } from 'react-hook-form';
import { FieldErrorsImpl, SubmitHandler } from 'react-hook-form/dist/types';
import { GetServerSideProps, GetServerSidePropsContext } from 'next';
import axios from 'axios';

/*
	FormValues: {
		type: plant
		entries: {
			plant_name: Changi DHCS
			plant_description: Description
		}
	}
*/

type FormValues = {
	type: string;
	entries: MasterSubmission;
}

interface MasterSubmission {
	[column_name: string]: string;
}

interface MasterField {
	column_label: string
	column_name: string
}

interface MasterTables {
	[tableName: string]: {
		internalName: string
		id: string
		name: string
		fields: MasterField[]
	}
}

interface NewMasterEntryProps {
	tables: MasterTables
}

interface FieldProps {
	label: string
	name: string
	onChange: React.ChangeEventHandler<HTMLInputElement>
}

function MultiFields({fields, onChange}: {fields: MasterField[], onChange: Function}) {
	const toProps = (ac: any,a: MasterField) => ({...ac,[a.column_name]:undefined});
	const [entries, setEntries] = useState<MasterSubmission>(fields.reduce(toProps,{}))
	
	useEffect(() => {
		console.log("fields changed", fields, fields.reduce(toProps,{}))
		setEntries(fields.reduce(toProps,{}));

		onChange({
			target: {
				value: fields.reduce(toProps,{})
			}
		});
	}, [fields])

	const getValueOnChange = (e: React.ChangeEvent<HTMLInputElement>, column_name: string) => {
		let newEntries = entries;
		newEntries[column_name] = e.target.value;
		setEntries(newEntries);

		onChange({
			target: {
				value: entries
			}
		});
	}

	return (
		<div className={formStyles.halfContainer}>
			{
				fields.map((f) => {
					return <Field label={f.column_label} name={f.column_name} key={f.column_name} onChange={(e) => {getValueOnChange(e, f.column_name)}} />
				})
			}
		</div>
	)
}

function Field(props: FieldProps) {
	const [value, setValue] = useState<string>("")

	useEffect(() => {
		setValue("");
	}, [props.name])

	return (
		<div className="form-group">
			<label className='form-label'>{props.label}</label>
			<input className="form-control"
				type="text"
				onChange={(e) => {
					setValue(e.target.value)
					props.onChange(e);
				}}
				value={value}
			/>
		</div>
	)
}

export default function New(props: NewMasterEntryProps) {
	const [masterType, setMasterType] = useState<string | null>(null)

	const {
		register,
		handleSubmit,
		formState,
		control,
		getValues
	} = useForm<FormValues>();

	const { isSubmitting, errors } = formState;

	const formSubmit: SubmitHandler<FormValues> = async (data) => {
		console.log(data);
	};

	function changePlant(e : React.ChangeEvent<HTMLSelectElement>) {
		setMasterType(e.target.value);
	};

	return (
		<ModuleMain>
			<form onSubmit={handleSubmit(formSubmit)}>
			<ModuleHeader title="New Master Entry" header="Create New Master Entry">
				<Link href="/Master" className="btn btn-secondary">Back</Link>
			</ModuleHeader>
			<ModuleContent includeGreyContainer grid>

				<div className={formStyles.halfContainer}>
					<div className="form-group">
						<label className='form-label'>
							Type
						</label>
						<select className="form-control" id="formControlType" {...register("type", {required: true, onChange: changePlant})}>
							<option hidden key={0} value={""}>-- Please Select a Type --</option>
							{
								Object.keys(props.tables).map((tableName: string) => {
									return <option key={tableName} value={tableName}>{props.tables[tableName].name}</option>
								})
							}
						</select>
					</div>
				</div>

					{ masterType && //<MultiFields fields={props.tables[masterType].fields} />
						<Controller
							control={control}
							name="entries"
							render={ ({ field: { onChange, value }, formState: {errors}}) => (
								<MultiFields fields={props.tables[masterType].fields} onChange={onChange}/>
							)}
							rules={{
								validate: {
									required: (value) => {
										for(let key in value) {
											if(value[key] === undefined) {
												return "Required"
											}
										}
										
										return true;
									}
								}
							}}
						/>
					}

			</ModuleContent>
			<ModuleFooter>
				{(errors.type || errors.entries) && 
				<span style={{color: "red"}}>Please fill in all required fields</span>}
				<button type="submit" className="btn btn-primary">
				{
					isSubmitting && <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"
					style={{marginRight: "0.5rem"}}/>
				}
				Submit</button>
			</ModuleFooter></form>
		</ModuleMain>
	)
}

export const getServerSideProps: GetServerSideProps = async(context: GetServerSidePropsContext) => {
	const headers = {
		withCredentials: true,
		headers: {
			Cookie: context.req.headers.cookie
		}
	}

	const masterCreateInfo = await axios.get<MasterTables>("http://localhost:3001/api/master/new", headers);

	let props: NewMasterEntryProps = { tables: masterCreateInfo.data }

	return {
		props: props
	}
}
