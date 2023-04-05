import formStyles from '../../styles/formStyles.module.css'
import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { ModuleContent, ModuleDivider, ModuleHeader, ModuleMain, ModuleFooter } from '../../components'
import ChecklistTemplateCreator from '../../components/Checklist/ChecklistTemplateCreator'
import { GetServerSideProps, GetServerSidePropsContext } from 'next'
import { CMMSPlant, CMMSChecklist } from '../../types/common/interfaces'
import axios from 'axios'
import { useCurrentUser } from '../../components/SWR'
import PlantSelect from '../../components/PlantSelect'
import AssignToSelect, { AssignedUserOption } from '../../components/Schedule/AssignToSelect'
import AssetSelect from '../../components/Checklist/AssetSelect'
import { CheckSection } from '../../types/common/classes'
import LoadingHourglass from '../../components/LoadingHourglass'
import { SingleValue } from 'react-select'
import TooltipBtn from '../../components/TooltipBtn'
import ModuleSimplePopup, { SimpleIcon } from '../../components/ModuleLayout/ModuleSimplePopup'
import { useRouter } from 'next/router'
import { createChecklistGetServerSideProps } from '../../types/common/props'

interface ChecklistPageProps {
	checklist: CMMSChecklist | null;
}

const createChecklist = async (checklist: CMMSChecklist, type: string) => {
	return await axios.post(`/api/checklist/${type}`, { checklist })
		.then(res => {
			return res.data
		})
		.catch(err => console.log(err))
};

export default function ChecklistNew(props: ChecklistPageProps) {

	const [checklistData, setChecklistData] = useState<CMMSChecklist>({} as CMMSChecklist);
	const [isReady, setIsReady] = useState<boolean>(false);
	const [sections, setSections] = useState<CheckSection[]>([]);
	const [incompleteModal, setIncompleteModal] = useState<boolean>(false);
	const [successModal, setSuccessModal] = useState<boolean>(false);

	const resetChecklist = () => {
		setSections([]);
	};

	const user = useCurrentUser();
	const router = useRouter();

	const updateChecklist = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
		const newInput = e.target.name === "plant_id" ? parseInt(e.target.value) : e.target.value;
		setChecklistData(prev => {
			return {
				...prev,
				[e.target.name]: newInput,
			}
		});

	};

	const updateChecklistField = (value: number | string | null, field: string) => {
		setChecklistData(prev => {
			return {
				...prev,
				[field]: value,
			}
		});
	};

	const submitChecklist = (checklistType: string) => {
		if (!checkInputFields(checklistType)) {
			setIncompleteModal(true);
		} else {
			setSuccessModal(true);
			createChecklist(checklistData, checklistType);
			setTimeout(() => {
				router.push("/Checklist");
			}, 1000);
		}
	};

	const checkInputFields = (checklistType: string) => {
		switch (checklistType) {
			case "record":
				return (
					checklistData.assigned_user_id &&
					checklistData.signoff_user_id &&
					checklistData.chl_name &&
					checklistData.chl_name != "" &&
					checklistData.description &&
					checklistData.description != "" &&
					checklistData.plant_id &&
					checklistData.linkedassetids &&
					checklistData.linkedassetids != ""
				);
			case "template":
				return (
					checklistData.signoff_user_id &&
					checklistData.chl_name &&
					checklistData.chl_name != "" &&
					checklistData.description &&
					checklistData.description != "" &&
					checklistData.plant_id
				);
		}
	}

	useEffect(() => {

			setChecklistData(prev => {
				return {
					...prev,
					createdbyuser: user.data?.name as string,
					plant_id: user.data?.allocated_plants[0] as number,
				}
			});

			if (props.checklist) {
				setChecklistData(prev => {
					return {
						...prev,
						plant_id: props.checklist!.plant_id,
						chl_name: props.checklist!.chl_name,
						description: props.checklist!.description,
						signoff_user_id: props.checklist!.signoff_user_id,
					}
				})

				if (props.checklist.datajson.length > 0) {
					const sectionsFromJSON = props.checklist.datajson.map((section: any) => {
						return CheckSection.fromJSON(JSON.stringify(section))
						return section
					})
					setSections(sectionsFromJSON)
				}
			}

			setTimeout(() => {
				setIsReady(true);
			}, 1000);

	}, [user.data, props.checklist]);

	useEffect(() => {
		const json = sections.length > 0 ? 
			sections.map(section => section.toJSON()) :
			[];
		setChecklistData(prev => {
			return {
				...prev,
				datajson: JSON.stringify(json),
			}
		})
	}, [sections]);

	return (
		<>
		<ModuleMain>
			<ModuleHeader title="New Checklist" header="Create New Checklist">
				<Link href="/Checklist/Templates" className="btn btn-primary">
					Templates
				</Link>
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
					<AssetSelect
						onChange={(values) => {
							const assetIdsString = values.length > 0 ? values
								.map(option => option.value.toString())
								.join(", ") : null;
							updateChecklistField(assetIdsString, "linkedassetids");
						}}
						plantId={checklistData.plant_id}
					/>
				</div>
			</div>

			<ModuleDivider/>

			<div className={formStyles.halfContainer}>
				
				<div className="form-group">
					<label className='form-label'>Assigned To</label>
					<AssignToSelect 
						onChange={(value) => {
							updateChecklistField((value as SingleValue<AssignedUserOption>)?.value as number, "assigned_user_id")
						}} 
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
						onChange={(value) => {
							updateChecklistField((value as SingleValue<AssignedUserOption>)?.value as number, "signoff_user_id")
						}} 
						plantId={checklistData.plant_id}
						isSingle
						defaultIds={props.checklist ? [checklistData.signoff_user_id as number] : []}
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
		
		<ModuleFooter>
			<TooltipBtn 
				toolTip={false} 
				style={{backgroundColor: "#F7C04A", borderColor: "#F7C04A"}} 
				onClick={() => submitChecklist("template")}
				disabled={successModal}
			>Save Template</TooltipBtn>

			<TooltipBtn 
				toolTip={false} 
				onClick={() => submitChecklist("record")}
				disabled={successModal}
			>Submit</TooltipBtn>
		</ModuleFooter>

		</> : 
		<div style={{ position: "absolute", top:"calc((100% - 8rem) / 2)", left:"50%", transform:"translate(-50%,-50%)"}}>
			<LoadingHourglass />
	  	</div>
		}
		</ModuleMain>

		<ModuleSimplePopup
			setModalOpenState={setSuccessModal}
			modalOpenState={successModal}
			title="Success"
			text="New checklist successfully created"
			icon={SimpleIcon.Check}
		/>

		<ModuleSimplePopup
			setModalOpenState={setIncompleteModal}
			modalOpenState={incompleteModal}
			title="Missing details"
			text="Please ensure that all input fields have been filled"
			icon={SimpleIcon.Exclaim}
		/>
		</>
  	);
};

const getServerSideProps =  createChecklistGetServerSideProps("template");

export {
	type ChecklistPageProps,
	getServerSideProps,
}