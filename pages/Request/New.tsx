import formStyles from '../../styles/formStyles.module.css'

import React, { useEffect, useState } from 'react'
import axios from 'axios'

import { ModuleContent, ModuleDivider, ModuleFooter, ModuleHeader, ModuleMain } from '../../components'
import ImagePreview from '../../components/Request/ImagePreview'

import { useForm } from 'react-hook-form';
import { SubmitHandler } from 'react-hook-form/dist/types';

type FormValues = {
	requestTypeID: number;
	faultTypeID: number;
	description: string;
	plantLocationID: number;
	linkedAssetIDs: number[];
	image: File;
}

interface CMMSTypes {
	id: number
	name: string
}

const r: CMMSTypes[] = [
	{id:1, name:"COOLING TOWER"},
	{id:2, name:"CONDENSATION"},
	{id:3, name:"CHW SUPPLY TEMPERTURE ANOMALY"},
	{id:4, name:"ROOM TEMPERTURE ANOMALY"},
	{id:5, name:"PIPE LEAK"},
	{id:6, name:"CUSTOMER STATION CLEANLINESS ISSUE"},
	{id:7, name:"CHILLER TRIP"},
	{id:8, name:"OTHERS"},
	{id:9, name:"CHANGE OF PARTS"},
]

const f: CMMSTypes[] = [
	{id:1, name:"OPERATIONS"},
	{id:2, name:"MAINTENANCE"},
	{id:3, name:"EXTERNAL"},
]

async function getAssets(plant_id: number)
{
	return await axios.get("http://localhost:3000/api/request/getAssets/" + plant_id)
	.then((response) => {
		return response.data;
	})
	.catch((e) => {
		console.log("error getting assets")
		console.log(e);
		return null;
	});
}

export default function RequesttNew() {
	const [selectedFile ,setSelectedFile] = useState<File>();
	const [previewedFile, setPreviewedFile] = useState<string>();

	const [requestTypes, setRequestTypes] = useState<CMMSTypes[]>(r);
	const [faultTypes, setFaultTypes] = useState<CMMSTypes[]>(f);
	const [availableAssets, setAvailableAssets] = useState<CMMSTypes[]>([]);

	const {
		register,
		handleSubmit,
		formState
	} = useForm<FormValues>();

	const formSubmit: SubmitHandler<FormValues> = (data) => {
		console.log(data);
	};

	useEffect(() => {
		if(!selectedFile) {
			setPreviewedFile(undefined)
			return
		}

		const objectURL = URL.createObjectURL(selectedFile);
		setPreviewedFile(objectURL);

		return () => URL.revokeObjectURL(objectURL);
	}, [selectedFile]);

	const onFileSelected = (e: React.ChangeEvent) => {
		const input = e.target as HTMLInputElement;

		if (!input.files || input.files.length === 0) {
            setSelectedFile(undefined)
            return
        }

        setSelectedFile(input.files[0])
	}

	const updateAssetLists = (plant_id : number) => {
		let options: CMMSTypes[] = [];

		getAssets(plant_id).then((data) => {
			if(data === null)
				return console.log("assets null");

			for(let asset of data)
				options.push({
					id: asset.psa_id,
					name: asset.asset_name
				});

			setAvailableAssets(options);
		});
	}

	const plantChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		updateAssetLists(parseInt(e.target.value));
	};

	return (
		<ModuleMain>
			<form onSubmit={handleSubmit(formSubmit)}>
			<ModuleHeader title="New Request" header="Create New Request">
				<a href="/Request" className="btn btn-secondary">Back</a>
			</ModuleHeader>
			<ModuleContent includeGreyContainer grid>
				<div className={formStyles.halfContainer}>

					<div className="form-group">
						<label className='form-label'>Request Type</label>
						<select className="form-control" id="formControlTypeRequest" {...register("requestTypeID")}>
							<option hidden key={0} value={0}>-- Please Select a Type --</option>
							{
								requestTypes.map((rType: CMMSTypes) => {
									return <option key={rType.id} value={rType.id}>{rType.name}</option>
								})
							}
						</select>
					</div>

					<div className="form-group">
						<label className='form-label'>Fault Type</label>
						<select className="form-control" id="formControlTypeFault" {...register("faultTypeID")}>
							<option hidden key={0} value={0}>-- Please Select a Type --</option>
							{
								faultTypes.map((fType: CMMSTypes) => {
									return <option key={fType.id} value={fType.id}>{fType.name}</option>
								})
							}
						</select>
					</div>

					<div className="form-group">
						<label className='form-label'>Description</label>
						<textarea className="form-control" id="formControlDescription" rows={6} {...register("description")}/>
					</div>

					<div className="form-group">
						<label className='form-label'>Plant Location</label>
						<select className="form-control" id="formControlLocation" {...register("plantLocationID", {onChange: plantChange})}>
							<option hidden key={0} value={0}>-- Please Select a Location --</option>
							<option key={2} value={2}>Woodlands DHCS</option>
							<option key={4} value={4}>Mediapolis</option>
						</select>
					</div>

				</div>
				<div className={formStyles.halfContainer} style={{gridRow: "span 3"}}>
					<div className="form-group" style={{display:"flex", flexDirection:"column", height:"50%"}}>
						<label className="form-label">Linked Assets:</label>
						<select multiple className="form-control" id="formControlLinkedAssets" {...register("linkedAssetIDs")}
							style={{display:"block", flex:1, height: "50%"}}>
							{
								availableAssets.map((asset: CMMSTypes) => {
									return <option key={asset.id} value={asset.id}>{asset.name}</option>
								})
							}
						</select>
					</div>

					<div className="form-group" style={{display:"flex", flexDirection:"column", height:"50%"}}>
						<label className="form-label">Images</label>
						<input className="form-control" type="file" accept="image/jpeg,image/png,image/gif" id="formFile" {...register("image", {onChange:onFileSelected})}/>
						<ImagePreview previewObjURL={previewedFile}/>
					</div>
				</div>

				<ModuleDivider/>

				<div className={formStyles.halfContainer}>

					<div className="form-group">
						<label className='form-label'>Reported By</label>
						<select className="form-control" id="formControlReported"/>
					</div>
					
					<div className="form-group">
						<label className='form-label'>Reporter Name</label>
						<select className="form-control" id="formControlReporterName"/>
					</div>
				</div>

			</ModuleContent>
			<ModuleFooter>
				<button type="submit" className="btn btn-primary">Submit</button>
			</ModuleFooter></form>
		</ModuleMain>
  	)
}