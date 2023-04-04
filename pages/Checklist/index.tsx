import React, { useEffect, useState } from "react";
import Link from "next/link";

import { ModuleContent, ModuleHeader, ModuleMain } from "../../components";

import { useTheme } from "@table-library/react-table-library/theme";
import { getTheme } from "@table-library/react-table-library/baseline";

import {
  Table,
  Header,
  HeaderRow,
  HeaderCell,
  Body,
  Row,
  Cell,
  OnClick,
} from "@table-library/react-table-library";
import { useChecklist } from "../../components/SWR";
import { CMMSChecklist } from "../../types/common/interfaces";
import { ThreeDots } from "react-loading-icons";
import { downloadCSV, getColor } from "../Request";
import { HiOutlineDownload } from "react-icons/hi";
import TooltipBtn from "../../components/TooltipBtn";
import { BsFileEarmarkPlus } from "react-icons/bs";
import LoadingHourglass from "../../components/LoadingHourglass";

const indexedColumn: ("pending" | "record" | "approved")[] = [
  "pending",
  "record",
  "approved",
];

// pretty much the same as CMMSChecklist but the ID is changed
interface ChecklistItem {
  id: number;
  chl_name: string;
  description: string;
  status_id: number;
  createdbyuser: string;
  assigneduser: string;
  signoffuser: string;
  plant_name: string;
  plant_id: number;
  linkedassets: string | null;
  linkedassetids: string | null;
  chl_type: string;
  created_date: Date;
  history: string;
  status: string;
}

export default function Checklist() {
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([]);
  const [isReady, setReady] = useState(false);
  const [activeTabIndex, setActiveTabIndex] = useState(0);

  const { data, error, isValidating, mutate } = useChecklist(
    indexedColumn[activeTabIndex]
  );

  const theme = useTheme([
    getTheme(),
    {
      Table:
        "--data-table-library_grid-template-columns:  5em calc(90% - 40em) 7em 8em 10em 10em 10%;",
    },
  ]);

  const switchColumns = (index: number) => {
    setReady(false);
    setActiveTabIndex(index);
  };

  const editRow: OnClick<ChecklistItem> = (item, event) => {
    const checklistRow = item;

    // console.log(checklistRow, event);
  };

  useEffect(() => {
    // console.log(activeTabIndex);
  }, [activeTabIndex]);

  useEffect(() => {
    if (!isReady && data && !isValidating) {
      // tranform and store data
      if (data.length > 0) {
        setChecklistItems(
          data.map(row => {
            return {
              id: row.checklist_id,
              chl_name: row.chl_name,
              description: row.description,
              status_id: row.status_id,
              createdbyuser: row.createdbyuser,
              assigneduser: row.assigneduser,
              signoffuser: row.signoffuser,
              plant_name: row.plant_name,
              plant_id: row.plant_id,
              linkedassets: row.linkedassets,
              linkedassetids: row.linkedassetids,
              chl_type: row.chl_type as string,
              created_date: row.created_date,
              history: row.history,
              status: row.status
            };
          })
        );
      }
      setReady(true);
    }
  }, [data, isValidating, isReady]);

  return (
    <ModuleMain>
      <ModuleHeader title="Checklist" header="Checklist">
        <Link href="/Checklist/New">
          <TooltipBtn text="New Checklist">
            <BsFileEarmarkPlus href="/Checklist/New" size={20} />
          </TooltipBtn>
        </Link>
        <TooltipBtn onClick={() => downloadCSV("checklist")} text="Export CSV">
          <HiOutlineDownload size={20} />
        </TooltipBtn>
      </ModuleHeader>

      <ModuleContent>
        <ul className="nav nav-tabs">
          <li
            onClick={() => {
              activeTabIndex !== 0 && switchColumns(0);
            }}
            className={"nav-link" + (activeTabIndex === 0 ? " active" : "")}
          >
            <span style={{ all: "unset" }}>Pending</span>
          </li>
          <li
            onClick={() => {
              activeTabIndex !== 1 && switchColumns(1);
            }}
            className={"nav-link" + (activeTabIndex === 1 ? " active" : "")}
          >
            <span style={{ all: "unset" }}>For Review</span>
          </li>
          <li
            onClick={() => {
              activeTabIndex !== 2 && switchColumns(2);
            }}
            className={"nav-link" + (activeTabIndex === 2 ? " active" : "")}
          >
            <span style={{ all: "unset" }}>Approved</span>
          </li>
        </ul>
        {!isReady && (
          <div style={{ position: "absolute", top:"calc((100% - 8rem) / 2)", left:"50%", transform:"translate(-50%,-50%)"}}>
            <LoadingHourglass />
          </div>
        )}
        {error && <div>{error.toString()}</div>}
        {error && <div>error</div>}
        {isReady && (
          <Table
            data={{ nodes: checklistItems }}
            theme={theme}
            layout={{ custom: true }}
          >
            {(tableList: ChecklistItem[]) => (
              <>
                <Header>
                  <HeaderRow>
                    <HeaderCell resize>ID</HeaderCell>
                    <HeaderCell resize>Details</HeaderCell>
                    <HeaderCell resize>Status</HeaderCell>
                    <HeaderCell resize>Created On</HeaderCell>
                    <HeaderCell resize>Assigned To</HeaderCell>
                    <HeaderCell resize>Signed Off By</HeaderCell>
                    <HeaderCell resize>Created By</HeaderCell>
                  </HeaderRow>
                </Header>

                <Body>
                  {tableList.map((item) => {
                    return (
                      <Row key={item.id} item={item}>
                        <Cell>{item.id}</Cell>
                        <Cell>{item.description}</Cell>
                        <Cell>
                          <span
                            style={{
                              color: getColor(item.status),
                              fontWeight: "bold",
                            }}
                          >
                            {item.status}
                          </span>
                        </Cell>
                        <Cell>
                          {item.created_date.toString()}
                        </Cell>
                        <Cell>{item.assigneduser}</Cell>
                        <Cell>{item.signoffuser}</Cell>
                        <Cell>{item.createdbyuser}</Cell>
                      </Row>
                    );
                  })}
                </Body>
              </>
            )}
          </Table>
        )}
      </ModuleContent>
    </ModuleMain>
  );
}
