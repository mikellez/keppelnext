import formStyles from '../../styles/formStyles.module.css'

import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import { ModuleMain, ModuleHeader, ModuleContent, ModuleFooter } from '../../components'

import { Controller, useForm } from 'react-hook-form';
import { FieldErrorsImpl, SubmitHandler } from 'react-hook-form/dist/types';
import { GetServerSideProps, GetServerSidePropsContext } from 'next';
import axios from 'axios';
import LoadingIcon from '../../components/LoadingIcon';
import { CMMSMasterField, CMMSMasterSubmission, CMMSMasterTables } from '../../types/common/interfaces';
import { MultiFields } from '../../components/Master/MultiField';

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
	entries: CMMSMasterSubmission;
}

interface NewMasterEntryProps {
	tables: CMMSMasterTables
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
					isSubmitting && <LoadingIcon/>
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

	const masterCreateInfo = await axios.get<CMMSMasterTables>("http://localhost:3001/api/master/new", headers);

	let props: NewMasterEntryProps = { tables: masterCreateInfo.data }

	return {
		props: props
	}
}
