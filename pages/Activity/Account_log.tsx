import React, { useEffect, useState } from 'react'
import Link from 'next/link';

import { ModuleContent, ModuleHeader, ModuleMain } from '../../components'

import { useTheme } from '@table-library/react-table-library/theme';
import { getTheme } from '@table-library/react-table-library/baseline';

import { Table, Header, HeaderRow, HeaderCell, Body, Row, Cell, OnClick } from '@table-library/react-table-library';
import { useAccountlog, } from '../../components/SWR';
import { CMMSActivitylog } from '../../types/common/interfaces';
import { Nullish } from '@table-library/react-table-library/types/common';
import { downloadCSV } from '../Request';

type TableNode<T> = {
    id: string;
    nodes?: TableNode<T>[] | Nullish;
    prop: T;
};


export default function AccountLog() {
	const [ActivityNodes, setActivityNodes] = useState<TableNode<CMMSActivitylog>[]>([]);
	const [isReady, setReady] = useState(false);

	const {
		data,
		error,
		isValidating,
		mutate
	} = useAccountlog();
	console.log(data)

	const theme = useTheme([
		getTheme(),
		{
			Table: "--data-table-library_grid-template-columns:  5em calc(90% - 40em) 7em 8em 10em 10em 10%;",
		},
	]);
	
	
	useEffect(() => {
		if(!isReady && data && !isValidating) {
			setActivityNodes(
				data.map((row: CMMSActivitylog): TableNode<CMMSActivitylog> => {
				  return {
					id: row.user_id,
					nodes: null,
					prop: {
					user_id: row.user_id,
					description: row.description,
					event_time: row.event_time,
					},
				  };
				})
			  )			  
			setReady(true);
		}
	}, [data, isValidating]);

	return (
		<ModuleMain>
			<ModuleHeader title="Activity Log" header="Activity Log">
				<button className="btn btn-primary" onClick={() => downloadCSV("activity")}>Export CSV</button>
			</ModuleHeader>
			<ModuleContent>
				<Table data={{nodes: ActivityNodes}} theme={theme}>
					{
						(tableList) => (
							<>
								<Header>
									<HeaderRow>
											<HeaderCell resize>User ID</HeaderCell>
											<HeaderCell resize>Activity</HeaderCell>
											<HeaderCell resize>Date & Time</HeaderCell>
										</HeaderRow>
								</Header>

								<Body>
									{tableList.map((item) => {
										let ActivityNodes = item as TableNode<CMMSActivitylog>;
										return (
										<Row key={item.id} item={ActivityNodes}>
											<Cell>{ActivityNodes.prop.user_id}</Cell>
											<Cell>{ActivityNodes.prop.description}</Cell>
											<Cell>{new Date(ActivityNodes.prop.event_time).toLocaleString()}</Cell>
										</Row>
										  
										);
									})}
									</Body>
							</>
						)
					}
				</Table>
			</ModuleContent>
		</ModuleMain>
  	)
}