import formStyles from '../../styles/formStyles.module.css'
import axios from "axios";
import { GetServerSideProps, GetServerSidePropsContext } from "next";
import React, { useState } from "react";
import { ModuleContent, ModuleFooter, ModuleHeader, ModuleMain } from "../../components";
import AssetFormTemplate from "../../components/Asset/AssetFormTemplate";
import RequiredIcon from "../../components/RequiredIcon";
import { useSystemAsset, useSystemAssetName, useSubComponent1Name } from "../../components/SWR";
import { CMMSPlant, CMMSSystem, CMMSAssetType} from "../../types/common/interfaces";

interface NewAssetProps {
	plants: CMMSPlant[];
	systems: CMMSSystem[];
	assetTypes: CMMSAssetType[];
}

export default function NewAsset(props: NewAssetProps) {
	const [selectedPlantID, setSelectedPlantID] = useState<number>(0);
	const [selectedSystemID, setSelectedSystemID] = useState<number>(0);
	const [selectedAssetTypeID, setSelectedAssetTypeID] = useState<number>(0);
	const [selectedSystemAssetID, setSelectedSystemAssetID] = useState<number>(0);
	const [selectedSystemAssetNameID, setSelectedSystemAssetNameID] = useState<string>('');

	const {
		data: systemAssetData,
		error: systemAssetError,
		isValidating: systemAssetIsValidating,
		mutate: systemAssetMutate
	} = useSystemAsset(selectedSystemID === 0 ? null : selectedSystemID);

	const {
		data: systemAssetNameData,
		error: systemAssetNameError,
		isValidating: systemAssetNameIsValidating,
		mutate: systemAssetNameMutate
	} = useSystemAssetName(selectedPlantID === 0 ? null :selectedPlantID, selectedSystemID === 0 ? null : selectedSystemID, selectedSystemAssetID=== 0 ? null :selectedSystemAssetID);

	const {
		data: subComponent1NameData,
		error: subComponent1NameError,
		isValidating: ssubComponent1NameIsValidating,
		mutate: subComponent1NameMutate
	} = useSubComponent1Name(selectedPlantID === 0 ? null :selectedPlantID, selectedSystemID === 0 ? null : selectedSystemID, selectedSystemAssetID=== 0 ? null :selectedSystemAssetID, selectedSystemAssetNameID === '' ? null : selectedSystemAssetNameID );
	
	const handlePlantSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
		setSelectedPlantID(parseInt(e.target.value));
	}

	const handleSystemSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
		setSelectedSystemID(parseInt(e.target.value));
	}

	const handleAssetTypeSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
		setSelectedAssetTypeID(parseInt(e.target.value));
	}

	const handleAssetNameSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
		setSelectedSystemAssetID(parseInt(e.target.value));
	}
	const handleSelectedSystemAssetName = (e: React.ChangeEvent<HTMLSelectElement>) => {
		setSelectedSystemAssetNameID(e.target.value);
	}

	return (<ModuleMain>
		<ModuleHeader header="New Asset"/>
		<ModuleContent includeGreyContainer grid>
			<div className={formStyles.halfContainer}>
				<div className="form-group">
				<div>PlantID: {selectedPlantID}</div>
				<div>SystemID: {selectedSystemID}</div>
					<div>SystemAssetNameID: {selectedSystemAssetID}</div>
					<div>Asset type: {selectedAssetTypeID}</div>
					<div>SystemAssetName: {selectedSystemAssetNameID}</div>
					<label className='form-label'><RequiredIcon/> Plant</label>
					<select className="form-select" onChange={handlePlantSelect}>
						<option value="0" disabled hidden selected>-- Select Plant --</option>
						{
							props.plants.map(plant => <option key={plant.plant_id} value={plant.plant_id}>{plant.plant_name}</option>)
						}
					</select>
				</div>
				<div className="form-group">
					<label className='form-label'><RequiredIcon/> System</label>
					<select className="form-select" onChange={handleSystemSelect}>
						<option value="0" disabled hidden selected>-- Select System --</option>
						{
							props.systems.map(system => <option key={system.system_id} value={system.system_id}>{system.system_name}</option>)
						}
					</select>
				</div>
				<div className="form-group">
					<label className='form-label'><RequiredIcon/> System Asset</label>
					<select className="form-select" defaultValue={0} disabled={systemAssetData === undefined} onChange={handleAssetNameSelect}>
						<option value={0} disabled hidden>-- Select System Asset --</option>
						{
							(systemAssetData !== undefined) && systemAssetData.map(systemAsset => <option key={systemAsset.system_asset_id} value={systemAsset.system_asset_id}>{systemAsset.system_asset}</option>)
						}
					</select>
				</div>
				<div className="form-group">
					<label className='form-label'><RequiredIcon/> Asset Type</label>
					<select className="form-select" defaultValue={0} onChange={handleAssetTypeSelect}>
						<option value={0}>NA</option>
						{
							props.assetTypes.map(assetType => <option key={assetType.asset_id} value={assetType.asset_id}>{assetType.asset_type}</option>)
						}
					</select>
				</div>
				<div className="form-group">
					<label className='form-label'><RequiredIcon/> System Asset Name</label>
					<div className="input-group">
						<select className="form-select" defaultValue={0} disabled={!selectedAssetTypeID} onChange={handleSelectedSystemAssetName}>
						<option value={0} disabled hidden>-- Select System Asset Name--</option>
						{
							(systemAssetNameData !== undefined) && systemAssetNameData.map(systemAsset => <option key={systemAsset.system_asset_lvl6} value={systemAsset.system_asset_lvl6}>{systemAsset.system_asset_lvl6}</option>)
						}
						</select>
						<span className="input-group-text">or</span>
						<input type="text" className="form-control" placeholder="Enter New System Asset Name"/>
					</div>
				</div>
				<div className="form-group">
					<label className='form-label'><RequiredIcon/> Sub-Components 1</label>
					<div className="input-group">
						<select className="form-select" defaultValue={0} disabled={!selectedAssetTypeID}>
						<option value={0} disabled hidden>-- Select Sub-Components 1--</option>
						{
							(subComponent1NameData !== undefined) && subComponent1NameData.map(systemAsset => <option key={systemAsset.system_asset_lvl7} value={systemAsset.system_asset_lvl7}>{systemAsset.system_asset_lvl7}</option>)
						}
						</select>
						<span className="input-group-text">or</span>
						<input type="text" className="form-control" placeholder="Enter New Sub-Component" disabled={!selectedAssetTypeID}/>
					</div>
				</div>
				<div className="form-group">
					<label className='form-label'><RequiredIcon/> Sub-Components 2</label>
					<div className="input-group">
						
						<input type="text" className="form-control" placeholder="Enter New Sub-Component" disabled={!selectedAssetTypeID}/>
					</div>
				</div>
			</div>

			<div className={formStyles.halfContainer}>
				<div className="form-group">
					<label className='form-label'><RequiredIcon/> Description</label>
					<input type="text" className="form-control" placeholder="Enter Description"/>
				</div>

				<div className="form-group">
					<label className='form-label'><RequiredIcon/> Location</label>
					<input type="text" className="form-control" placeholder="Enter Location"/>
				</div>

				<div className="form-group">
					<label className='form-label'><RequiredIcon/> Brand</label>
					<input type="text" className="form-control" placeholder="Enter Brand"/>
				</div>

				<div className="form-group">
					<label className='form-label'><RequiredIcon/> Model Number</label>
					<input type="text" className="form-control" placeholder="Enter Model Number"/>
				</div>

				<div className="form-group">
					<label className='form-label'><RequiredIcon/> Warranty</label>
					<input type="text" className="form-control" placeholder="Enter Warranty"/>
				</div>
				
				<div className="form-group">
					<label className='form-label'><RequiredIcon/> Tech Specs</label>
					<input type="text" className="form-control" placeholder="Enter Tech Specs"/>
				</div>

				<div className="form-group">
					<label className='form-label'><RequiredIcon/> Manufacture Country</label>
					<input type="text" className="form-control" placeholder="Enter Country"/>
				</div>

				<div className="form-group">
					<label className='form-label'><RequiredIcon/> Remarks</label>
					<input type="text" className="form-control" placeholder="Enter Remarks"/>
				</div>
			</div>
		</ModuleContent>
		<ModuleFooter>
			<button className="btn btn-primary">Submit</button>
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