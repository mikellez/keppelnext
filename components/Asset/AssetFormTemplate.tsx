import formStyles from '../../styles/formStyles.module.css'
import React, { useEffect, useState } from 'react';
import { ModuleMain, ModuleContent, ModuleHeader, ModuleFooter } from '../index';
import Link from 'next/link';
import TooltipBtn from '../TooltipBtn';
import PlantSelect from '../PlantSelect';
import RequiredIcon from '../RequiredIcon';
import AssetTypeSelect from './AssetTypeSelect';
import SystemSelect from './SystemSelect';
import SystemAsset from './SelectSystemAsset';
import axios from 'axios';
import { useRouter } from "next/router";
import { CMMSAsset, CMMSAssetDetails, CMMSAssetDetailsState } from '../../types/common/interfaces';
import ModuleSimplePopup, { SimpleIcon } from '../ModuleLayout/ModuleSimplePopup';

interface AssetFormTemplateProps {
    header: string;
}    

const getAsset = async (id: number) => {
    const url =  "/api/assetDetails/" 
    return await axios
        .get(url + id)
        .then((res) => {
			// console.log(res.data)
            return res.data;
        })
        .catch((err) => {
            console.log(err.response);
            return err.response.status;
        });
};



export default function AssetFormTemplate(props: AssetFormTemplateProps) {
	const [assetDetail, setAssetDetail] = useState<CMMSAssetDetails>({} as CMMSAssetDetails);
	const router = useRouter();
	const psa_id: string = router.query.id as string;
	const [submissionModal, setSubmissionModal] = useState<boolean>(false);
	const [confirmModal, setconfirmModal] = useState<boolean>(false);
	const [deleteModal, setdeleteModal] = useState<boolean>(false);

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

	//Function to get value of fields
	const handleAssetNameSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
		setform((prevState) => {return{...prevState,[e.target.name]:e.target.value,system_asset:e.target.options[e.target.selectedIndex].text}});
	}
	
	//Function to get name of fields
	const handleForm = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {	
		setform((prevState) => {return{...prevState,[e.target.name]:e.target.value}});
	}
	function handledeleteModal() {
		setdeleteModal(true);
	}

	function deletion() {
		let postData: {
	} = {
		psa_id: psa_id
	}
	console.log(postData);

		// if confirmmodal true, allow delete
		fetch("/api/asset/deleteAsset", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(postData),
		});
	
		//open modal to show success
	}
	function submission() {
	
		//if no errors, submit form		
		//post data
		let postData: {
			plant_id: number;
			system_id: number;
			system_asset: string;
			system_asset_id: number;
			system_asset_name: string;
			system_lvl_5: string;
			[key: string]: string | number;
		} = {
			psa_id: psa_id,
			plant_id: form.plant_id,
			system_id: form.system_id,
			system_asset: form.system_asset,
			system_asset_id: form.system_asset_id,
			system_asset_name: form.system_asset_name,
			system_lvl_5: form.sub_component_1,
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
	    //post data to API
		fetch("/api/asset/editAsset", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(postData),
		});
		//open modal to show success
		setSubmissionModal(true);
	}
	
	useEffect (() => {
	getAsset(parseInt(psa_id as string)).then(result =>  {
		if (!result[0].system_asset_lvl5) {
			setAssetDetail({
					...result[0],
					system_asset_lvl5: result[0].asset_name,
					asset_name: ""
			})
		}
		else if (!result[0].system_asset_lvl6) {
			setAssetDetail({
					...result[0],
					system_asset_lvl6: result[0].asset_name,
					asset_name: ""
				
			})

		}
		else if (!result[0].system_asset_lvl7) {
			setAssetDetail({
					...result[0],
					system_asset_lvl7: result[0].asset_name,
					asset_name: ""
				
			})
		}
		})
	},[])

	console.log(assetDetail)

	


    return (
        <ModuleMain>
				<ModuleHeader header={props.header}>
            </ModuleHeader>
			<ModuleContent includeGreyContainer grid>
			<div className={formStyles.halfContainer}>
				<div className="form-group">
					
					<label className='form-label'>Plant<RequiredIcon/></label>
					<select className="form-control" disabled onChange={handleForm} name='plant_id'>
						<option value="{assetDetail.plant_name}" disabled hidden selected>{assetDetail.plant_name}</option>
						
					</select>
				</div>
				<div className="form-group">
					<label className='form-label'>System<RequiredIcon/></label>
					<select className="form-control" name='system_id' disabled onChange={handleForm}>
						<option value="{assetDetail.system_name}" disabled hidden selected>{assetDetail.system_name}</option>
					</select>
				</div>
				<div className="form-group">
					<label className='form-label'>System Asset<RequiredIcon/></label>
					<select className="form-control"  name='system_asset_id' disabled onChange={handleAssetNameSelect}>
						<option value="{assetDetail.system_asset_lvl5}" disabled hidden selected>{assetDetail.system_asset_lvl5}</option>
					</select>
				</div>
				<div className="form-group">
					<label className='form-label'>Asset Type<RequiredIcon/></label>
					<select className="form-control" name='asset_type_id' disabled onChange={handleForm}>
						<option value="{assetDetail.asset_type}">{assetDetail.asset_type}</option>
					</select>
				</div>
				<div className="form-group">
					<label className='form-label'> System Asset Name<RequiredIcon/></label>
					<div className="input-group">
						<select className="form-control" name='system_asset_name' disabled onChange={handleForm}>
						<option value="{assetDetail.system_asset_lvl6}" disabled hidden selected>{assetDetail.system_asset_lvl6}</option>
						
						</select>
						</div>
				</div>
				<div className="form-group">
					<label className='form-label'> Sub-Components 1</label>
					<div className="input-group">
						<select className="form-control" name='sub_component_1' disabled onChange={handleForm} >
						<option value="{assetDetail.system_asset_lvl7}" disabled hidden selected>{assetDetail.system_asset_lvl7}</option>
						
						</select>
						</div>
				</div>
				<div className="form-group">
					<label className='form-label'>Sub-Components 2</label>
					<div className="input-group">
					<select className="form-control" name='sub_component_2' disabled onChange={handleForm} >
						<option value="{assetDetail.asset_name}" disabled hidden selected>{assetDetail.asset_name}</option>
						</select>
						</div>
				</div>
			</div>

			<div className={formStyles.halfContainer}>
				<div className="form-group">
					<label className='form-label'>Description</label>
					<input type="text" className="form-control"  onChange={handleForm} name='description' placeholder="Enter Description" defaultValue={assetDetail.asset_description}/>
				</div>

				<div className="form-group">
					<label className='form-label'> Location</label>
					<input type="text" className="form-control"  onChange={handleForm} name='location' placeholder="Enter Location" defaultValue={assetDetail.asset_location}/>
				</div>

				<div className="form-group">
					<label className='form-label'> Brand</label>
					<input type="text" className="form-control"onChange={handleForm}  name='brand' placeholder="Enter Brand" defaultValue={assetDetail.brand}/>
				</div>

				<div className="form-group">
					<label className='form-label'>Model Number</label>
					<input type="text" className="form-control" onChange={handleForm}  name='model_number' placeholder="Enter Model Number" defaultValue={assetDetail.model_number}/>
				</div>

				<div className="form-group">
					<label className='form-label'>Warranty</label>
					<input type="text" className="form-control" onChange={handleForm} name='warranty' placeholder="Enter Warranty" defaultValue={assetDetail.warranty}/>
				</div>
				
				<div className="form-group">
					<label className='form-label'> Tech Specs</label>
					<input type="text" className="form-control" onChange={handleForm} name='tech_specs' placeholder="Enter Tech Specs" defaultValue={assetDetail.technical_specs}/>
				</div>

				<div className="form-group">
					<label className='form-label'>Manufacture Country</label>
					<input type="text" className="form-control" onChange={handleForm} name='manufacture_country' placeholder="Enter Country" defaultValue={assetDetail.manufacture_country}/>
				</div>

				<div className="form-group">
					<label className='form-label'> Remarks</label>
					<input type="text" className="form-control" onChange={handleForm} name='remarks' placeholder="Enter Remarks" defaultValue={assetDetail.remarks}/>
				</div>
			</div>
			<ModuleSimplePopup
                modalOpenState={submissionModal}
                setModalOpenState={setSubmissionModal}
                title="Success!"
                text="Your inputs have been submitted!"
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
				onRequestClose={() => {router.push("/Asset");}}
            />
			<ModuleSimplePopup
                modalOpenState={deleteModal}
                setModalOpenState={setdeleteModal}
                title="Are You Sure?"
                text="The whole entity will be deleted!				"
                icon={SimpleIcon.Check}
				buttons={
					
					<button onClick={() => {
						deletion();
						setdeleteModal(false);
						// route back to assets
						router.push("/Asset")
					  }}
					  className="btn btn-primary"
					>Confirm</button>
				}
				buttons2={
					<button className="btn btn-primary"
					onClick={() => {
						setdeleteModal(false);
					}}>Cancel</button>

				}

				onRequestClose={() => {router.push("/Asset");}}
            />
			</ModuleContent>
			<ModuleFooter>
			<button className="btn btn-primary" onClick={handledeleteModal}>Delete</button>
			<Link href={{ pathname: '/Asset/Details/[id]', query: { id: psa_id } }} > 
            <button className= "btn" style={{backgroundColor: "grey", color: "white"}}>Back </button> </Link>				
			<button className="btn" style={{backgroundColor: "green", color: "white"}}onClick={submission}>Submit</button>
			</ModuleFooter>
		</ModuleMain>
    );
};

