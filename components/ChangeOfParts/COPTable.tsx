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


interface COPTableData extends CMMSChangeOfParts {
    id: string;
}

interface COPTableProps extends ChangeOfPartsPageProps {
    selectedCOP: CMMSChangeOfParts;
    setSelectedCOP: React.Dispatch<React.SetStateAction<CMMSChangeOfParts>>;
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
    
    useEffect(() => {
        const data : COPTableData[] = props.changeOfParts.map(item => {
            return {
                ...item,
                id: item.copId.toString(),
            }
        });

        setTableData(data);

    }, [props.changeOfParts]);

    return (
        <Table data={{ nodes: tableData }} theme={theme} layout={{ custom: true }} select={select}>
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
                            <Cell>{dateFormat(new Date(item.scheduledDate))}</Cell>
                            <Cell>{item.description}</Cell>
                            <Cell>{item.assignedUser}</Cell>
                            <Cell>{item.changedDate ? `Changed on ${item.changedDate}` : "-"}</Cell>
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