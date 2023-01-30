import formStyles from '../../styles/formStyles.module.css'

import React, { useEffect, useState } from 'react'
import axios from 'axios'

import { ModuleContent, ModuleDivider, ModuleFooter, ModuleHeader, ModuleMain } from '../../components'
import ImagePreview from '../../components/Request/ImagePreview'

import { useForm } from 'react-hook-form';
import { SubmitHandler } from 'react-hook-form/dist/types';

import { CMMSBaseType, CMMSRequestTypes, CMMSFaultTypes, CMMSUser } from '../../types/common/interfaces'
import { GetServerSideProps, GetServerSidePropsContext } from 'next'
import Link from 'next/link'
import RequiredIcon from '../../components/RequiredIcon'

type FormValues = {
	requestTypeID: number;
	faultTypeID: number;
	description: string;
	plantLocationID: number;
	taggedAssetID: number;
	image: FileList;
}

async function getAssets(plant_id: number)
{
	return await axios.get("/api/asset/" + plant_id)
	.then((response) => {
		return response.data;
	})
	.catch((e) => {
		console.log("error getting assets")
		console.log(e);
		return null;
	});
}

async function createRequest(data: FormValues)
{
	const formData = new FormData();

	formData.append("description", 			data.description);
	formData.append("faultTypeID", 			data.faultTypeID.toString());
	formData.append("plantLocationID",		data.plantLocationID.toString());
	formData.append("requestTypeID", 		data.requestTypeID.toString());
	formData.append("taggedAssetID", 		data.taggedAssetID.toString());
	if(data.image.length > 0)
		formData.append("image",			data.image[0])

	return await axios.post("/api/request/",
		formData,
		{
			headers: {"Content-Type": "multipart/form-data"}
		}
	).then((response) => {
		return response.data;
	})
	.catch((e) => {
		console.log("error creating request")
		console.log(e);
		return null;
	});
}

interface NewRequestProps {
	user: CMMSUser
	requestTypes: CMMSRequestTypes[]
	faultTypes: CMMSFaultTypes[]
}

export default function RequesttNew(props: NewRequestProps) {
	const [selectedFile ,setSelectedFile] = useState<File>();
	const [previewedFile, setPreviewedFile] = useState<string>();

	const [requestTypes, setRequestTypes] = useState<CMMSRequestTypes[]>(props.requestTypes);
	const [faultTypes, setFaultTypes] = useState<CMMSFaultTypes[]>(props.faultTypes);
	const [availableAssets, setAvailableAssets] = useState<CMMSBaseType[]>([]);

	const {
		register,
		handleSubmit,
		formState,
		control
	} = useForm<FormValues>();

	const { isSubmitting, errors } = formState;

	const formSubmit: SubmitHandler<FormValues> = async (data) => {
		console.log(data);
		await createRequest(data);
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
		let options: CMMSBaseType[] = [];

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

	const options2 = Array.from(Array(5000).keys()).map((x) => {return {value:x, label:x}})

	return (
		<ModuleMain>
			<form onSubmit={handleSubmit(formSubmit)}>
			<ModuleHeader title="New Request" header="Create New Request">
				<Link href="/Request" className="btn btn-secondary">Back</Link>
			</ModuleHeader>
			<ModuleContent includeGreyContainer grid>
				<div className={formStyles.halfContainer}>

					<div className="form-group">
						<label className='form-label'>
							<RequiredIcon/> Request Type
						</label>
						<select className="form-control" id="formControlTypeRequest" {...register("requestTypeID", {required: true})}>
							<option hidden key={0} value={""}>-- Please Select a Type --</option>
							{
								requestTypes.map((rType: CMMSRequestTypes) => {
									return <option key={rType.req_id} value={rType.req_id}>{rType.request}</option>
								})
							}
						</select>
					</div>

					<div className="form-group">
						<label className='form-label'>
							<RequiredIcon/> Fault Type
						</label>
						<select className="form-control" id="formControlTypeFault" {...register("faultTypeID", {required: true})}>
							<option hidden key={0} value={""}>-- Please Select a Type --</option>
							{
								faultTypes.map((fType: CMMSFaultTypes) => {
									return <option key={fType.fault_id} value={fType.fault_id}>{fType.fault_type}</option>
								})
							}
						</select>
					</div>

					<div className="form-group">
						<label className='form-label'>Description</label>
						<textarea className="form-control" id="formControlDescription" rows={6} {...register("description")}/>
					</div>

				</div>
				<div className={formStyles.halfContainer} style={{gridRow: "span 3", display:"flex", flexDirection:"column", height:"100%"}}>

					<div className="form-group">
						<label className='form-label'>
							<RequiredIcon/> Plant Location
						</label>
						<select className="form-control" id="formControlLocation" {...register("plantLocationID", {onChange: plantChange})}>
							<option hidden key={0} value={""}>-- Please Select a Location --</option>
							<option key={2} value={2}>Woodlands DHCS</option>
							<option key={4} value={4}>Mediapolis</option>
						</select>
					</div>

					<div className="form-group">
						<label className="form-label">
							<RequiredIcon/> Tag Asset:
						</label>

						<select className="form-control" id="formControlTagAsset" {...register("taggedAssetID", {required: true})}>
							<option key="-1" value="">None</option>
							{
								availableAssets.map((asset: CMMSBaseType) => {
									return <option key={asset.id + "|" + asset.name} value={asset.id}>{asset.name}</option>
								})
							}
						</select>

					</div>

					<div className="form-group">
						<label className="form-label">Image</label>
						<input className="form-control" type="file" accept="image/jpeg,image/png,image/gif" id="formFile" {...register("image", {onChange:onFileSelected})}/>
					</div>

					<ImagePreview previewObjURL={previewedFile}/>

				</div>

				<ModuleDivider/>

				<div className={formStyles.halfContainer}>

					<div className="form-group">
						<label className='form-label'>Reported By</label>
						<input className="form-control" type="text" disabled value={props.user.role_name}/>
					</div>
					
					<div className="form-group">
						<label className='form-label'>Reporter Name</label>
						<input className="form-control" type="text" disabled value={props.user.name}/>
					</div>
				</div>

			</ModuleContent>
			<ModuleFooter>
				{(errors.requestTypeID || errors.faultTypeID || errors.plantLocationID || errors.taggedAssetID) && 
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

	const getUser = axios.get<CMMSUser>("http://localhost:3001/api/user", headers)
	const getRequestTypes = axios.get<CMMSRequestTypes[]>("http://localhost:3001/api/request/types", headers)
	const getFaultTypes = axios.get<CMMSFaultTypes[]>("http://localhost:3001/api/fault/types", headers)

	const values = await Promise.all([getUser, getRequestTypes, getFaultTypes])

	const u: CMMSUser				= values[0].data;
	const r: CMMSRequestTypes[]		= values[1].data;
	const f: CMMSFaultTypes[]		= values[2].data;

	let props: NewRequestProps = { user: u, requestTypes: r, faultTypes: f }

	return {
		props: props
	}
}