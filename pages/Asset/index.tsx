import React, { useEffect, useState } from 'react';
import { ModuleMain, ModuleHeader, ModuleContent } from '../../components';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import TooltipBtn from '../../components/TooltipBtn';
import { RiFileAddLine } from 'react-icons/ri';
import Link from 'next/link';
import axios from 'axios';

const getAssets = async () => {
	return await axios.get("/api/asset")
		.then(res => {
			return res.data;
		})
		.catch(err => {
			console.log(err);
		});
};

const Asset = () => {
	const [rowData, setRowData] = useState(); // Set rowData to Array of Objects, one Object per Row
	// Each Column Definition results in one Column.
	const [columnDefs, setColumnDefs] = useState([
		{
			field: "plant_name",
			hide: true,
			rowGroup: true,
		},
		{
			field: "system_name",
			hide: true,
			rowGroup: true,
		},
		{
			field: "system_asset",
			hide: true,
			rowGroup: true,
			valueGetter: function (params) {
				if (params.data.system_name != params.data.system_asset) {
					return params.data.system_asset;
				} else {
					return null;
				}
			},
		},
		//if parent asset same as system asset add the tagname else show parent
		{
			field: "parent_asset",
			hide: true,
			rowGroup: true,
			valueGetter: function (params) {
				if (params.data.parent_asset != params.data.asset_type) {
					//then return
					return params.data.parent_asset;
				} else {
					return null;
				}
			},
		},
	
		{
			field: "psa.system_asset_lvl5",
			hide: true,
			rowGroup: true,
			valueGetter: function (params) {
				if (params.data.system_asset_lvl5 != "") {
					if (params.data.system_asset_lvl5 != params.data.parent_asset) {
						return params.data.system_asset_lvl5;
					} else {
						return null;
					}
				}
			},
		},
		{
			field: "psa.system_asset_lvl6",
			hide: true,
			rowGroup: true,
			valueGetter: function (params) {
				if (params.data.system_asset_lvl6 != "") {
					if (params.data.system_asset_lvl6 != params.data.parent_asset) {
						return params.data.system_asset_lvl6;
					} else {
						return null;
					}
				}
			},
		},
	
		{
			field: "psa.system_asset_lvl7",
			hide: true,
			rowGroup: false,
		},
	
		{
			headerName: "Tag Name",
			field: "plant_asset_instrument",
			rowGroup: false,
		},
		{
			headerName: "Description",
			field: "asset_description",
		},
		{
			headerName: "Location",
			field: "asset_location",
		},
		{
			headerName: "Brand",
			field: "brand",
		},
		{
			headerName: "Model Number",
			field: "model_number",
		},
		{
			headerName: "Capacity",
			field: "technical_specs",
		},
		{
			headerName: "Country of Manafacture",
			field: "manufacture_country",
		},
		{
			headerName: "Warranty",
			field: "warranty",
		},
		{
			headerName: "Remarks",
			field: "remarks",
		},
	  ]);

	useEffect(() => {
		getAssets().then(data => {
			setRowData(data)
		})
	})

  	return (
		<ModuleMain>
			<ModuleHeader header="Asset Management" >
				<Link href="/Asset/New">
					<TooltipBtn text="Create new asset"><RiFileAddLine size={20} /></TooltipBtn>
				</Link>
			</ModuleHeader>
			<ModuleContent>
			<div className="ag-theme-alpine" style={{ height: 500, width: "100%" }}>
				<AgGridReact
					rowData={rowData}
					columnDefs={columnDefs}>
				</AgGridReact>
			</div>
			</ModuleContent>
		</ModuleMain>
  	);
};

export default Asset;