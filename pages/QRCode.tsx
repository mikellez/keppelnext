import styles from '../styles/QRCode.module.css'

import Head from 'next/head'
import React, { useState, useRef } from 'react'
import axios from 'axios';

import ModuleMain from '../components/ModuleMain';

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
	const [plantOptions, setPlantOptions] = useState<JSX.Element[]>([]);
	const selectedAssets = useRef<string[]>([]);

	function updateAssetLists(plant_id : number)
	{
		let options: JSX.Element[] = [];

		getAssets(plant_id).then((d) => {
			if(d === null)
			{
				console.log("assets null")
				return;
			}

			for(let a of d)
				options.push(<option key={a.psa_id.toString() + a.asset_name} value={a.psa_id}>{a.asset_name}</option>);

			setPlantOptions(options);
		});
	}

	const plantChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		updateAssetLists(parseInt(e.target.value));
	};

	const assetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		selectedAssets.current = (Array.from(e.target.options).filter(o => o.selected).map(o => o.value));
		console.log(selectedAssets.current);
	};

	const generateQR = () => {
		alert("selected values: " + selectedAssets.current.toString());
	};

	return (
		<ModuleMain title="QRCode" header="Generate QR Code">
			<div className={styles.halfContainer}>
				<div className="form-group">
					<label className='form-label'>Plant Location:</label>
					<select className="form-control" required onChange={plantChange}>
						<option value="" hidden>--Please Select a Plant--</option>
						<option value="2">Woodlands DHCS</option>
						<option value="3">Biopolis</option>
						<option value="4">Mediapolis</option>
						<option value="1">Changi DHCS</option>
					</select>
				</div>
				<br/>
				<button className="btn btn-warning" onClick={generateQR}>Generate QR Code</button>
			</div>
			<div className={styles.halfContainer}>
				<div className="form-group">
					<label className="form-label">Assets:</label>
					<select className="form-control" name="assetList" multiple={true} onChange={assetChange} style={{height:"300px"}}>
						{plantOptions}
					</select>
				</div>
			</div>
		</ModuleMain>
	)
}

export default QRCode;
