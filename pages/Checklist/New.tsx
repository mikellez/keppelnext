import formStyles from '../../styles/formStyles.module.css'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'

import { ModuleContent, ModuleDivider, ModuleHeader, ModuleMain, ModuleFooter } from '../../components'
import ChecklistTemplateCreator from '../../components/Checklist/ChecklistTemplateCreator'
import { GetServerSideProps, GetServerSidePropsContext } from 'next'
import { CMMSPlant, CMMSChecklist } from '../../types/common/interfaces'
import axios from 'axios'
import { useAsset, useCurrentUser } from '../../components/SWR'

import PlantSelect from '../../components/PlantSelect'
import AssignToSelect from '../../components/Schedule/AssignToSelect'

import { CheckSection } from '../../types/common/classes'
import LoadingIcon from '../../components/LoadingIcon'
import LoadingHourglass from '../../components/LoadingHourglass'

export default function ChecklistNew({plants}: {plants: CMMSPlant[]}) {

	const [checklistData, setChecklistData] = useState<CMMSChecklist>({} as CMMSChecklist);
	const [isReady, setIsReady] = useState<boolean>(false);
	const [sections, setSections] = useState<CheckSection[]>([]);

	const resetChecklist = () => {
		setSections([]);
	}

	const user = useCurrentUser()

	const updateChecklist = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
		const newInput = e.target.name === "plant_id" ? parseInt(e.target.value) : e.target.value;

		setChecklistData(prev => {
			return {
				...prev,
				[e.target.name]: newInput,
			}
		})

	};

	useEffect(() => {

			setChecklistData(prev => {
				return {
					...prev,
					createdbyuser: user.data?.name as string,
					plant_id: user.data?.allocated_plants[0] as number,
				}
			});

			setTimeout(() => {
				setIsReady(true);
			}, 1000);

	}, [user.data]);

	console.log(checklistData)

	const {
		data,
		error,
		isValidating,
		mutate
	} = useAsset(checklistData.plant_id);

	return (
		<ModuleMain>
			<ModuleHeader title="New Checklist" header="Create New Checklist">
				<Link href="/Checklist" className="btn btn-secondary">Back</Link>
			</ModuleHeader>
		{isReady ? 
		<>
		<ModuleContent includeGreyContainer grid>
			<div className={formStyles.halfContainer}>

				<div className="form-group">
					<label className='form-label'>Checklist Name</label>
					<input 
						type="text" 
						className="form-control" 
						name="chl_name"
						value={checklistData.chl_name ? checklistData.chl_name : ""}
						onChange={updateChecklist}
					/>
				</div>

				<div className="form-group">
					<label className='form-label'>Description</label>
					<input 
						type="text" 
						className="form-control" 
						name="description" 
						value={checklistData.description ? checklistData.description : ""}
						onChange={updateChecklist}
					/>
				</div>

				<div className="form-group">
					<label className='form-label'>Plant</label>
					<PlantSelect onChange={updateChecklist} name="plant_id" accessControl defaultPlant={checklistData.plant_id} />
				</div>

			</div>
			
			<div className={formStyles.halfContainer} style={{gridRow: "span 3"}}>
				<div className="form-group" style={{display:"flex", flexDirection:"column", height:"100%"}}>
					<label className="form-label">Linked Assets:</label>
					{/* <select multiple className="form-control" id="formControlLinkedAssets"
						style={{display:"block", flex:1, height: "100%"}}>
						{!data && <option disabled>Select a plant</option>}
					</select> */}
				</div>
			</div>

			<ModuleDivider/>

			<div className={formStyles.halfContainer}>
				
				<div className="form-group">
					<label className='form-label'>Assigned To</label>
					<AssignToSelect 
						onChange={() => {}} 
						plantId={checklistData.plant_id}
						isSingle
					/>
				</div>

				<div className="form-group">
					<label className='form-label'>Created By</label>
					<input 
						className="form-control" 
						defaultValue={checklistData.createdbyuser} 
						disabled 
					/>
				</div>
				
				<div className="form-group">
					<label className='form-label'>Sign Off By</label>
					<AssignToSelect 
						onChange={() => {}} 
						plantId={checklistData.plant_id}
						isSingle
					/>
				</div>
			</div>

		</ModuleContent>
		<ModuleContent>
			<ModuleHeader header="Add Checklists" headerSize="1.5rem">
				<button className="btn btn-primary" onClick={resetChecklist}>Reset</button>
			</ModuleHeader>
			
			<ChecklistTemplateCreator sections={sections} setSections={setSections}/>

		</ModuleContent>
		</> : 
		<div style={{ position: "absolute", top:"calc((100% - 8rem) / 2)", left:"50%", transform:"translate(-50%,-50%)"}}>
			<LoadingHourglass />
	  	</div>
		}
			<ModuleFooter>
			</ModuleFooter>
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