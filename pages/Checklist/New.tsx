import formStyles from '../../styles/formStyles.module.css'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'

import { ModuleContent, ModuleDivider, ModuleHeader, ModuleMain, ModuleFooter } from '../../components'
import ChecklistTemplateCreator from '../../components/Checklist/ChecklistTemplateCreator'
import { GetServerSideProps, GetServerSidePropsContext } from 'next'
import { CMMSPlant } from '../../types/common/interfaces'
import axios from 'axios'
import { useAsset } from '../../components/SWR'

import { useForm } from 'react-hook-form';
import { SubmitHandler } from 'react-hook-form/dist/types';

type FormValues = {
	checklistSections: CheckSection[]
}

import { CheckSection } from '../../types/common/classes'
import LoadingIcon from '../../components/LoadingIcon'

export default function ChecklistNew({plants}: {plants: CMMSPlant[]}) {

	const [selectedPlantID, setSelectedPlantID] = useState<number | null>(null);
	const [sections, setSections] = useState<CheckSection[]>([]);

	const {
		register,
		handleSubmit,
		formState
	} = useForm<FormValues>();

	const { isSubmitting, errors } = formState;

	const formSubmit: SubmitHandler<FormValues> = async (data) => {
		data.checklistSections = sections;
		console.log(data);
		await axios.post("/api/checklist/template", data)
		.then((response) => {
			console.log("success", response);
		}).catch((e) => {
			console.log("error", e);
		});
	};

	const resetChecklist = () => {
		setSections([]);
	}

	useEffect(() => {
		console.log(plants)
	}, []
	);

	const {
		data,
		error,
		isValidating,
		mutate
	} = useAsset(selectedPlantID);

	function handlePlantChange(e: React.ChangeEvent<HTMLSelectElement>) {
		setSelectedPlantID(parseInt(e.target.value))
		console.log(data);
	}

	return (
		<ModuleMain>
			<ModuleHeader title="New Checklist" header="Create New Checklist">
				<Link href="/Checklist" className="btn btn-secondary">Back</Link>
			</ModuleHeader>
			<form onSubmit={handleSubmit(formSubmit)}><ModuleContent includeGreyContainer grid>
				<div className={formStyles.halfContainer}>

					<div className="form-group">
						<label className='form-label'>Checklist Name</label>
						<input type="text" className="form-control" id="formControlName"/>
					</div>

					<div className="form-group">
						<label className='form-label'>Description</label>
						<input type="text" className="form-control" id="formControlDescription"/>
					</div>

					<div className="form-group">
						<label className='form-label'>Plant Location</label>
						<select className="form-select" id="formControlLocation" defaultValue={0} onChange={handlePlantChange}>
							<option disabled hidden value={0}>- No Plant Selected -</option>
							{
								plants.map((p) => {
									return <option key={p.plant_id} value={p.plant_id}>{p.plant_name}</option>
								})
							}
						</select>
					</div>

				</div>
				
				<div className={formStyles.halfContainer} style={{gridRow: "span 3"}}>
					<div className="form-group" style={{display:"flex", flexDirection:"column", height:"100%"}}>
						<label className="form-label">Linked Assets:</label>
						<select multiple className="form-control" id="formControlLinkedAssets"
							style={{display:"block", flex:1, height: "100%"}}>
							{!data && <option disabled>Select a plant</option>}
						</select>
					</div>
				</div>

				<ModuleDivider/>

				<div className={formStyles.halfContainer}>
					
					<div className="form-group">
						<label className='form-label'>Assigned To</label>
						<select className="form-select" id="formControlAssigned"/>
					</div>

					<div className="form-group">
						<label className='form-label'>Created By</label>
						<select className="form-select" id="formControlCreated"/>
					</div>
					
					<div className="form-group">
						<label className='form-label'>Sign Off By</label>
						<select className="form-select" id="formControlSignOff"/>
					</div>
				</div>

			</ModuleContent>
			<ModuleContent>
				<ModuleHeader header="Add Checklists" headerSize="1.5rem">
					<button className="btn btn-primary" onClick={resetChecklist}>Reset</button>
				</ModuleHeader>
				
				<ChecklistTemplateCreator sections={sections} setSections={setSections}/>

			</ModuleContent>
			<ModuleFooter>
				{/*(errors.type || errors.entries) && 
				<span style={{color: "red"}}>Please fill in all required fields</span>*/}
				<button type="submit" className="btn btn-primary" disabled={isSubmitting}>
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

	const getPlants = axios.get<CMMSPlant[]>("http://localhost:3001/api/getUserPlants", headers);

	const values = await Promise.all([getPlants])

	const p: CMMSPlant[]				= values[0].data;

	console.log(p);

	let props: {
		plants: CMMSPlant[]
	} = { plants: p }
	
	return {
		props: props
	}
}