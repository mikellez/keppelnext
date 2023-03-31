import formStyles from '../../styles/formStyles.module.css'
import axios from "axios";
import { GetServerSideProps, GetServerSidePropsContext } from "next";
import React, { useState } from "react";
import { ModuleContent, ModuleFooter, ModuleHeader, ModuleMain } from "../../components";
import AssetFormTemplate from "../../components/Asset/AssetFormTemplate";
import RequiredIcon from "../../components/RequiredIcon";
import { useSystemAsset, useSystemAssetName, useSubComponent1Name } from "../../components/SWR";
import { CMMSPlant, CMMSSystem, CMMSAssetType, CMMSAssetDetailsState,} from "../../types/common/interfaces";
import ModuleSimplePopup, {
	SimpleIcon,
  } from "../../components/ModuleLayout/ModuleSimplePopup";
import Link from 'next/link';
import { useRouter } from 'next/router';


interface NewAssetProps {
	plants: CMMSPlant[];
	systems: CMMSSystem[];
	assetTypes: CMMSAssetType[];
}

const createNewAsset = async (plant: number, system_asset_name: string) => {
	return await axios({
		url: "",
		method: "POST",
		data: {
			system_asset_name: system_asset_name,
			plantname: plant
		}
	})
		.then(res => {
			return res.data;
		})
		.catch(err => {
			console.log('error');
		})
}

