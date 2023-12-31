import React, { useState, useEffect } from "react";
import {
  Table,
  Header,
  HeaderRow,
  Body,
  Row,
  HeaderCell,
  Cell,
} from "@table-library/react-table-library/table";
import { useRowSelect } from "@table-library/react-table-library/select";
import { useTheme } from "@table-library/react-table-library/theme";
import { getTheme } from "@table-library/react-table-library/baseline";
import { ChangeOfPartsPageProps } from "../../pages/ChangeOfParts";
import { CMMSChangeOfParts } from "../../types/common/interfaces";
import { dateFormat } from "../Schedule/ScheduleTemplate";
import { useCurrentUser } from "../SWR";
import TooltipBtn from "../TooltipBtn";
import { useRouter } from "next/router";
import styles from "../../styles/Request.module.scss";
import Pagination from "../Pagination";

interface COPTableData extends CMMSChangeOfParts {
  id: string;
}

interface COPTableProps extends ChangeOfPartsPageProps {
  selectedCOP?: CMMSChangeOfParts;
  setSelectedCOP?: React.Dispatch<React.SetStateAction<CMMSChangeOfParts>>;
  isDisabledSelect: boolean;
  activeCOPType?: number;
  switchColumns?: Function | null;
  display?: boolean;
}

const COPTable = (props: COPTableProps) => {
  const [tableData, setTableData] = useState<COPTableData[]>([]);
  const [isReady, setIsReady] = useState<boolean>(false);
  const user = useCurrentUser();
  const { userPermission } = useCurrentUser();
  const router = useRouter();

  const theme = useTheme([
    getTheme(),
    {
      Table: `
                --data-table-library_grid-template-columns: 5% 15% 15% 35% 15% 15% 15% 20%;
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
                z-index: 20 !important;
                &:nth-of-type(1) {
                    z-index: 30 !important;
                }
            `,
    },
  ]);

  const onSelectChange = (action: any, state: any) => {
    const selectedId = +state.id;
    const newCOP = tableData.filter((cop) => cop.copId === selectedId)[0];
    if (newCOP) props.setSelectedCOP!(newCOP);
    else props.setSelectedCOP!({} as CMMSChangeOfParts);
  };

  const select = useRowSelect(
    { nodes: tableData },
    { onChange: onSelectChange }
  );

  const handleCompleteClick = (copId: number) => {
    router.push("/ChangeOfParts/Complete/" + copId);
  };

  useEffect(() => {
    if (props.changeOfParts) {
      const data: COPTableData[] = props.changeOfParts.map((item) => {
        return {
          ...item,
          id: item.copId.toString(),
        };
      });

      setTableData(data);
    }
  }, [props.changeOfParts]);
  // console.log(tableData)

  return (
    <>
      {props.switchColumns != null && props.activeCOPType != null && (
        <ul className="nav nav-tabs">
          <li
            onClick={() => props.activeCOPType != 0 && props.switchColumns!(0)}
            className={
              "nav-link" + (props.activeCOPType === 0 ? " active" : "")
            }
          >
            <span style={{ all: "unset" }}>Scheduled</span>
          </li>
          <li
            onClick={() => props.activeCOPType != 1 && props.switchColumns!(1)}
            className={
              "nav-link" + (props.activeCOPType === 1 ? " active" : "")
            }
          >
            <span style={{ all: "unset" }}>Completed</span>
          </li>
        </ul>
      )}
      {((props.display === true && props.changeOfParts.length > 0) ||
        props.display === undefined) && (
        <>
          <Table
            data={{ nodes: tableData }}
            theme={theme}
            layout={{ custom: true }}
            select={props.isDisabledSelect ? "" : select}
          >
            {(tableList: COPTableData[]) => (
              <>
                <Header>
                  <HeaderRow>
                    <HeaderCell>ID</HeaderCell>
                    <HeaderCell>Plant</HeaderCell>
                    <HeaderCell>Asset</HeaderCell>
                    <HeaderCell>Description</HeaderCell>
                    <HeaderCell>Scheduled Date</HeaderCell>
                    <HeaderCell>Completion Date</HeaderCell>
                    <HeaderCell>Assigned To</HeaderCell>
                    <HeaderCell>Remarks</HeaderCell>
                  </HeaderRow>
                </Header>
                <Body>
                  {tableList.map((item) => (
                    <Row key={item.id} item={item}>
                      <Cell>{item.copId}</Cell>
                      <Cell>{item.plant}</Cell>
                      <Cell>{item.asset}</Cell>
                      <Cell>{item.description}</Cell>

                      <Cell>{dateFormat(new Date(item.scheduledDate))}</Cell>
                      <Cell>
                        {item.changedDate ? (
                          dateFormat(new Date(item.changedDate))
                        ) : userPermission('canCompleteChangeOfParts') && user.data?.id === item.assignedUserId ? (
                          <TooltipBtn
                            toolTip={false}
                            onClick={() => handleCompleteClick(item.copId)}
                          >
                            Complete
                          </TooltipBtn>
                        ) : (
                          "-"
                        )}
                      </Cell>
                      <Cell>{item.assignedUser}</Cell>
                      <Cell>{item.remarks}</Cell>
                    </Row>
                  ))}
                </Body>
              </>
            )}
          </Table>
        </>
      )}
    </>
  );
};

export default COPTable;
