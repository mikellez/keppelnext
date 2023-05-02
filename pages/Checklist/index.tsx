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
import {
  useChecklist,
  useCurrentUser,
  useChecklistFilter,
} from "../../components/SWR";
import { CMMSChecklist } from "../../types/common/interfaces";
import { ThreeDots } from "react-loading-icons";
import { getColor } from "../Request";
import { HiOutlineDownload } from "react-icons/hi";
import TooltipBtn from "../../components/TooltipBtn";
import { BsFileEarmarkPlus } from "react-icons/bs";
import LoadingHourglass from "../../components/LoadingHourglass";
import instance from '../../axios.config.js';
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { AiOutlineEdit, AiOutlineFolderView, AiOutlineFileDone, AiOutlineFileProtect } from  "react-icons/ai"
import PageButton from "../../components/PageButton";
import styles from "../../styles/Request.module.scss";
import { Role } from "../../types/common/enums";
import Pagination from "../../components/Pagination";
import { GetServerSidePropsContext } from "next";

const indexedColumn: ("pending" | "assigned" | "record" | "approved")[] = [
  "pending",
  "assigned",
  "record",
  "approved",
];

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
    const response = await instance({
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

  const filteredData = useChecklistFilter(props, page);
  const columnData = useChecklist(indexedColumn[activeTabIndex], page);

  const { data, error, isValidating, mutate } = props?.filter
    ? filteredData
    : columnData;

  const theme = useTheme([
    getTheme(),
    {
      Table:
        "--data-table-library_grid-template-columns:  5em calc(90% - 46em) 7em 8em 10em 10em 10% 6em;",
    },
  ]);

  const switchColumns = (index: number) => {
    setReady(false);
    setActiveTabIndex(index);
  };

  const editRow: OnClick<ChecklistItem> = (item, event) => {
    const checklistRow = item;
  };

  useEffect(() => {

    if (data && !isValidating) {

      if(props?.filter) {
        if (data?.rows?.length > 0) {
          setChecklistItems(
            data.rows.map((row) => {
              return {
                id: row.checklist_id,
                ...row,
              };
            })
          );

          setReady(true);
          setTotalPages(data.total);
        } else {
          setChecklistItems([]);
        }
      } /*else {
        if (data?.length > 0) {
          // TODO: to copy requests tab
          setChecklistItems(
            data.map((row) => {
              return {
                id: row.checklist_id,
                ...row,
              };
            })
          );

          setReady(true);
          setTotalPages(data.total);
        } else {
          setChecklistItems([]);
        }

      }*/
      
    }
  }, [data, isValidating, isReady, page, props?.isReady]);

  useEffect(() => {
    if(!props?.filter) {
      setReady(false);
      instance
        .get(`/api/checklist/${indexedColumn[activeTabIndex]}?page=1`)
        .then((response) => {
          setChecklistItems(
            response.data.rows.map((row: CMMSChecklist) => {
              return {
                id: row.checklist_id,
                ...row,
              };
            })
          );
          setTotalPages(response.data.total);
          setPage(1);
          setReady(true);
        })
        .catch((e) => {
          setChecklistItems([]);
        })
    }
  }, [activeTabIndex]);

  return (
    <ModuleMain>
      <ModuleHeader title="Checklist" header="Checklist">
        <Link href="/Checklist/Form?action=New">
          <TooltipBtn text="New Checklist">
            <BsFileEarmarkPlus size={20} />
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
        {!props?.filter && (
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
              <span style={{ all: "unset" }}>Assigned</span>
            </li>
            <li
              onClick={() => {
                activeTabIndex !== 2 && switchColumns(2);
              }}
              className={"nav-link" + (activeTabIndex === 2 ? " active" : "")}
            >
              <span style={{ all: "unset" }}>For Review</span>
            </li>
            <li
              onClick={() => {
                activeTabIndex !== 3 && switchColumns(3);
              }}
              className={"nav-link" + (activeTabIndex === 3 ? " active" : "")}
            >
              <span style={{ all: "unset" }}>Approved</span>
            </li>
          </ul>
        )}
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
        {checklistItems.length === 0 && <div>No Checklists</div>}
        {isReady && (
          <>
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
                              <Link href={`/Checklist/Manage/${item.id}`}>
                                <AiOutlineFileProtect size={22} />
                              </Link>
                            ) : item.status_id === 2 || item.status_id === 3 ? (
                              <>
                              <Link href={`/Checklist/Complete/${item.id}`}>
                                <AiOutlineFileDone size={22} />
                              </Link>
                              <Link href={`/Checklist/Form/?action=Edit&id=${item.id}`}>
                                <AiOutlineEdit size={22} />
                              </Link>
                              </>
                            ) : item.status_id === 1 ?
                            (
                              <Link href={`/Checklist/Form/?action=Edit&id=${item.id}`}>
                                <AiOutlineEdit size={22} />
                              </Link>
                            ) : (
                              <Link href={`/Checklist/View/${item.id}`}>
                                <AiOutlineFolderView size={22} />
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
              page={page}
            />
          </>
        )}
      </ModuleContent>
    </ModuleMain>
  );
}
