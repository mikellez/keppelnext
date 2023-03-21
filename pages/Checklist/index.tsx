import React, { useEffect, useState } from 'react'
import Link from 'next/link';

import { ModuleContent, ModuleHeader, ModuleMain } from '../../components'

import { useTheme } from '@table-library/react-table-library/theme';
import { getTheme } from '@table-library/react-table-library/baseline';

import { Table, Header, HeaderRow, HeaderCell, Body, Row, Cell, OnClick } from '@table-library/react-table-library';
import { useChecklist } from '../../components/SWR';
import { CMMSChecklist } from '../../types/common/interfaces';
import { Nullish } from '@table-library/react-table-library/types/common';
import { ThreeDots } from 'react-loading-icons';
import { downloadCSV } from '../Request';

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
			<ModuleHeader title="Checklist" header="Checklist">
				<Link href="/Checklist/New" className="btn btn-primary">New Checklist</Link>
				<button className="btn btn-primary" onClick={() => downloadCSV("checklist")}>Export CSV</button>
			</ModuleHeader>

			<ModuleContent>
				<ul className="nav nav-tabs">
					<li onClick={() => {activeTabIndex !== 0 && switchColumns(0)}} className={"nav-link" + ((activeTabIndex === 0) ? " active" : "" )}> <span style={{all:"unset"}} >Pending</span></li>
					<li onClick={() => {activeTabIndex !== 1 && switchColumns(1)}} className={"nav-link" + ((activeTabIndex === 1) ? " active" : "" )}> <span style={{all:"unset"}} >For Review</span></li>
					<li onClick={() => {activeTabIndex !== 2 && switchColumns(2)}} className={"nav-link" + ((activeTabIndex === 2) ? " active" : "" )}> <span style={{all:"unset"}} >Approved</span></li>
				</ul>
				{!isReady &&
					<div style={{width: "100%", textAlign: "center"}}>
						<ThreeDots fill="black"/>
					</div>
				}
				{error && <div>{error.toString()}</div>}
				{error && <div>error</div>}
				{
				isReady && 
				<Table data={{nodes: checklistNodes}} theme={theme} layout={{custom: true}}>
					{
						(tableList) => (
							<>
								<Header>
									<HeaderRow>
										<HeaderCell resize >ID</HeaderCell>
										<HeaderCell resize >Details</HeaderCell>
										<HeaderCell resize >Status</HeaderCell>
										<HeaderCell resize >Created On</HeaderCell>
										<HeaderCell resize >Assigned To</HeaderCell>
										<HeaderCell resize >Signed Off By</HeaderCell>
										<HeaderCell resize >Created By</HeaderCell>
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
													<Cell>{checklistNode.prop.created_date.toString()}</Cell>
													<Cell>{checklistNode.prop.assigneduser}</Cell>
													<Cell>{checklistNode.prop.signoffuser}</Cell>
													<Cell>{checklistNode.prop.createdbyuser}</Cell>
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
			</ModuleContent>
		</ModuleMain>
  	)
}