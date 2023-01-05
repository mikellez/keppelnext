import formStyles from '../styles/formStyles.module.css'

import React, { useState, useRef } from 'react'
import axios from 'axios';

import { ModuleMain, ModuleHeader, ModuleContent } from '../components/';
import { QRAssetSelect, QRAssetSelectOption } from '../components/QR/QRAssetSelect';
import QRPlantSelect from '../components/QR/QRPlantSelect';

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

function QRCode() {
	const [plantOptions, setPlantOptions] = useState<QRAssetSelectOption[]>([]);
	const [selectedAssetIds, setSelectedAssetIds] = useState<number[]>([]);

	function updateAssetLists(plant_id : number)
	{
		let options: QRAssetSelectOption[] = [];

		getAssets(plant_id).then((data) => {
			if(data === null)
				return console.log("assets null");

			for(let asset of data)
				options.push({
					key: asset.psa_id.toString() + asset.asset_name,
					value: asset.psa_id,
					text: asset.asset_name
				});

			setPlantOptions(options);
		});
	}

	const plantChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		updateAssetLists(parseInt(e.target.value));
	};

	const generateQR = () => {
        alert("selected values: " + selectedAssetIds.toString());
    }

	return (
		<ModuleMain>
			<ModuleHeader title="QRCode" header="Generate QR Codes"></ModuleHeader>
			<ModuleContent includeGreyContainer grid>
				<div className={formStyles.halfContainer}>
					<div className="form-group">
						<label className='form-label'>Plant Location:</label>
						<QRPlantSelect onSelect={plantChange}/>
					</div>
					<br/>
					<button className="btn btn-primary" onClick={generateQR}>Generate QR Code</button>
				</div>
				<div className={formStyles.halfContainer}>
					<div className="form-group">
						<label className="form-label">Assets:</label>
						<QRAssetSelect options={plantOptions} onSelect={setSelectedAssetIds}/>
					</div>
				</div>
			</ModuleContent>
		</ModuleMain>
	)
}

export default QRCode;
