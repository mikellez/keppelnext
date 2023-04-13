import React, { useState, useEffect } from "react";
import {
    Table,
    Header,
    HeaderRow,
    Body,
    Row,
    HeaderCell,
    Cell,
} from '@table-library/react-table-library/table';
import { useRowSelect } from "@table-library/react-table-library/select";
import { useTheme } from "@table-library/react-table-library/theme";
import { getTheme } from "@table-library/react-table-library/baseline";
import {ChangeOfPartsPageProps} from "../../pages/ChangeOfParts";
import { CMMSChangeOfParts } from "../../types/common/interfaces";
import { dateFormat } from "../Schedule/ScheduleTemplate";
import AssignToSelect from "../Schedule/AssignToSelect";
import { useCurrentUser } from "../SWR";
import TooltipBtn from "../TooltipBtn";
import styles from "../../styles/ChangeOfParts.module.scss";


interface COPTableData extends CMMSChangeOfParts {
    id: string;
}

interface COPTableProps extends ChangeOfPartsPageProps {
    selectedCOP: CMMSChangeOfParts;
    setSelectedCOP: React.Dispatch<React.SetStateAction<CMMSChangeOfParts>>;
    editMode: boolean;
}

const COPTable = (props: COPTableProps) => {

    const [tableData, setTableData] = useState<COPTableData[]>([]);
    const [newCOP, setNewCOP] = useState<CMMSChangeOfParts>({} as CMMSChangeOfParts);

    const theme = useTheme([
        getTheme(),
        {
            Table: `
                --data-table-library_grid-template-columns: 5% 20% 15% 15% 20% 25%;
            `,
          
            Row: `
                &:nth-of-type(n) {
                cursor: pointer
                }; 
            `,

            Cell: `
                & > div {
                    overflow: visible;
                    white-space: unset !important;
                }
            `,

            HeaderCell: `
                background-color: white !important;
                z-index: 20 !important;
                &:nth-of-type(1) {
                    z-index: 30 !important;
                }
            `,

            
        },
    ]);

    const onSelectChange = (action: any, state: any) => {
        const selectedId = +state.id
        const newCOP = tableData.filter(cop => cop.copId === selectedId)[0]
        if (newCOP) props.setSelectedCOP(newCOP);
        else props.setSelectedCOP({} as CMMSChangeOfParts);
    };

    const select = useRowSelect(
        { nodes: tableData }, 
        { onChange: onSelectChange }
    );
    
    const isRowEditable = (item: COPTableData) => {
        return props.editMode &&
        props.selectedCOP.copId === item.copId
    };
    

    useEffect(() => {
        const data : COPTableData[] = props.changeOfParts.map(item => {
            return {
                ...item,
                id: item.copId.toString(),
            }
        });

        setTableData(data);

    }, [props.changeOfParts]);

    useEffect(() => {
        // set
    }, [props.selectedCOP])

    return (
        <Table data={{ nodes: tableData }} theme={theme} layout={{ custom: true }} select={!props.editMode ? select : null}>
            {(tableList: COPTableData[]) =>
            <>
                <Header>
                    <HeaderRow>
                        <HeaderCell>ID</HeaderCell>
                        <HeaderCell>Asset</HeaderCell>
                        <HeaderCell>Scheduled Date</HeaderCell>
                        <HeaderCell>Description</HeaderCell>
                        <HeaderCell>Assigned To</HeaderCell>
                        <HeaderCell>Remarks</HeaderCell>
                    </HeaderRow>
                </Header>
                <Body>
                    {tableList.map(item => 
                        <Row 
                            key={item.id} 
                            item={item}
                        >
                            <Cell>{item.copId}</Cell>
                            <Cell>{item.asset}</Cell>

                            <Cell>{
                                isRowEditable(item) ? 
                                <input 
                                    type="date"
                                    className="form-control"
                                    defaultValue={new Date(new Date(item.scheduledDate).getTime() + 8*3600*1000).toISOString().slice(0, 10)}
                                /> :
                                dateFormat(new Date(item.scheduledDate))
                            }</Cell>

                            <Cell>{
                                isRowEditable(item) ? 
                                <textarea 
                                className="form-control"
                                style={{resize: "none"}}
                                maxLength={200}
                                defaultValue={item.description}
                                ></textarea> :
                                item.description
                            }</Cell>

                            <Cell>{
                                isRowEditable(item) ?
                                <AssignToSelect
                                    onChange={() => {}} 
                                    plantId={item.plantId}
                                    isSingle
                                    defaultIds={[item.assignedUserId]}
                                /> :
                                item.assignedUser
                            }</Cell>

                            <Cell>
                                {
                                    item.changedDate ? `Changed on ${item.changedDate}` : "-"
                                }
                            </Cell>
                        </Row>
                    )}
                    {props.changeOfParts.length == 0 &&<p>No Change of Parts</p>}
                </Body>
            </>
            }
        </Table>
    );
};

export default COPTable;