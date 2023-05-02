import formStyles from '../../styles/formStyles.module.css'

import instance from '../../axios.config.js';
import { GetServerSideProps, GetServerSidePropsContext } from 'next';
import Link from 'next/link';
import React, { useEffect, useState } from 'react'
import { ModuleMain, ModuleHeader, ModuleContent, ModuleFooter } from '../../components';
import { MultiFields } from '../../components/Master/MultiField';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import LoadingIcon from '../../components/LoadingIcon';
import router from 'next/router';
import ModuleSimplePopup, { SimpleIcon } from '../../components/ModuleLayout/ModuleSimplePopup';

interface MasterData {
	[column_name: string]: string;
}

interface MasterField {
	column_label: string
	column_name: string
}

interface EditMasterProps {
	name: string;
	editableColumns: MasterField[]
	data: MasterData
}

interface FormValues{
	entries: MasterData;
}

export default function Edit(props: EditMasterProps) {
	const [submissionModal, setSubmissionModal] = useState<boolean>(false);
	
	const {
		register,
		handleSubmit,
		formState,
		control,
		reset,
		getValues
	} = useForm<FormValues>({
		defaultValues: {
			entries: props.data,
		}
	});

	useEffect(() => {
		reset({
			entries: props.data,
		})
	}, [props])

	const { isSubmitting, errors } = formState;
	const urlParams = new URLSearchParams(window.location.search);
	const type = urlParams.get('type');
	const id = urlParams.get('id');
	
	const formSubmit: SubmitHandler<FormValues> = async (data) => {
		console.log(data);
		setSubmissionModal(true);
		return await instance.post(`/api/master/${type}/${id}`, data)
				.then(res => {
					console.log(res.data)

					return res.data;
				})
				.catch(err => {
					console.log(err);
				});
			
	};
	
	return (
		<ModuleMain>
			<form onSubmit={handleSubmit(formSubmit)}>
			<ModuleHeader title="Edit Master" header="Edit Master">
				<Link href="/Master" className="btn btn-secondary">Back</Link>
			</ModuleHeader>

			<ModuleContent includeGreyContainer grid>
				<div className={formStyles.halfContainer}>
					<div className="form-group">
						<label className='form-label'>
							Type
						</label>
						<select className="form-control" id="formControlType" disabled>
							<option>{props.name}</option>
						</select>
					</div>
				</div>

				<Controller
					control={control}
					name="entries"
					render={ ({ field: { onChange, value }, formState: {errors}}) => {
						console.log("form", value)
						return <MultiFields fields={props.editableColumns} values={props.data} onChange={onChange}/>
					}}
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
			</ModuleContent>
			<ModuleSimplePopup
            modalOpenState={submissionModal}
            setModalOpenState={setSubmissionModal}
            title="Success!"
            text="Your entry has been updated!"
            icon={SimpleIcon.Check}
            buttons={
              <button
                onClick={() => {
                  setSubmissionModal(false);
                  router.push("/Master");
                }}
                className="btn btn-primary"
              >
                Ok
              </button>
            }
            onRequestClose={() => {
              router.push("/Master");
            }}
          />
			<ModuleFooter>
				{(errors.entries) && 
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
	console.log(context.query);

	const { type, id } = context.query;

	if(type === undefined || id === undefined)
		return { notFound: true }

	const headers = {
		withCredentials: true,
		headers: {
			Cookie: context.req.headers.cookie
		}
	}

	const masterInfo = await instance.get<any>(`/api/master/` + type + "/" + id, headers);
	console.log(masterInfo.data)
	if(masterInfo.status === 400)
		return { notFound: true }

	let props: EditMasterProps = {
		name: masterInfo.data.name,
		data: masterInfo.data.data,
		editableColumns: masterInfo.data.fields
	}

	return {
		props: props
	}
}