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
import { useChecklist, useCurrentUser, useChecklistFilter } from "../../components/SWR";
import { CMMSChecklist } from "../../types/common/interfaces";
import { ThreeDots } from "react-loading-icons";
import { getColor } from "../Request";
import { HiOutlineDownload } from "react-icons/hi";
import TooltipBtn from "../../components/TooltipBtn";
import { BsFileEarmarkPlus } from "react-icons/bs";
import LoadingHourglass from "../../components/LoadingHourglass";
import axios from "axios";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import PageButton from "../../components/PageButton";
import styles from "../../styles/Request.module.scss";
import { usePagination } from "@table-library/react-table-library/pagination";
import { Role } from "../../types/common/enums";
import Pagination from "../../components/Pagination";

const indexedColumn: ("assigned" | "record" | "approved")[] = ["assigned", "record", "approved"];

// pretty much the same as CMMSChecklist but the ID is changed
export interface ChecklistItem {
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
export interface ChecklistProps {
  filter?: boolean; 
  status: number;
  plant: number;
  date: string;
  datetype: string;
  isReady: boolean;
}

const downloadCSV = async (type: string, activeTabIndex: number) => {
    try {
        const response = await axios({
            url: `/api/${type}/csv?activeTab=${JSON.stringify(activeTabIndex)}`,
            method: "get",
            responseType: "arraybuffer",
        });
        const blob = new Blob([response.data]);
        const url = window.URL.createObjectURL(blob);
        const temp_link = document.createElement("a");
        temp_link.download = `${type}.csv`;
        temp_link.href = url;
        temp_link.click();
        temp_link.remove();
    } catch (e) {
        console.log(e);
    }
};

export default function Checklist(props: ChecklistProps) {
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([]);
  const [isReady, setReady] = useState(false);
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const user = useCurrentUser();
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

    const { 
      data, 
      error, 
      isValidating, 
      mutate } = props?.filter 
        ? useChecklistFilter(props, page) 
        : useChecklist(indexedColumn[activeTabIndex], page);

    const pageData = { nodes: checklistItems };

    const pagination = usePagination(pageData, {
        state: {
            page: 0,
            size: 10,
        },
    });
    //const totalPages = pagination.state.getTotalPages(pageData.nodes);

    const theme = useTheme([
        getTheme(),
        {
            Table: "--data-table-library_grid-template-columns:  5em calc(90% - 46em) 7em 8em 10em 10em 10% 6em;",
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

    // useEffect(() => {
    //     console.log(activeTabIndex);
    // }, [activeTabIndex]);

    useEffect(() => {
      if(props?.filter) setReady(props?.isReady ?? true);

      if (!isReady && data && !isValidating) {
          // tranform and store data
          if (data?.rows?.length > 0) {
              setChecklistItems(
                  data.rows.map((row) => {
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
                          created_date: row.created_date as Date,
                          history: row.history,
                          status: row.status,
                      };
                  })
              );

            setReady(true);
            setTotalPages(data.total);
          } else if(data?.length > 0) {
              // TODO: to copy requests tab
              setChecklistItems(
                  data.map((row) => {
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
                          created_date: row.created_date as Date,
                          history: row.history,
                          status: row.status,
                      };
                  })
              );

            setReady(true);
            setTotalPages(data.total);

          } else {
              setChecklistItems([]);
          }
      }
    }, [data, isValidating, isReady, page]);

    return (
        <ModuleMain>
            <ModuleHeader title="Checklist" header="Checklist">
                <Link href="/Checklist/New">
                    <TooltipBtn text="New Checklist">
                        <BsFileEarmarkPlus href="/Checklist/New" size={20} />
                    </TooltipBtn>
                </Link>
                <TooltipBtn
                    onClick={() => downloadCSV("checklist", activeTabIndex)}
                    text="Export CSV"
                >
                    <HiOutlineDownload size={20} />
                </TooltipBtn>
            </ModuleHeader>

            <ModuleContent>
                {!props?.filter && <ul className="nav nav-tabs">
                    <li
                        onClick={() => {
                            activeTabIndex !== 0 && switchColumns(0);
                        }}
                        className={"nav-link" + (activeTabIndex === 0 ? " active" : "")}
                    >
                        <span style={{ all: "unset" }}>Assigned</span>
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
                }
                {!isReady && (
                    <div
                        style={{
                            position: "absolute",
                            top: "calc((100% - 8rem) / 2)",
                            left: "50%",
                            transform: "translate(-50%,-50%)",
                        }}
                    >
                        <LoadingHourglass />
                    </div>
                )}
                {error && <div>{error.toString()}</div>}
                {error && <div>error</div>}
                {isReady && (
                    <>
                        <Table
                            data={{ nodes: checklistItems }}
                            theme={theme}
                            layout={{ custom: true }}
                            pagination={pagination}
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
                                            <HeaderCell resize>Action</HeaderCell>
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
                                                    <Cell>{item.created_date.toString()}</Cell>
                                                    <Cell>{item.assigneduser}</Cell>
                                                    <Cell>{item.signoffuser}</Cell>
                                                    <Cell>{item.createdbyuser}</Cell>
                                                    <Cell>
                                                        {(user.data!.role_id === Role.Admin ||
                                                            user.data!.role_id === Role.Manager ||
                                                            user.data!.role_id === Role.Engineer) &&
                                                        item.status_id === 4 ? (
                                                            <Link
                                                                href={`/Checklist/Manage/${item.id}`}
                                                            >
                                                                <strong>Manage</strong>
                                                            </Link>
                                                        ) : item.status_id === 2 ||
                                                          item.status_id === 3 ? (
                                                            <Link
                                                                href={`/Checklist/Complete/${item.id}`}
                                                            >
                                                                <strong>Complete</strong>
                                                            </Link>
                                                        ) : (
                                                            <Link
                                                                href={`/Checklist/View/${item.id}`}
                                                            >
                                                                <strong>View</strong>
                                                            </Link>
                                                        )}
                                                    </Cell>
                                                </Row>
                                            );
                                        })}
                                    </Body>
                                </>
                            )}
                        </Table>

                        <Pagination 
                          setPage={setPage} 
                          setReady={setReady} 
                          totalPages={totalPages} 
                          page={page}/>
                    </>
                )}
            </ModuleContent>
        </ModuleMain>
    );
}
