import React, { useEffect, useState } from 'react'
import Link from 'next/link';

import { ModuleContent, ModuleHeader, ModuleMain } from '../../components'

import { useTheme } from '@table-library/react-table-library/theme';
import { getTheme } from '@table-library/react-table-library/baseline';

import { Table, Header, HeaderRow, HeaderCell, Body, Row, Cell } from '@table-library/react-table-library';
import { useChecklist } from '../../components/SWR';
import { CMMSChecklist } from '../../types/common/interfaces';
import { Nullish } from '@table-library/react-table-library/types/common';
import { ThreeDots } from 'react-loading-icons';

type TableNode<T> = {
    id: string;
    nodes?: TableNode<T>[] | Nullish;
    prop: CMMSChecklist;
};

export default function Checklist() {
	const [checklistNodes, setChecklistNodes] = useState<TableNode<CMMSChecklist>[]>([]);
	const [isReady, setReady] = useState(false);

	const {
		data,
		error,
		isValidating,
		mutate
	} = useChecklist("template");

	const theme = useTheme([
		getTheme(),
		{
			Table: "--data-table-library_grid-template-columns:  5em calc(90% - 40em) 7em 8em 10em 10em 10%;",
		},
	]);
	
	useEffect(() => {
		if(isValidating) setReady(false);

		if(data && !isValidating) {
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
				<button className="btn btn-primary">Export CSV</button>
			</ModuleHeader>

			<ModuleContent>
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