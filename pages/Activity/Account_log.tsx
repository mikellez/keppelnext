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

  const { data, error, isValidating, mutate } = useAccountlog();
  console.log(data);

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
                  <HeaderCell resize>User ID</HeaderCell>
                  <HeaderCell resize>Activity</HeaderCell>
                  <HeaderCell resize>Date & Time</HeaderCell>
                </HeaderRow>
              </Header>

              <Body>
                {tableList.map((item) => {
                  return (
                    <Row key={item.id} item={item}>
                      <Cell>{item.user_id}</Cell>
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
