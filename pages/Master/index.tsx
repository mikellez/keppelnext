
import { CompactTable } from '@table-library/react-table-library/compact';

import { useTheme } from '@table-library/react-table-library/theme';
import { getTheme } from '@table-library/react-table-library/baseline';

import Link from 'next/link'
import React, { MouseEvent, useEffect, useState } from 'react'
import { ModuleMain, ModuleHeader, ModuleContent } from '../../components'
import { Nullish } from '@table-library/react-table-library/types/common';
import useSWR from 'swr';
import axios from 'axios';
import { Table, Header, HeaderRow, HeaderCell, Body, Row, Cell } from '@table-library/react-table-library';

import { BsTrashFill, BsPencilSquare } from 'react-icons/bs';
import ModuleSimplePopup from '../../components/ModuleLayout/ModuleSimplePopup';
import LoadingIcon from '../../components/LoadingIcon';

type TableNode<T> = {
    id: string;
    nodes?: TableNode<T>[] | Nullish;
    prop: CMMSMasterData;
};

/*
	CMMSMaster: {
		idName: "plant_id"
		data: CMMSMasterData[] [
			{
				"plant_id": "1"
				"plant_name": "Changi DHCS"
				"plant_description": "Description"
			},
			{
				"plant_id": "2"
				"plant_name": "Woodlands DHCS"
				"plant_description": "Description"
			}
		]
	}
*/

interface CMMSMaster {
	idName: string;
	data: CMMSMasterData[];
}

interface CMMSMasterData {
	[column_name: string]: string;
}

const indexedColumn = [
	"plant",
	"system",
	"fault_types",
	"asset_type"
]

function useMaster(type: string) {
	interface CMMSMasterInfo {
		rows: CMMSMasterData[];
		fields: any[];
	}

	const requestFetcher = (url: string) => axios.get<CMMSMasterInfo>(url + type).then((response) => {

		let info: CMMSMaster = {
			idName: response.data.fields[0].name,
			data: response.data.rows
		}

		return info;
	})
	.catch((e) => {
		console.log("error getting requests")
		console.log(e);
		throw new Error(e);
	});

	return useSWR<CMMSMaster, Error>(["/api/master/", type], requestFetcher, {revalidateOnFocus: false});
}

function MasterActions({id, onClickDelete, onClickEdit}:
	{
		id: number|string,
		onClickDelete?: React.MouseEventHandler<HTMLButtonElement>,
		onClickEdit?: React.MouseEventHandler<HTMLButtonElement>
	}) {

	return (
		<div style={{
			display: "flex",
			flexFlow: "row wrap",
			justifyContent: "space-around",
			marginRight: "10%",
			marginLeft: "10%",
		}}>
			<button onClick={onClickDelete} name={"" + id} style={{all: "unset", cursor: "pointer"}}><BsTrashFill /></button>
			<button onClick={onClickEdit} name={"" + id} style={{all: "unset", cursor: "pointer"}}><BsPencilSquare /></button>
		</div>
	)
}

