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
import { useAccountlog } from "../../components/SWR";
import { CMMSActivitylog } from "../../types/common/interfaces";
import { downloadCSV } from "../Request";
import { HiOutlineDownload } from "react-icons/hi";
import TooltipBtn from "../../components/TooltipBtn";

export default function AccountLog() {
  const [activityItems, setActivityItems] = useState<CMMSActivitylog[]>([]);
  const [isReady, setReady] = useState(false);
  // const [sortDirectionDate, setSortDirectionDate] = useState<"asc" | "desc" | "null">("null");
  const [date, setDate]= useState<string>("Date & Time");

  function sortDate() {
    if (date == "Date & Time" || date == "Date & Time ▲") {
      setDate("Date & Time ▼");
      setActivityItems(activityItems.sort((a, b) => new Date(b.event_time) - new Date(a.event_time)));
      console.log(activityItems);
    } else if (date == "Date & Time ▼") {
      setDate("Date & Time ▲");
      setActivityItems(activityItems.sort((a, b) => new Date(a.event_time) - new Date(b.event_time)));
      console.log(activityItems);
    }
  }


  const { data, error, isValidating, mutate } = useAccountlog();
  // console.log(data);
  console.log(activityItems)
  const theme = useTheme([
    getTheme(),
    {
      Table:
        "--data-table-library_grid-template-columns:  5em calc(90% - 40em) 7em 8em 10em 10em 10%;",
    },
  ]);

  useEffect(() => {
    if (!isReady && data && !isValidating) {
      setActivityItems(data)
      setReady(true);
    }
  }, [data, isValidating]);

  return (
    <ModuleMain>
      <ModuleHeader title="Activity Log" header="Activity Log">
        <TooltipBtn text="Export CSV" onClick={() => downloadCSV("activity")}>
          <HiOutlineDownload size={20} />
        </TooltipBtn>
      </ModuleHeader>
      <ModuleContent>
        <Table data={{ nodes: activityItems }} theme={theme}>
          {(tableList: CMMSActivitylog[]) => (
            <>
              <Header>
                <HeaderRow>
                  <HeaderCell resize>User Name</HeaderCell>
                  <HeaderCell resize>Type</HeaderCell>
                  <HeaderCell resize>Activity</HeaderCell>
                  <HeaderCell resize
                  onClick={() => sortDate()}
                  style={{cursor: "pointer"}}
                  >{date}</HeaderCell>
                </HeaderRow>
              </Header>

              <Body>
                {tableList.map((item) => {
                  return (
                    <Row key={item.id} item={item}>
                      <Cell>{item.user_name}</Cell>
                      <Cell>{item.type}</Cell>
                      <Cell>{item.description}</Cell>
                      <Cell>
                        {new Date(
                          item.event_time
                        ).toLocaleString()}
                      </Cell>
                    </Row>
                  );
                })}
              </Body>
            </>
          )}
        </Table>
      </ModuleContent>
    </ModuleMain>
  );
}
