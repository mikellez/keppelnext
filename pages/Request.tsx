

import React, { useState, useEffect } from 'react'
import ModuleMain from '../components/ModuleMain'
import ModuleContent from '../components/ModuleContent';
import ModuleHeader from '../components/ModuleHeader';

import { CompactTable } from '@table-library/react-table-library/compact';
import { TableNode } from '@table-library/react-table-library/types/table';
import { useTheme } from '@table-library/react-table-library/theme';
import { getTheme } from '@table-library/react-table-library/baseline';

import axios from 'axios';

interface Requests extends TableNode {
	request_id: string;
	created_date: Date;
	fullname: string;
	fault_name: string;
	asset_name: string;
	plant_name: string;
	priority: string;
	status: string;
	nodes?: Requests[] | null;
}

const COLUMNS: any[] = [
	{ label: 'ID',					resize: true, renderCell: (item: Requests) => item.request_id },
	{ label: 'Fault Type',			resize: true, renderCell: (item: Requests) => item.fault_name },
	{ label: 'Location',			resize: true, renderCell: (item: Requests) => item.plant_name },
	{ label: 'Priority',			resize: true, renderCell: (item: Requests) => item.priority == null ? "-" : item.priority },
	{ label: 'Status',				resize: true, renderCell: (item: Requests) => item.status },
	{ label: 'Filter By Date',		resize: true, renderCell: (item: Requests) =>
		item.created_date.toLocaleDateString('en-US', {
		  year: 'numeric',
		  month: '2-digit',
		  day: '2-digit',
		}),
	},
	{ label: 'Asset Name',			resize: true, renderCell: (item: Requests) => item.asset_name },
	{ label: 'Requested By',		resize: true, renderCell: (item: Requests) => item.fullname }
];

async function getRequests() {
	return await axios.get<Requests[]>("/api/request/getRequests/")
	.then((response) => {
		response.data.forEach((s) => {
			s.created_date = new Date(s.created_date)
		});
		return response.data;
	})
	.catch((e) => {
		console.log("error getting requests")
		console.log(e);
		return null;
	});
}

export default function Request() {
	const [requestNodes, setRequestNodes] = useState<Requests[]>([]);
	const theme = useTheme([
		getTheme(),
		{
			Table: "--data-table-library_grid-template-columns:  5em 15% 7em 5em 8em 8em calc(75% - 33em) 10%;",
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

	useEffect(() => {
		updateRequests()
	}, []);

	function updateRequests() {
		getRequests().then((r) => {
			if(r == null)
				return console.log("requests null");

			console.log(r);

			setRequestNodes(r);
		});
	}
	
  	return (
		<ModuleMain>
			<ModuleHeader title="Request" header="Request">
				<button className="btn btn-primary">New Request</button>
				<button className="btn btn-primary">Export CSV</button>
			</ModuleHeader>
			<ModuleContent>
				<CompactTable columns={COLUMNS} data={{nodes: requestNodes}} theme={theme} layout={{custom: true}}/>
			</ModuleContent>
		</ModuleMain>
  	)
}