export default function Master() {
	const [activeTabIndex, setActiveTabIndex] = useState<number>(0)
	const [masterNodes, setMasterNodes] = useState<TableNode<CMMSMasterData>[]>([])
	const [columnSizes, setColumnSizes] = useState<string>("6em 20% calc(80% - 12em) 6em;");
	const [isReady, setReady] = useState<boolean>(false);

	const [deleteModalID, setDeleteModalID] = useState<number>(0);
	const [isModalOpen, setModalOpen] = useState<boolean>(false);
	const [isDeleting, setDeleting] = useState <boolean>(false);

	const [isDeleteSuccess, setDeleteSuccess] = useState<boolean>(false);
	const [isDeleteFailed, setDeleteFailed] = useState<boolean>(false);

	const {
		data,
		error,
		isValidating,
		mutate
	} = useMaster(indexedColumn[activeTabIndex]);

	const onDeleteClick = (e: React.MouseEvent<HTMLButtonElement>) => {
		setDeleteModalID(parseInt(e.currentTarget.name))
		setModalOpen(true)
	}

	const deleteMaster = () => {
		setDeleting(true);
		axios.delete(`/api/master/${indexedColumn[activeTabIndex]}/${deleteModalID}`).then(() => {
			setDeleteSuccess(true);
			setDeleteFailed(false);
		}).catch((err) => {
			console.log(err);
			setDeleteSuccess(false);
			setDeleteFailed(true);

		}).finally(() => {
			setModalOpen(false);
			setDeleting(false);
		})
	}

	const theme = useTheme([
		getTheme(),
		{
			Table: "--data-table-library_grid-template-columns:  " + columnSizes + "",
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
		setReady(false);
		setActiveTabIndex(index);
	};

	const refreshData = (() => {
		console.log("asd")
		mutate();
		switchColumns(activeTabIndex)
	})

	useEffect(() => {
		
		if(!isReady && data && !isValidating) {
			let len = (Object.keys(data.data[0]).length) - 1
			let sizes = "";
			for(let i=0;i<len;i++)
				sizes += "calc((100% - 12em) / " + len + ") "
			setColumnSizes("6em " + sizes + "6em")

			setMasterNodes(
				data.data.map((row): TableNode<CMMSMasterData> => {
					return {
						id: row[data.idName],
						prop: row
					}
				})
			);

			setReady(true);
		}

	}, [data, isValidating])

  	return <ModuleMain>
			<ModuleHeader title="Master" header="Master Tables">
				<button onClick={() => refreshData()} className="btn btn-primary">Refresh</button>
				<Link href="./Master/New" className="btn btn-primary">New Entry</Link>
			</ModuleHeader>

			<ModuleSimplePopup
				modalOpenState={isModalOpen}
				setModalOpenState={setModalOpen}
				title="Confirm Deletion"
				text={"Are you sure you want to delete master record of ID " + deleteModalID + "?"}
				icon={2}

				buttons={
					[
						<button key="deleteConfirm" onClick={deleteMaster} className="btn btn-primary">
						{ isDeleting && <LoadingIcon/> }
						Delete</button>,
						<button key="deleteCancel" onClick={() => setModalOpen(false)} className="btn btn-secondary">Cancel</button>
					]
				}
			/>

			<ModuleSimplePopup
				modalOpenState={isDeleteSuccess}
				setModalOpenState={setDeleteSuccess}
				title="Success"
				text={"ID " + deleteModalID + " has been deleted"}
				icon={1}

				buttons={ <button onClick={() => {
					setDeleteSuccess(false);
					refreshData();
				}} className="btn btn-primary">Ok</button> }
			/>

			<ModuleSimplePopup
				modalOpenState={isDeleteFailed}
				setModalOpenState={setDeleteFailed}
				title="Deletion Failed"
				text={"Something went wrong!"}
				icon={3}

				buttons={ <button onClick={() => {
					setDeleteFailed(false)
					refreshData();
				}} className="btn btn-primary">Ok</button> }
			/>
			
			<ModuleContent>
				<ul className="nav nav-tabs">
					<li onClick={() => {activeTabIndex !== 0 && switchColumns(0)}} className={"nav-link" + ((activeTabIndex === 0) ? " active" : "" )}> <span style={{all:"unset"}} >Plant</span></li>
					<li onClick={() => {activeTabIndex !== 1 && switchColumns(1)}} className={"nav-link" + ((activeTabIndex === 1) ? " active" : "" )}> <span style={{all:"unset"}} >System</span></li>
					<li onClick={() => {activeTabIndex !== 2 && switchColumns(2)}} className={"nav-link" + ((activeTabIndex === 2) ? " active" : "" )}> <span style={{all:"unset"}} >Fault Types</span></li>
					<li onClick={() => {activeTabIndex !== 3 && switchColumns(3)}} className={"nav-link" + ((activeTabIndex === 3) ? " active" : "" )}> <span style={{all:"unset"}} >Asset Types</span></li>
				</ul>
				{
				isReady && 
				<Table data={{nodes:masterNodes}} theme={theme} layout={{custom: true}}>
					{
						(tableList) => (
							<>
								<Header>
									<HeaderRow>
										{
											tableList.length !== 0 && Object.keys(tableList[0].prop).map((k) => {
												return <HeaderCell resize key={k}>{k}</HeaderCell>
											})
										}
										<HeaderCell resize >Actions</HeaderCell>
									</HeaderRow>
								</Header>
								<Body>
									{
										tableList.map((item) => (
											<Row
												key={item.id}
												item={item}
											>
												{
													tableList.length !== 0 && Object.keys(tableList[0].prop).map((k) => {
														return <Cell key={item.prop[k]}>{item.prop[k]}</Cell>
													})
												}
												<Cell><MasterActions id={item.id} onClickDelete={onDeleteClick} /></Cell>
											</Row>
										))
									}
								</Body>
							</>
						)
					}
				</Table>
				}
			</ModuleContent>
		</ModuleMain>
}