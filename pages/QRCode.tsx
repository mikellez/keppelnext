import formStyles from '../styles/formStyles.module.css'
import styles from '../styles/QRCode.module.css'

import React, { useState, useRef } from 'react'

import { ModuleMain, ModuleHeader, ModuleContent, ModuleFooter, ModuleDivider } from '../components/';
import { useAsset } from '../components/SWR';
import { useQRCode } from 'next-qrcode';
import { CMMSAsset } from '../types/common/interfaces';

function saveSvg(svgEl: SVGSVGElement, name: string) {
	svgEl.setAttribute("xmlns", "http://www.w3.org/2000/svg");
	var svgData = svgEl.outerHTML;
	var preface = '<?xml version="1.0" standalone="no"?>\r\n';
	var svgBlob = new Blob([preface, svgData], {type:"image/svg+xml;charset=utf-8"});
	var svgUrl = URL.createObjectURL(svgBlob);
	var downloadLink = document.createElement("a");
	downloadLink.href = svgUrl;
	downloadLink.download = name;
	document.body.appendChild(downloadLink);
	downloadLink.click();
	document.body.removeChild(downloadLink);
}

function QRImg({asset}: {asset: CMMSAsset}) {
	const { SVG } = useQRCode();

	function downloadQR(e: React.MouseEvent<HTMLButtonElement>) {
		const svg = e.currentTarget.querySelector("svg");

		if(!svg)
			return;

		saveSvg(svg, asset.asset_name + ".svg")
	}

	return (
		<button className={"btn btn-secondary " + styles.btnQr} onClick={downloadQR}>
			<SVG 
				text={window.location.origin + "/Asset/Details/" + asset.psa_id}
				options={{
					level: 'H',
					margin: 0,
					scale: 5,
					width: 150,
					color: {
						dark: '#000000',
						light: '#ffffff',
					}
				}}
			/>
			<div className={styles.label}>{asset.asset_name}</div>
		</button>
	)
}

function QRCode() {
	const [selectedPlant, setSelectedPlant] = useState<number|null>(null)
	const [selectedAssets, setSelectedAssets] = useState<CMMSAsset[]>([]);
	
	const qrRef = useRef() as React.RefObject<HTMLDivElement>

	const {
		data,
		error,
		isValidating,
		mutate
 	} = useAsset(selectedPlant);

	function assetSelect(e: React.ChangeEvent<HTMLSelectElement>) {
		if(data)
			setSelectedAssets(Array.from(e.target.options).filter(o => o.selected).map(o => data[parseInt(o.value)]))
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
								data && data.map((asset, i) => <option key={asset.psa_id} value={i}>{asset.asset_name}</option>)
							}
						</select>
					</div>
				</div>
			</ModuleContent>

			<ModuleContent>
				<div className={styles.qrList} ref={qrRef}>
					{
						selectedAssets.map((asset) => {
							return (
								<QRImg key={asset.psa_id} asset={asset}/>
							)
						})
					}
				</div>
			</ModuleContent>
		</ModuleMain>
	)
}

export default QRCode;
