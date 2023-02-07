
import { CompactTable } from '@table-library/react-table-library/compact';

import { useTheme } from '@table-library/react-table-library/theme';
import { getTheme } from '@table-library/react-table-library/baseline';

import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import { ModuleMain, ModuleHeader, ModuleContent } from '../../components'
import { Nullish } from '@table-library/react-table-library/types/common';
import useSWR from 'swr';
import axios from 'axios';

type TableNode<T> = {
    id: string;
    nodes?: TableNode<T>[] | Nullish;
    prop: T;
};

interface CMMSMaster<T> {
	getID: Function;
	basicInfo: T;
}

interface CMMSMasterPlant {
	plant_id: number;
	plant_name: string;
	plant_description: string;
}

interface CMMSMasterSystem {
	system_id: number;
	system_name: string;
}

interface CMMSMasterFaultType {
	fault_id: number;
	fault_type: string;
}

interface CMMSMasterAssetType {
	asset_id: number;
	asset_type: string;
}

const indexedColumn = [
	"plant",
	"system",
	"fault_type",
	"asset_type"
]

const ExtraColumns: any = {
	plant: [
		{ label: 'Name',			resize: true, renderCell: (item: TableNode<CMMSMaster<CMMSMasterPlant>>) => item.prop.basicInfo.plant_name },
		{ label: 'Description',		resize: true, renderCell: (item: TableNode<CMMSMaster<CMMSMasterPlant>>) => item.prop.basicInfo.plant_description },
	],
	system: [
		{ label: 'Name',			resize: true, renderCell: (item: TableNode<CMMSMaster<CMMSMasterPlant>>) => item.prop.basicInfo.plant_name },
	],
	fault_type: [
		{ label: 'Fault Type',		resize: true, renderCell: (item: TableNode<CMMSMaster<CMMSMasterFaultType>>) => item.prop.basicInfo.fault_type }
	],
	asset_type: [
		{ label: 'Asset Type',		resize: true, renderCell: (item: TableNode<CMMSMaster<CMMSMasterAssetType>>) => item.prop.basicInfo.asset_type }
	]
}

function useMaster(type: string) {
	interface CMMSMasterInfo {
		rows: CMMSMasterPlant[]|CMMSMasterSystem[]|CMMSMasterAssetType[]|CMMSMasterFaultType[];
		fields: string[];
	}

	const requestFetcher = (url: string) => axios.get<CMMSMasterInfo>(url + type).then((response) => {
		let getID:Function = () => {};

		if(type === "plant")
			getID = (x: CMMSMasterPlant) => {x.plant_id}
		else if(type === "system")
			getID = (x: CMMSMasterSystem) => {x.system_id}
		else if(type === "fault_type")
			getID = (x: CMMSMasterFaultType) => {x.fault_id}
		else if(type === "asset_type")
			getID = (x: CMMSMasterAssetType) => {x.asset_id}

		console.log(response)

		let info: CMMSMaster<any>[] = 
			response.data.rows.map((row) => {
				return {
					getID,
					basicInfo: row
				}
			})

		return info;
	})
	.catch((e) => {
		console.log("error getting requests")
		console.log(e);
		throw new Error(e);
	});

	return useSWR<CMMSMaster<any>[], Error>(["/api/master/", type], requestFetcher, {revalidateOnFocus: false});
}

const MasterActions = () => {
	return <span>Action</span>
}

export default function Master() {
	const [activeTabIndex, setActiveTabIndex] = useState<number>(0)
	const [COLUMNS, setCOLUMNS] = useState<any[]>([]);
	const [masterNodes, setMasterNodes] = useState<TableNode<CMMSMaster<CMMSMasterSystem|CMMSMasterFaultType|CMMSMasterAssetType|CMMSMasterPlant>>[]>([])
	const [columnSizes, setColumnSizes] = useState("4em 20% calc(80% - 10em) 6em;");

	const {
		data,
		error,
		isValidating,
		mutate
	} = useMaster(indexedColumn[activeTabIndex]);

	const theme = useTheme([
		getTheme(),
		{
			Table: "--data-table-library_grid-template-columns:  " + columnSizes,
			HeaderRow: `
				background-color: #eaf5fd;
			`,
			Row: `
				&:nth-of-type(odd) {
					background-color: #d2e9fb;
				}

				&:nth-of-type(even) {
					background-color: #eaf5fd;
				}
			`,
		},
	]);

	const switchColumns = (index: number) => {
		setActiveTabIndex(index);

		setCOLUMNS([
			{ label: 'ID',					renderCell: (item: TableNode<CMMSMaster<any>>) => item.prop.getID(item.prop.basicInfo) },
			...ExtraColumns[indexedColumn[index]],
			{ label: 'Actions',				resize: true, renderCell: () => <MasterActions/> },
		]);
	};

	useEffect(() => {
		switchColumns(0);
	}, [])

	useEffect(() => {
		let len = (COLUMNS.length) - 2
		let sizes = "";
		for(let i=0;i<len;i++)
			sizes += "calc(" + 100/len + "% - 10em) "
		setColumnSizes("4em " + sizes + "6em;")

		console.log("4em " + sizes + "6em;")
	}, [COLUMNS])

	useEffect(() => {
		if(data && !isValidating) {
			console.log(data)
			setMasterNodes(
				data.map((row): TableNode<CMMSMaster<any>> => {
					console.log(row);
					return {
						id: row.getID(row.basicInfo),
						prop: row
					}
				})
			);
		}

	}, [data, isValidating])

  	return <ModuleMain>
			<ModuleHeader title="Master" header="Master Tables">
				<Link href="./Master/New" className="btn btn-primary">New Entry</Link>
			</ModuleHeader>
			{COLUMNS.toString()}
			<ModuleContent>
				<ul className="nav nav-tabs">
					<li onClick={() => {switchColumns(0)}} className={"nav-link" + ((activeTabIndex === 0) ? " active" : "" )}> <span style={{all:"unset"}} >Plant</span></li>
					<li onClick={() => {switchColumns(1)}} className={"nav-link" + ((activeTabIndex === 1) ? " active" : "" )}> <span style={{all:"unset"}} >System</span></li>
					<li onClick={() => {switchColumns(2)}} className={"nav-link" + ((activeTabIndex === 2) ? " active" : "" )}> <span style={{all:"unset"}} >Fault Types</span></li>
					<li onClick={() => {switchColumns(3)}} className={"nav-link" + ((activeTabIndex === 3) ? " active" : "" )}> <span style={{all:"unset"}} >Asset Types</span></li>
				</ul>
				<CompactTable columns={COLUMNS} data={{nodes: masterNodes}} theme={theme} layout={{custom: true}}/>
			</ModuleContent>
		</ModuleMain>
}