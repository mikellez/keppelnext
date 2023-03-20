

import React, { useState, useEffect, CSSProperties } from 'react'
import { ModuleContent, ModuleHeader, ModuleMain } from '../../components'

import { ThreeDots } from 'react-loading-icons'

import { CompactTable, RowOptions} from '@table-library/react-table-library/compact';
//import { TableNode } from '@table-library/react-table-library/types/table';
import { Nullish } from '@table-library/react-table-library/types/common';
import { useTheme } from '@table-library/react-table-library/theme';
import { getTheme } from '@table-library/react-table-library/baseline';

import { useRequest } from '../../components/SWR';
import { CMMSRequest } from '../../types/common/interfaces'; 
import Link from 'next/link';
import styles from "../../styles/Request.module.scss";

export type TableNode<T> = {
    id: string;
    nodes?: TableNode<T>[] | Nullish;
    prop: T;
};

const COLUMNS: any[] = [
	{ label: 'ID',					resize: true, renderCell: (item: TableNode<CMMSRequest>) => item.prop.request_id },
	{ label: 'Fault Type',			resize: true, renderCell: (item: TableNode<CMMSRequest>) => item.prop.fault_name },
	{ label: 'Location',			resize: true, renderCell: (item: TableNode<CMMSRequest>) => item.prop.plant_name },
	{ label: 'Priority',			resize: true, renderCell: (item: TableNode<CMMSRequest>) => item.prop.priority == null ? "-" : item.prop.priority },
	{ label: 'Status',				resize: true, renderCell: (item: TableNode<CMMSRequest>) => item.prop.status },
	{ label: 'Filter By Date',		resize: true, renderCell: (item: TableNode<CMMSRequest>) =>
		item.prop.created_date.toLocaleDateString('en-US', {
		  year: 'numeric',
		  month: '2-digit',
		  day: '2-digit',
		}),
	},
	{ label: 'Asset Name',			resize: true, renderCell: (item: TableNode<CMMSRequest>) => item.prop.asset_name },
	{ label: 'Requested By',		resize: true, renderCell: (item: TableNode<CMMSRequest>) => item.prop.fullname }
];



export default function Request() {
	const [requestNodes, setRequestNodes] = useState<TableNode<CMMSRequest>[]>([]);
	const [isReady, setReady] = useState(false);
	const [ids, setIds] = React.useState<string[]>([]);

	const handleExpand = (item: TableNode<CMMSRequest>) => {
		if (ids.includes(item.id)) {
			setIds(ids.filter((id) => id !== item.id));
		} else {
			setIds(ids.concat(item.id));
		}
	};

	const {
		data:			requestData,
		error:			requestFetchError,
		isValidating:	requestIsFetchValidating,
		mutate:			requestMutate
	} = useRequest();

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

	const ROW_PROPS = {
		onClick: handleExpand,
	};

	const ROW_OPTIONS: RowOptions = {
		renderAfterRow: (item: any) => {
			return (
				<>
					{ids.includes(item.id) && (
					<tr style={{ display: "flex", gridColumn: "1 / -1" }}>
						<td style={{ flex: "1" }}>
						<ul
							style={{
							margin: "0",
							padding: "0",
							backgroundColor: "#FFFFFF",
							color: "#7F8487"
							}}
						>
							<li className={styles.tableDropdownListItem}>
								<p><strong>Fault Description</strong></p>
								<p>{item.prop.fault_description}</p>
							</li>
							<li className={styles.tableDropdownListItem}>
								<p><strong>Assigned To</strong></p>
								<p>{item.prop.assigned_user_name.trim() === "" ? "UNASSIGNED" : item.prop.assigned_user_name}</p>
							</li>
							<li className={styles.tableDropdownListItem}>
								<p className={styles.tableDropdownListItemHeader}><strong>Fault File</strong></p>
								{item.prop.uploaded_file ? <img
									src={URL.createObjectURL(new Blob([new Uint8Array(item.prop.uploaded_file.data)]))} 
									alt="" 
									className={styles.tableDropdownImg}
								/> :
								<p>
									No File
								</p>
								}
							</li>
							<li className={styles.tableDropdownListItem}>
								<p className={styles.tableDropdownListItemHeader}><strong>Completion File</strong></p>
								{item.prop.completion_file ? <img
									src={URL.createObjectURL(new Blob([new Uint8Array(item.prop.completion_file.data)]))} 
									alt="" 
									className={styles.tableDropdownImg}
								/> :
								<p>
									No File
								</p>
								}
							</li>
						</ul>
						</td>
					</tr>
					)}
				</>
			)
		},
	  };

	useEffect(() => {
		if(requestIsFetchValidating) setReady(false);

		if(requestData && !requestIsFetchValidating) {
			setRequestNodes(
				requestData.map((row: CMMSRequest): TableNode<CMMSRequest> => {
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
				{isReady && <CompactTable 
					columns={COLUMNS} 
					data={{nodes: requestNodes}} 
					theme={theme} 
					layout={{custom: true}}
					rowProps={ROW_PROPS}
        			rowOptions={ROW_OPTIONS}
				/>}
			</ModuleContent>
		</ModuleMain>
  	)
}