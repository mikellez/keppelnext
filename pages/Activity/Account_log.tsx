import React, { useEffect, useState } from 'react'
import Link from 'next/link';

import { ModuleContent, ModuleHeader, ModuleMain } from '../../components'

import { useTheme } from '@table-library/react-table-library/theme';
import { getTheme } from '@table-library/react-table-library/baseline';

import { Table, Header, HeaderRow, HeaderCell, Body, Row, Cell, OnClick } from '@table-library/react-table-library';
import { useChecklist } from '../../components/SWR';
import { CMMSChecklist } from '../../types/common/interfaces';
import { Nullish } from '@table-library/react-table-library/types/common';

type TableNode<T> = {
    id: string;
    nodes?: TableNode<T>[] | Nullish;
    prop: T;
};

const indexedColumn: ("template" | "record" | "approved")[] = [
	"template",
	"record",
	"approved"
]

export default function Checklist() {
	const [checklistNodes, setChecklistNodes] = useState<TableNode<CMMSChecklist>[]>([]);
	const [isReady, setReady] = useState(false);
	const [activeTabIndex, setActiveTabIndex] = useState(0);

	const {
		data,
		error,
		isValidating,
		mutate
	} = useChecklist(indexedColumn[activeTabIndex]);

	const theme = useTheme([
		getTheme(),
		{
			Table: "--data-table-library_grid-template-columns:  5em calc(90% - 40em) 7em 8em 10em 10em 10%;",
		},
	]);

	const switchColumns = (index: number) => {
		setReady(false);
		setActiveTabIndex(index);
	};

	const editRow: OnClick = (item, event) => {
		const checklistRow = item as TableNode<CMMSChecklist>;

		console.log(checklistRow, event)
	}
	
	useEffect(() => {console.log(activeTabIndex)}, [activeTabIndex]);

	useEffect(() => {
		if(!isReady && data && !isValidating) {
			setChecklistNodes(
				data.map((row: CMMSChecklist): TableNode<CMMSChecklist> => {
					return {
						id: row.checklist_id.toString(),
						prop: row
					}
				})
			);
			setReady(true);
		}
	}, [data, isValidating]);

	return (
		<ModuleMain>
			<ModuleHeader title="Activity Log" header="Activity Log">
				<button className="btn btn-primary">Export CSV</button>
			</ModuleHeader>				
				{
				isReady && 
				<Table data={{nodes: checklistNodes}} theme={theme} layout={{custom: true}}>
					{
						(tableList) => (
							<>
								<Header>
									<HeaderRow>
										<HeaderCell resize >Name</HeaderCell>
										<HeaderCell resize >Activity</HeaderCell>
										<HeaderCell resize >Date</HeaderCell>
										
									</HeaderRow>
								</Header>

								<Body>
									{
										tableList.map((item) => {
											let checklistNode = item as TableNode<CMMSChecklist>;
											return (
												<Row key={item.id} item={checklistNode}>
													<Cell>{checklistNode.prop.checklist_id}</Cell>
													<Cell>{checklistNode.prop.description}</Cell>
													<Cell>{checklistNode.prop.status_id}</Cell>
												</Row>
											)
										})
									}
								</Body>
							</>
						)
					}
				</Table>
				}
		</ModuleMain>
  	)
}