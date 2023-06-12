import formStyles from '../../styles/formStyles.module.css'

import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import { ModuleMain, ModuleHeader, ModuleContent, ModuleFooter } from '../../components'

import { Controller, useForm } from 'react-hook-form';
import { FieldErrorsImpl, SubmitHandler } from 'react-hook-form/dist/types';
import { GetServerSideProps, GetServerSidePropsContext } from 'next';
import instance from '../../types/common/axios.config';
import LoadingIcon from '../../components/LoadingIcon';
import { CMMSMasterField, CMMSMasterSubmission, CMMSMasterTables, CMMSPlant, CMMSSystem } from '../../types/common/interfaces';
import { MultiFields } from '../../components/Master/MultiField';
import ModuleSimplePopup, { SimpleIcon } from '../../components/ModuleLayout/ModuleSimplePopup';
import router from 'next/router';

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
	systems: CMMSSystem[]
	plants: CMMSPlant[]
}

export default function New(props: NewMasterEntryProps) {
	console.log(props.plants);
	const [masterType, setMasterType] = useState<string | null>(null)
	const [isMissingDetailsModalOpen, setIsMissingDetailsModaOpen] =
    useState<boolean>(true);
	const [isMissingDetailsModalOpen2, setIsMissingDetailsModaOpen2] =
    useState<boolean>(false);
	const [submissionModal, setSubmissionModal] = useState<boolean>(false);
	const [isNotValid, setIsNotValid] = useState<boolean>(false);


	const {
		register,
		handleSubmit,
		formState,
		control,
		getValues,
		clearErrors
	} = useForm<FormValues>();

	const { isSubmitting, errors } = formState;

	const formSubmit: SubmitHandler<FormValues> = async (data) => {
		// console.log(data);
		const values = Object.values(data["entries"]);
		if (values.includes("")){
			setIsMissingDetailsModaOpen2(true);
		}
		else{
			return await instance.post("/api/master/new/add", data)
				.then(res => {
					console.log(res.data)
					setSubmissionModal(true)
					return res.data;
				})
				.catch(err => {
					console.log(err);
					console.log(err.response.data.table);
					if (err.response.data.table === "system_assets"){
						setIsNotValid(true);
					}
				});
			
		}

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
								<MultiFields fields={props.tables[masterType].fields} onChange={onChange} system={props.systems}/>
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
				{(errors.type || errors.entries || isMissingDetailsModalOpen2) &&
				<ModuleSimplePopup
				modalOpenState={isMissingDetailsModalOpen}
				setModalOpenState={setIsMissingDetailsModaOpen}
				title="Missing Details"
				text="Please ensure that you have filled in all the required entries."
				icon={SimpleIcon.Cross}
				shouldCloseOnOverlayClick={true}
				onRequestClose={() => {
					// clearErrors();
					// setIsMissingDetailsModaOpen(false)
					router.reload();

				}}
			  />}
			  {/* <ModuleSimplePopup
				modalOpenState={isMissingDetailsModalOpen2}
				setModalOpenState={setIsMissingDetailsModaOpen2}
				title="Missing Details 💀💀💀"
				text="Please ensure that you have filled in all the required entries."
				icon={SimpleIcon.Cross}
				// onRequestClose={() => {
				// 	router.reload();
				//   }}
			  /> */}
			  <ModuleSimplePopup
				modalOpenState={isNotValid}
				setModalOpenState={setIsNotValid}
				title="System asset ID not valid"
				text="Please ensure that you have chosen a valid ID from the tables."
				icon={SimpleIcon.Cross}
				shouldCloseOnOverlayClick={true}
				// onRequestClose={() => {
				// 	router.reload();
				//   }}
			  />
			  <ModuleSimplePopup
            modalOpenState={submissionModal}
            setModalOpenState={setSubmissionModal}
            title="Success!"
            text="Your entry has been submitted!"
            icon={SimpleIcon.Check}
			shouldCloseOnOverlayClick={true}
            buttons={[
              	<button
					key={1}
					onClick={() => {
					setSubmissionModal(false);
					router.reload();
					}}
					className="btn btn-secondary"
				>
                	Create another entry
				</button>,
				<button
					key={2}
					onClick={() => {
						setSubmissionModal(false);
						router.push("/Master");
					}}
					className="btn btn-primary"
				>
			  		Ok
				</button>
            ]}
            onRequestClose={() => {
              router.push("/Master");
            }}
          />
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

	const masterCreateInfo = await instance.get<CMMSMasterTables>(`/api/master/new`, headers);
	const systems = await instance.get<CMMSSystem[]>(
		`/api/asset/systems`,
		headers
	  );
	const plants = await instance.get<CMMSPlant[]>(
		`/api/plants`,
		headers
	);

	let props: NewMasterEntryProps = { tables: masterCreateInfo.data, systems: systems.data, plants: plants.data };

	return {
		props: props
	}
}
