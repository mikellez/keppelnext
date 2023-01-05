import React, { useEffect, useState } from 'react'

import { ModuleContent, ModuleHeader, ModuleMain } from '../../components'

import { CompactTable } from '@table-library/react-table-library/compact';
import { TableNode } from '@table-library/react-table-library/types/table';
import { useTheme } from '@table-library/react-table-library/theme';
import { getTheme } from '@table-library/react-table-library/baseline';

import axios from 'axios';

interface Checklist extends TableNode {
	checklist_id: number;
	created_date: Date;
	chl_name: string;
	description: string;
	status_id: number;
	createdbyuser: string;
	assigneduser: string;
	signoffuser: string;
	plant_id: number
	plant_name: string;
	completeremarks_req: string;
	linkedassets: string;
	linkedassetids: string;
	chl_type: string;
	history: string;
	nodes?: Checklist[] | null;
}

const COLUMNS: any[] = [
	{ label: 'ID',					resize: true, renderCell: (item: Checklist) => item.checklist_id },
	{ label: 'Details',				resize: true, renderCell: (item: Checklist) => item.chl_name },
	{ label: 'Status',				resize: true, renderCell: (item: Checklist) => item.status_id },
	{ label: 'Created On',			resize: true, renderCell: (item: Checklist) =>
		item.created_date.toLocaleDateString('en-US', {
		  year: 'numeric',
		  month: '2-digit',
		  day: '2-digit',
		}),
	},
	{ label: 'Assigned To',			resize: true, renderCell: (item: Checklist) => item.assigneduser },
	{ label: 'Signed Off By',		resize: true, renderCell: (item: Checklist) => item.signoffuser },
	{ label: 'Created By',			resize: true, renderCell: (item: Checklist) => item.createdbyuser }
];

async function getChecklists() {
	return await axios.get<Checklist[]>("http://localhost:3000/api/checklist/getTemplateChecklist/17")
	.then((response) => {
		response.data.forEach((s) => {
			s.created_date = new Date(s.created_date)
		});
		return response.data;
	})
	.catch((e) => {
		console.log("error getting checklists")
		console.log(e);
		return null;
	});
}

export default function Checklist() {
	const [checklistNodes, setChecklistNodes] = useState<Checklist[]>([]);
	const theme = useTheme([
		getTheme(),
		{
			Table: "--data-table-library_grid-template-columns:  5em calc(90% - 40em) 7em 8em 10em 10em 10%;",
		},
	]);
	
	useEffect(() => {
		updateRequests()
	}, []);

	function updateRequests() {
		getChecklists().then((c) => {
			if(c == null)
				return console.log("checklists null");

			setChecklistNodes(c);
		});
	}
	
	return (
		<ModuleMain>
			<ModuleHeader title="Checklist" header="Checklist">
				<a href="/Checklist/New" className="btn btn-primary">New Checklist</a>
				<button className="btn btn-primary">Export CSV</button>
			</ModuleHeader>
			<ModuleContent>
				<CompactTable columns={COLUMNS} data={{nodes: checklistNodes}} theme={theme} layout={{custom: true}}/>
			</ModuleContent>
		</ModuleMain>
  	)
}