export default function NewAsset(props: NewAssetProps) {
	const router = useRouter();
	//state of all fields
	const [form, setform] = useState<CMMSAssetDetailsState>({
	plant_id:0
    ,system_id: 0
	,system_asset_id: 0
	,system_asset: ""
    ,asset_type_id: ""
	,system_asset_name: ""
	,system_asset_name_form: ""
	,sub_component_1: ""
	,sub_component_1_form: ""
	,sub_component_2: ""
	,description:""
	,location:""
	,brand:""
	,model_number:""
	,warranty:""
	,tech_specs:""
	,manufacture_country:""
	,remarks:""});

	const [isMissingDetailsModalOpen, setIsMissingDetailsModaOpen] = useState<boolean>(false);
	const [isMultipleEntries, setIsMultipleEntries] = useState<boolean>(false);
	const [submissionModal, setSubmissionModal] = useState<boolean>(false);

	const {
		data: systemAssetData,
		error: systemAssetError,
		isValidating: systemAssetIsValidating,
		mutate: systemAssetMutate
	} = useSystemAsset(form.system_id === 0 ? null : form.system_id!);

	const {
		data: systemAssetNameData,
		error: systemAssetNameError,
		isValidating: systemAssetNameIsValidating,
		mutate: systemAssetNameMutate
	} = useSystemAssetName(form.plant_id === 0 ? null :form.plant_id!, form.system_id === 0 ? null : form.system_id!, form.system_asset_id=== 0 ? null :form.system_asset_id!);

	const {
		data: subComponent1NameData,
		error: subComponent1NameError,
		isValidating: ssubComponent1NameIsValidating,
		mutate: subComponent1NameMutate
	} = useSubComponent1Name(form.plant_id === 0 ? null :form.plant_id!, form.system_id === 0 ? null : form.system_id!, form.system_asset_id=== 0 ? null :form.system_asset_id!, form.system_asset_name === '' ? '' : form.system_asset_name! );

	const handleAssetNameSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
		setform((prevState) => {return{...prevState,[e.target.name]:e.target.value,system_asset:e.target.options[e.target.selectedIndex].text}});
	}
	
	const handleForm = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {	
		setform((prevState) => {return{...prevState,[e.target.name]:e.target.value}});
	}
	function submission() {
	

		if (form.plant_id === 0 || form.system_id === 0 || form.system_asset_id === 0 || (form.system_asset_name === "" && form.system_asset_name_form === "")) {
			setIsMissingDetailsModaOpen(true);
		} else if (((form.system_asset_name !== "") && (form.system_asset_name_form !== "")) || ((form.sub_component_1 !== "") && (form.sub_component_1_form !== ""))){
			setIsMultipleEntries(true);
		}
		else{
		var system_asset_name_post_data: string;
		if (form.system_asset_name !== "") {
			system_asset_name_post_data = form.system_asset_name;
		} else if (form.system_asset_name_form !== "") {
			system_asset_name_post_data = form.system_asset_name_form;
		} else {
			system_asset_name_post_data = "";
		}
		var system_lvl_5_post_data: string;
		if (form.sub_component_1 !== "") {
			system_lvl_5_post_data = form.sub_component_1;
		} else if (form.sub_component_1_form !== "") {
			system_lvl_5_post_data = form.sub_component_1_form;
		} else {
			system_lvl_5_post_data = "";
		}

		let postData: {
			plant_id: number;
			system_id: number;
			system_asset: string;
			system_asset_id: number;
			system_asset_name: string;
			system_lvl_5: string;
			[key: string]: string | number;
		} = {
			plant_id: form.plant_id,
			system_id: form.system_id,
			system_asset: form.system_asset,
			system_asset_id: form.system_asset_id,
			system_asset_name: system_asset_name_post_data,
			system_lvl_5: system_lvl_5_post_data,
			asset_type: form.asset_type_id,
			system_lvl_6: form.sub_component_2,
			description: form.description,
			location: form.location,
			brand: form.brand,
			model_number: form.model_number,
			warranty: form.warranty,
			tech_specs: form.tech_specs,
			manufacture_country: form.manufacture_country,
			remarks: form.remarks,
			image: "",
			files : JSON.stringify({})

		}
	
		console.log(postData);
	
		fetch("/api/asset/addNewAsset", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(postData),
		});
		setSubmissionModal(true);
	}}
	// function vaidateForm(){

	// }
	return (<ModuleMain>
		<ModuleHeader header="New Asset"/>
		<ModuleContent includeGreyContainer grid>
			<div className={formStyles.halfContainer}>
				<div className="form-group">
				{/* for testing */}
				{/* <div>PlantID: {form.plant_id}</div>
				<div>SystemID: {form.system_id}</div>
					<div>SystemAssetID: {form.system_asset_id}</div>
					<div>SystemAsset: {form.system_asset}</div>
					<div>Asset type: {form.asset_type_id}</div>
					<div>SystemAssetNameOption: {form.system_asset_name}</div>
					<div>SystemAssetNameForm: {form.system_asset_name_form}</div>
					<div>Sub Component-1 Option: {form.sub_component_1}</div>
					<div>Sub Component-1 Form: {form.sub_component_1_form}</div>
					<div>Sub Component-2 Form: {form.sub_component_2}</div>
					<div>Description Form: {form.description}</div>
					<div>Location Form: {form.location}</div>
					<div>Brand Form: {form.brand}</div>
					<div>Model Number Form: {form.model_number}</div>
					<div>Warranty Form: {form.warranty}</div>
					<div>Tech Specs Form: {form.tech_specs}</div>
					<div>Manufacture Country Form: {form.manufacture_country}</div>
					<div>Remarks Form: {form.remarks}</div> */}


					<label className='form-label'>Plant<RequiredIcon/></label>
					<select className="form-select" onChange={handleForm} name='plant_id'>
						<option value="0" disabled hidden selected>-- Select Plant --</option>
						{
							props.plants.map(plant => <option key={plant.plant_id} value={plant.plant_id}>{plant.plant_name}</option>)
						}
					</select>
				</div>
				<div className="form-group">
					<label className='form-label'>System<RequiredIcon/></label>
					<select className="form-select" onChange={handleForm} name='system_id'>
						<option value="0" disabled hidden selected>-- Select System --</option>
						{
							props.systems.map(system => <option key={system.system_id} value={system.system_id}>{system.system_name}</option>)
						}
					</select>
				</div>
				<div className="form-group">
					<label className='form-label'>System Asset<RequiredIcon/></label>
					<select className="form-select" defaultValue={0} onChange={handleAssetNameSelect} name='system_asset_id'>
						<option value={0} disabled hidden>-- Select System Asset --</option>
						{
							(systemAssetData !== undefined) && systemAssetData.map(systemAsset => <option key={systemAsset.system_asset_id} value={systemAsset.system_asset_id}>{systemAsset.system_asset}</option>)
						}
					</select>
				</div>
				<div className="form-group">
					<label className='form-label'>Asset Type<RequiredIcon/></label>
					<select className="form-select" defaultValue={''} onChange={handleForm} name='asset_type_id'>
						<option value={''}>NA</option>
						{
							props.assetTypes.map(assetType => <option key={assetType.asset_type} value={assetType.asset_type}>{assetType.asset_type}</option>)
						}
					</select>
				</div>
				<div className="form-group">
					<label className='form-label'> System Asset Name<RequiredIcon/></label>
					<div className="input-group">
						<select className="form-select" defaultValue={''} disabled={!form.asset_type_id} onChange={handleForm} name='system_asset_name'>
						<option value={''} disabled hidden>-- Select System Asset Name--</option>
						{
							(systemAssetNameData !== undefined) && systemAssetNameData.map(systemAsset => <option key={systemAsset.system_asset_lvl6} value={systemAsset.system_asset_lvl6}>{systemAsset.system_asset_lvl6}</option>)
						}
						</select>
						<span className="input-group-text">or</span>
						<input type="text" className="form-control" onChange={handleForm} name='system_asset_name_form' placeholder="Enter New System Asset Name"/>
					</div>
				</div>
				<div className="form-group">
					<label className='form-label'> Sub-Components 1</label>
					<div className="input-group">
						<select className="form-select" defaultValue={0} disabled={!form.asset_type_id} onChange={handleForm} name='sub_component_1'>
						<option value={0} disabled hidden>-- Select Sub-Components 1--</option>
						{
							(subComponent1NameData !== undefined) && subComponent1NameData.map(systemAsset => <option key={systemAsset.system_asset_lvl7} value={systemAsset.system_asset_lvl7}>{systemAsset.system_asset_lvl7}</option>)
						}
						</select>
						<span className="input-group-text">or</span>
						<input type="text" className="form-control" onChange={handleForm} name='sub_component_1_form' placeholder="Enter New Sub-Component" disabled={!form.asset_type_id}/>
					</div>
				</div>
				<div className="form-group">
					<label className='form-label'>Sub-Components 2</label>
					<div className="input-group">
						
						<input onChange={handleForm} name='sub_component_2_form' type="text" className="form-control" placeholder="Enter New Sub-Component" disabled={!form.asset_type_id}/>
					</div>
				</div>
			</div>

			<div className={formStyles.halfContainer}>
				<div className="form-group">
					<label className='form-label'>Description</label>
					<input type="text" className="form-control" onChange={handleForm} name='description' placeholder="Enter Description"/>
				</div>

				<div className="form-group">
					<label className='form-label'> Location</label>
					<input type="text" className="form-control" onChange={handleForm} name='location' placeholder="Enter Location"/>
				</div>

				<div className="form-group">
					<label className='form-label'> Brand</label>
					<input type="text" className="form-control" onChange={handleForm} name='brand' placeholder="Enter Brand"/>
				</div>

				<div className="form-group">
					<label className='form-label'>Model Number</label>
					<input type="text" className="form-control" onChange={handleForm} name='model_number' placeholder="Enter Model Number"/>
				</div>

				<div className="form-group">
					<label className='form-label'>Warranty</label>
					<input type="text" className="form-control" onChange={handleForm} name='warranty' placeholder="Enter Warranty"/>
				</div>
				
				<div className="form-group">
					<label className='form-label'> Tech Specs</label>
					<input type="text" className="form-control" onChange={handleForm} name='tech_specs' placeholder="Enter Tech Specs"/>
				</div>

				<div className="form-group">
					<label className='form-label'>Manufacture Country</label>
					<input type="text" className="form-control" onChange={handleForm} name='manufacture_country' placeholder="Enter Country"/>
				</div>

				<div className="form-group">
					<label className='form-label'> Remarks</label>
					<input type="text" className="form-control" onChange={handleForm} name='remarks' placeholder="Enter Remarks"/>
				</div>
				<ModuleSimplePopup
        modalOpenState={isMissingDetailsModalOpen}
        setModalOpenState={setIsMissingDetailsModaOpen}
        title="Missing Details"
        text="Please ensure that you have filled in all the required entries."
        icon={SimpleIcon.Cross}
      />
	  			<ModuleSimplePopup
        modalOpenState={isMultipleEntries}
        setModalOpenState={setIsMultipleEntries}
        title="Multiple Entries Selected"
        text="Please ensure that you only fill the dropdown or form. DO NOT choose both."
        icon={SimpleIcon.Cross}
      />
	  			<ModuleSimplePopup
                modalOpenState={submissionModal}
                setModalOpenState={setSubmissionModal}
                title="Success!"
                text="Your inputs has been submitted!"
                icon={SimpleIcon.Check}
				buttons={
					<button
					  onClick={() => {
						setSubmissionModal(false);
						router.push("/Asset");
					  }}
					  className="btn btn-primary"
					>Ok</button>
				}
				buttons2={
					<button
					  onClick={() => {
						setSubmissionModal(false);
						router.reload();
					  }}
					  className="btn btn-primary"
					>Submit another asset</button>
				}
				onRequestClose={() => {router.push("/Asset");}}
            />
			</div>
		</ModuleContent>
		<ModuleFooter>
			<button className="btn btn-primary" onClick={submission}>Submit</button>
		</ModuleFooter>
	</ModuleMain>
	);
};

export const getServerSideProps: GetServerSideProps = async (
	context: GetServerSidePropsContext
) => {
	const headers = {
		withCredentials: true,
		headers: {
			Cookie: context.req.headers.cookie,
		},
	};

	const plants = await axios.get<CMMSPlant[]>("http://localhost:3001/api/getPlants", headers);
	const systems = await axios.get<CMMSSystem[]>("http://localhost:3001/api/asset/systems", headers);
	const asset_type = await axios.get<CMMSAssetType[]>("http://localhost:3001/api/asset/fetch_asset_types", headers);


	if(plants.status !== 200)		throw Error("Error getting plants");
	if(systems.status !== 200)		throw Error("Error getting systems");
	if(asset_type.status !== 200)	throw Error("Error getting asset_type");

	console.log(asset_type.data)

	let props: NewAssetProps = {
		plants: plants.data,
		systems: systems.data,
		assetTypes: asset_type.data
	};

	return {
		props: props,
	};
};