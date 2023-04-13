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
import {ChangeOfPartsPageProps} from "../../pages/ChangeOfParts";
import { CMMSChangeOfParts } from "../../types/common/interfaces";
import { dateFormat } from "../Schedule/ScheduleTemplate";
import { useCurrentUser } from "../SWR";
import TooltipBtn from "../TooltipBtn";

interface COPTableData extends CMMSChangeOfParts {
    id: string;
}

const COPTable = (props: ChangeOfPartsPageProps) => {

    const [tableData, setTableData] = useState<COPTableData[]>([]);
    const user = useCurrentUser();
    
    useEffect(() => {
        const data : COPTableData[] = props.changeOfParts.map(item => {
            return {
                ...item,
                id: item.copId.toString(),
            }
        })

        setTableData(data);

    }, [props.changeOfParts])

    return (
        <Table data={{ nodes: tableData }}>
            {(tableList: COPTableData[]) =>
            <>
                <Header>
                    <HeaderRow>
                        <HeaderCell>ID</HeaderCell>
                        <HeaderCell>Asset</HeaderCell>
                        <HeaderCell>Changed Date</HeaderCell>
                        <HeaderCell>Scheduled Date</HeaderCell>
                        <HeaderCell>Description</HeaderCell>
                        <HeaderCell>Assigned To</HeaderCell>
                        <HeaderCell>Action</HeaderCell>
                    </HeaderRow>
                </Header>
                <Body>
                    {tableList.map(item => 
                        <Row key={item.id} item={item}>
                            <Cell>{item.copId}</Cell>
                            <Cell>{item.asset}</Cell>
                            <Cell>{dateFormat(new Date(item.changedDate))}</Cell>
                            <Cell>{dateFormat(new Date(item.scheduledDate))}</Cell>
                            <Cell>{item.description}</Cell>
                            <Cell>{item.assignedUser}</Cell>
                            <Cell>
                                {
                                    user.data?.id === item.assignedUserId ?
                                    <TooltipBtn 
                                        toolTip={false}
                                    >Complete</TooltipBtn>
                                    :
                                    "-"
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