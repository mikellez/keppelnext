

import React, { useState, useEffect, CSSProperties } from 'react'
import { ModuleContent, ModuleHeader, ModuleMain } from '../../components'

import { ThreeDots } from 'react-loading-icons'

import { CompactTable } from '@table-library/react-table-library/compact';
//import { TableNode } from '@table-library/react-table-library/types/table';
import { Nullish } from '@table-library/react-table-library/types/common';
import { useTheme } from '@table-library/react-table-library/theme';
import { getTheme } from '@table-library/react-table-library/baseline';

import useSWR from 'swr';
import axios from 'axios';
import Link from 'next/link';

type TableNode<T> = {
    id: string;
    nodes?: TableNode<T>[] | Nullish;
    prop: T;
};

interface Request {
	request_id: string;
	created_date: Date;
	fullname: string;
	fault_name: string;
	asset_name: string;
	plant_name: string;
	priority: string;
	status: string;
}

const COLUMNS: any[] = [
	{ label: 'ID',					resize: true, renderCell: (item: TableNode<Request>) => item.prop.request_id },
	{ label: 'Fault Type',			resize: true, renderCell: (item: TableNode<Request>) => item.prop.fault_name },
	{ label: 'Location',			resize: true, renderCell: (item: TableNode<Request>) => item.prop.plant_name },
	{ label: 'Priority',			resize: true, renderCell: (item: TableNode<Request>) => item.prop.priority == null ? "-" : item.prop.priority },
	{ label: 'Status',				resize: true, renderCell: (item: TableNode<Request>) => item.prop.status },
	{ label: 'Filter By Date',		resize: true, renderCell: (item: TableNode<Request>) =>
		item.prop.created_date.toLocaleDateString('en-US', {
		  year: 'numeric',
		  month: '2-digit',
		  day: '2-digit',
		}),
	},
	{ label: 'Asset Name',			resize: true, renderCell: (item: TableNode<Request>) => item.prop.asset_name },
	{ label: 'Requested By',		resize: true, renderCell: (item: TableNode<Request>) => item.prop.fullname }
];

const requestFetcher = (url: string) => axios.get<Request[]>(url).then((response) => {
	response.data.forEach((s) => {
		s.created_date = new Date(s.created_date)
	});
	return response.data;
})
.catch((e) => {
	console.log("error getting requests")
	console.log(e);
	throw new Error(e);
});

export default function Request() {
	const [requestNodes, setRequestNodes] = useState<TableNode<Request>[]>([]);
	const [isReady, setReady] = useState(false);

	const {
		data:			requestData,
		error:			requestFetchError,
		isValidating:	requestIsFetchValidating,
		mutate:			requestMutate
	} = useSWR<Request[], Error>("/api/request", requestFetcher, {revalidateOnFocus: false});

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
		if(requestIsFetchValidating) setReady(false);

		if(requestData && !requestIsFetchValidating) {
			setRequestNodes(
				requestData.map((row: Request): TableNode<Request> => {
					return {
						id: row.request_id,
						prop: row
					}
				})
			);
			setReady(true);
		}
	}, [requestData, requestIsFetchValidating]);
	
  	return (
		<ModuleMain>
			<ModuleHeader title="Request" header="Request">
				<button onClick={() => requestMutate()} className="btn btn-primary">Refresh</button>
				<Link href="./Request/New" className="btn btn-primary">New Request</Link>
				<a className="btn btn-primary">Export CSV</a>
			</ModuleHeader>
			<ModuleContent>
				{!isReady &&
					<div style={{width: "100%", textAlign: "center"}}>
						<ThreeDots fill="black"/>
					</div>
				}
				{requestFetchError && <div>{requestFetchError.toString()}</div>}
				{requestFetchError && <div>error</div>}
				{isReady && <CompactTable columns={COLUMNS} data={{nodes: requestNodes}} theme={theme} layout={{custom: true}}/>}
			</ModuleContent>
		</ModuleMain>
  	)
}