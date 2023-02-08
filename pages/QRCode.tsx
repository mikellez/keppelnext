import formStyles from '../styles/formStyles.module.css'

import React, { useState } from 'react'
import axios from 'axios';

import { ModuleMain, ModuleHeader, ModuleContent, ModuleFooter } from '../components/';
import { useAsset } from '../components/SWR';

function QRCode() {
	const [selectedPlant, setSelectedPlant] = useState<number|null>(null)
	const [selectedAssetIds, setSelectedAssetIds] = useState<number[]>([]);

	const {
		data,
		error,
		isValidating,
		mutate
 	} = useAsset(selectedPlant);

	const generateQR = () => {
        alert("selected values: " + selectedAssetIds.toString());
    }

	function assetSelect(e: React.ChangeEvent<HTMLSelectElement>) {
		setSelectedAssetIds(Array.from(e.target.options).filter(o => o.selected).map(o => parseInt(o.value)))
	}

	return (
		<ModuleMain>
			<ModuleHeader title="QRCode" header="Generate QR Codes"></ModuleHeader>
			<ModuleContent includeGreyContainer grid>
				<div className={formStyles.halfContainer}>
					<div className="form-group">
						<label className='form-label'>Plant Location:</label>
						<select className="form-select" required onChange={(e) => {setSelectedPlant(parseInt(e.target.value))}}>
							<option value="" hidden>-- Please Select a Plant --</option>
							<option value="2">Woodlands DHCS</option>
							<option value="3">Biopolis</option>
							<option value="4">Mediapolis</option>
							<option value="1">Changi DHCS</option>
						</select>
					</div>
					<br/>
				</div>
				<div className={formStyles.halfContainer}>
					<div className="form-group">
						<label className="form-label">Assets:</label>
						<select className="form-select" multiple style={{height: "14em"}} onChange={assetSelect}>
							{
								data && data.map((asset) => <option key={asset.psa_id} value={asset.psa_id}>{asset.asset_name}</option>)
							}
						</select>
					</div>
				</div>
			</ModuleContent>
			<ModuleFooter>
				<button className="btn btn-primary" onClick={generateQR}>Generate QR Code</button>
			</ModuleFooter>
		</ModuleMain>
	)
}

export default QRCode;
