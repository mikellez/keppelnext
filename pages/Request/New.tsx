import formStyles from '../../styles/formStyles.module.css'

import React, { useEffect, useState } from 'react'
import axios from 'axios'

import { ModuleContent, ModuleDivider, ModuleFooter, ModuleHeader, ModuleMain } from '../../components'
import ImagePreview from '../../components/Request/ImagePreview'

import { useForm } from 'react-hook-form';
import { SubmitHandler } from 'react-hook-form/dist/types';

import { CMMSBaseType, CMMSUser } from '../../types/common/interfaces'
import { GetServerSideProps, GetServerSidePropsContext } from 'next'
import Link from 'next/link'

type FormValues = {
	requestTypeID: number;
	faultTypeID: number;
	description: string;
	plantLocationID: number;
	taggedAssetID: number;
	image: File;
}

const r: CMMSBaseType[] = [
	{id:1, name:"OPERATIONS"},
	{id:2, name:"MAINTENANCE"},
	{id:3, name:"EXTERNAL"},
]

const f: CMMSBaseType[] = [
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

interface NewRequestProps {
	user: CMMSUser
}

export default function RequesttNew(props: NewRequestProps) {
	const [selectedFile ,setSelectedFile] = useState<File>();
	const [previewedFile, setPreviewedFile] = useState<string>();

	const [requestTypes, setRequestTypes] = useState<CMMSBaseType[]>(r);
	const [faultTypes, setFaultTypes] = useState<CMMSBaseType[]>(f);
	const [availableAssets, setAvailableAssets] = useState<CMMSBaseType[]>([]);

	const {
		register,
		handleSubmit,
		formState,
		control
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

	const getOptions = () => {
		return availableAssets.map((asset: CMMSBaseType) => {
			return {value:asset.id, label:asset.name}
		});
	}

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
						<label className='form-label'>Request Type</label>
						<select className="form-control" id="formControlTypeRequest" {...register("requestTypeID")}>
							<option hidden key={0} value={0}>-- Please Select a Type --</option>
							{
								requestTypes.map((rType: CMMSBaseType) => {
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
								faultTypes.map((fType: CMMSBaseType) => {
									return <option key={fType.id} value={fType.id}>{fType.name}</option>
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
						<label className='form-label'>Plant Location</label>
						<select className="form-control" id="formControlLocation" {...register("plantLocationID", {onChange: plantChange})}>
							<option hidden key={0} value={0}>-- Please Select a Location --</option>
							<option key={2} value={2}>Woodlands DHCS</option>
							<option key={4} value={4}>Mediapolis</option>
						</select>
					</div>

					<div className="form-group">
						<label className="form-label">Tag Asset:</label>

						<select className="form-control" id="formControlTagAsset" {...register("taggedAssetID")}>
							{
								availableAssets.map((asset: CMMSBaseType) => {
									return <option key={asset.id} value={asset.id}>{asset.name}</option>
								})
							}
						</select>

						{/* <WindowedSelect isMulti options={options2} windowThreshold={1} components={Option} filterOption={createFilter({ ignoreAccents: false })}/>
						 */}
						{/* <Controller
							control={control}
							defaultValue={options2.map(c => c.value)}
							name="linkedAssetIDs"
							render={
								(
									{
										field: { onChange, value, ref }
									}
								) => {

									return <Select
										ref={ref}
										value={options2.filter(c => value.includes(c.value))}
										onChange={val => onChange(val.map(c => c.value))}
										options={options2}
										isMulti
									/>
								}
							}
						/> */}
					</div>

					<div className="form-group">
						<label className="form-label">Images</label>
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
				<button type="submit" className="btn btn-primary">Submit</button>
			</ModuleFooter></form>
		</ModuleMain>
  	)
}

export const getServerSideProps: GetServerSideProps = async(context: GetServerSidePropsContext) => {

	const res = await axios.get<CMMSUser>("http://localhost:3001/api/user", {
		withCredentials: true,
		headers: {
			Cookie: context.req.headers.cookie
		}
	})

	let data: CMMSUser = res.data;
	console.log("success", res);

	let props: NewRequestProps = { user: data }

	return {
		props: props
	}
}