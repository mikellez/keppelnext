/*
  EXPLANATION OF CHECKLIST MODULE

  Checklist has 2 types of data that we work with: Template and Record
  Checklists will refer to records by default unless specified otherwise


  There are many major components in the Checklist Module 
  which will be explained in their relevant pages

  The index page shows the a list of all 
  checklist(records) organised by checklist statuses

  This serves as the default landing page for the checklist module
  This page is also used as a component under Dashboard Content

  Components to note in the index page

  - Checklist Table is made using the react-table-library 
  found within /pages/Checklist/index.tsx

  - ChecklistHistory which is a modal that displays the previous actions 
  that were executed on a given record. This component can be found on
  /components/Checklist/ChecklistHistory

  interface ChecklistProps {
    filter?: boolean;
    status: number | string;
    plant: number;
    date: string;
    datetype: string;
    isReady: boolean;
  }

  These props are used on the Dashboard Content and is not used when
  it is used as the landing page for checklist module

*/

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import {
  ModuleContent,
  ModuleHeader,
  ModuleMain,
  ModuleModal,
} from "../../components";
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
import { HiBan, HiOutlineDownload } from "react-icons/hi";
import TooltipBtn from "../../components/TooltipBtn";
import { BsFileEarmarkPlus } from "react-icons/bs";
import LoadingHourglass from "../../components/LoadingHourglass";
import instance from "../../types/common/axios.config";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import {
  AiOutlineEdit,
  AiOutlineFolderView,
  AiOutlineFileDone,
  AiOutlineFileProtect,
  AiOutlineHistory,
} from "react-icons/ai";

import Tooltip from "rc-tooltip";
import "rc-tooltip/assets/bootstrap_white.css";

import PageButton from "../../components/PageButton";
import styles from "../../styles/Request.module.scss";
import { Role } from "../../types/common/enums";
import Pagination from "../../components/Pagination";
import { GetServerSidePropsContext } from "next";
import ChecklistHistory from "../../components/Checklist/ChecklistHistory";
import moment from "moment";
import { useRouter } from "next/router";
import SearchBar from "../../components/SearchBar/SearchBar";

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
  plant_name?: string;
  plant_id?: number;
  linkedassets?: string | null;
  linkedassetids?: string | null;
  chl_type?: string;
  created_date: Date | string;
  history: string;
  status: string;
  activity_log: { [key: string]: string }[];
  overdue_status?: boolean;
}

export interface ChecklistProps {
  filter?: boolean;
  status: number | string;
  plant: number;
  date: string;
  datetype: string;
  isReady: boolean;
  viewType?: string;
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
    // console.log(e);
  }
};

export default function Checklist(props: ChecklistProps) {
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([]);
  const [isReady, setReady] = useState(false);
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const user = useCurrentUser();
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [history, setHistory] = useState<
    { [key: string]: string }[] | undefined
  >(undefined);
  const searchRef = useRef({ value: "" });
  const [assignedUserHistory, setAssignedUserHistory] = useState<string>("");
  const fields = [
    "checklist_id",
    "chl_name",
    "description",
    "status_id",
    "created_date",
    "createdbyuser",
    "assigneduser",
    "signoffuser",
    "plant_name",
    "status",
    "activity_log",
    "overdue_status",
  ];
  const filteredData = useChecklistFilter(props, page, fields);
  const columnData = useChecklist(
    indexedColumn[activeTabIndex],
    page,
    searchRef.current.value,
    fields
  );
  const router = useRouter();

  const { data, error, isValidating, mutate } = props.filter
    ? filteredData
    : columnData;

  // Used for adding the overdue column into the template when the assigned/pending tab is selected
  const tableFormat =
    activeTabIndex === 0 || activeTabIndex === 1 || activeTabIndex === 2
      ? `--data-table-library_grid-template-columns:  5em 25em 7em 15em 10em 8em 8em 8em 6em;
      
  `
      : `--data-table-library_grid-template-columns:  5em 25em 7em 15em 8em 8em 8em 6em;
      
  `;

  const theme = useTheme([
    getTheme(),
    {
      Table: tableFormat,
    },
  ]);

  const switchColumns = (index: number) => {
    if (isReady) {
      setReady(false);
      setActiveTabIndex(index);
      setPage(1);
    }
  };

  const editRow: OnClick<ChecklistItem> = (item, event) => {
    const checklistRow = item;
  };

  useEffect(() => {
    // console.log(props);
    if (data && !isValidating) {
      if (props?.filter) {
        if (data?.rows?.length > 0) {
          setChecklistItems(
            data.rows.map((row: CMMSChecklist) => {
              return {
                id: row.checklist_id,
                ...row,
              };
            })
          );

          setReady(true);
          setTotalPages(data.total);
        }
      }
    }
  }, [data, isValidating, isReady, page, props?.isReady]);

  useEffect(() => {
    if (!props?.filter) {
      const fields = [
        "checklist_id",
        "chl_name",
        "description",
        "status_id",
        "created_date",
        "createdbyuser",
        "assigneduser",
        "signoffuser",
        "plant_name",
        "status",
        "activity_log",
        "overdue_status",
      ];
      const fieldsString = fields.join(",");

      instance
        .get(
          `/api/checklist/${indexedColumn[activeTabIndex]}?page=${page}&expand=${fieldsString}&search=${searchRef.current.value}`
        )
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
          setReady(true);
        })
        .catch((e) => {
          setChecklistItems([]);
        });
    }
  }, [activeTabIndex, page, isReady]);

  return (
    <ModuleMain>
      <ModuleHeader title="Checklist" header="Checklist">
        <SearchBar
          ref={searchRef}
          onSubmit={() => {
            setReady(false);
            setChecklistItems([]);
          }}
        />
        {(user.data?.role_id === Role.Admin ||
          user.data?.role_id === Role.Manager ||
          user.data?.role_id === Role.Engineer) && (
          <Link href="/Checklist/Form?action=New">
            <TooltipBtn text="New Checklist">
              <BsFileEarmarkPlus size={20} />
            </TooltipBtn>
          </Link>
        )}
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
        {isReady && checklistItems.length === 0 && <div>No Checklists</div>}
        {isReady ? (
          <>
            <Table
              data={{ nodes: checklistItems }}
              theme={theme}
              layout={{ custom: true, horizontalScroll: true }}
            >
              {(tableList: ChecklistItem[]) => (
                <>
                  <Header>
                    <HeaderRow>
                      <HeaderCell resize>ID</HeaderCell>
                      <HeaderCell resize>Details</HeaderCell>
                      <HeaderCell resize>Status</HeaderCell>
                      <HeaderCell resize>
                        {activeTabIndex === 2
                          ? "Completed Date"
                          : activeTabIndex === 3
                          ? "Approved Date"
                          : "Created On"}
                      </HeaderCell>
                      {/*Only show the Overdue column for the pending and assigned tabs*/}
                      {(activeTabIndex === 0 ||
                        activeTabIndex === 1 ||
                        activeTabIndex === 2) && (
                        <HeaderCell resize>Overdue Status</HeaderCell>
                      )}
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
                          <Cell>
                            <Tooltip
                              overlayInnerStyle={{ fontSize: "0.7rem" }}
                              placement="bottom"
                              trigger={["hover"]}
                              overlay={<span>{item.description}</span>}
                            >
                              <div>{item.description}</div>
                            </Tooltip>
                          </Cell>
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
                            <Tooltip
                              overlayInnerStyle={{ fontSize: "0.7rem" }}
                              placement="bottom"
                              trigger={["hover"]}
                              overlay={
                                <span>
                                  {(() => {
                                    try {
                                      let dateToDisplay;

                                      if (activeTabIndex === 2) {
                                        dateToDisplay = item.activity_log
                                          .reverse()
                                          .find(
                                            (activity) =>
                                              activity["activity_type"] ===
                                              "WORK DONE"
                                          )?.date;
                                      } else if (activeTabIndex === 3) {
                                        dateToDisplay = item.activity_log
                                          .reverse()
                                          .find(
                                            (activity) =>
                                              activity["activity_type"] ===
                                              "APPROVED"
                                          )?.date;
                                      } else {
                                        dateToDisplay = item.created_date;
                                      }

                                      if (dateToDisplay) {
                                        return moment(
                                          new Date(dateToDisplay)
                                        ).format("MMMM Do YYYY, h:mm:ss a");
                                      } else {
                                        return "Date not found";
                                      }
                                    } catch (error) {
                                      console.error(
                                        "An error occurred:",
                                        error
                                      );
                                      return "Error occurred";
                                    }
                                  })()}
                                </span>
                              }
                            >
                              <div>
                                {(() => {
                                  try {
                                    let dateToDisplay;

                                    if (activeTabIndex === 2) {
                                      dateToDisplay = item.activity_log
                                        .reverse()
                                        .find(
                                          (activity) =>
                                            activity["activity_type"] ===
                                            "WORK DONE"
                                        )?.date;
                                    } else if (activeTabIndex === 3) {
                                      dateToDisplay = item.activity_log
                                        .reverse()
                                        .find(
                                          (activity) =>
                                            activity["activity_type"] ===
                                            "APPROVED"
                                        )?.date;
                                    } else {
                                      dateToDisplay = item.created_date;
                                    }

                                    if (dateToDisplay) {
                                      return moment(
                                        new Date(dateToDisplay)
                                      ).format("MMMM Do YYYY, h:mm:ss a");
                                    } else {
                                      return "Date not found";
                                    }
                                  } catch (error) {
                                    console.error("An error occurred:", error);
                                    return "Error occurred";
                                  }
                                })()}
                              </div>
                            </Tooltip>
                          </Cell>
                          {/*Only show the Overdue column for the pending, assigned and work done tabs*/}
                          {(activeTabIndex === 0 ||
                            activeTabIndex === 1 ||
                            activeTabIndex === 2) && (
                            <Cell
                              style={{
                                color: getColor(
                                  item.overdue_status ? "OVERDUE" : "VALID"
                                ),
                                fontWeight: "bold",
                              }}
                            >
                              {item.overdue_status ? "OVERDUE" : "VALID"}
                            </Cell>
                          )}
                          <Cell>
                            <Tooltip
                              overlayInnerStyle={{ fontSize: "0.7rem" }}
                              placement="bottom"
                              trigger={["hover"]}
                              overlay={<span>{item.assigneduser}</span>}
                            >
                              <div>{item.assigneduser}</div>
                            </Tooltip>
                          </Cell>
                          <Cell>
                            <Tooltip
                              overlayInnerStyle={{ fontSize: "0.7rem" }}
                              placement="bottom"
                              trigger={["hover"]}
                              overlay={<span>{item.signoffuser}</span>}
                            >
                              <div>{item.signoffuser}</div>
                            </Tooltip>
                          </Cell>
                          <Cell>
                            <Tooltip
                              overlayInnerStyle={{ fontSize: "0.7rem" }}
                              placement="bottom"
                              trigger={["hover"]}
                              overlay={
                                <span>
                                  {item.createdbyuser != " "
                                    ? item.createdbyuser
                                    : "System Generated"}
                                </span>
                              }
                            >
                              <div>
                                {item.createdbyuser != " "
                                  ? item.createdbyuser
                                  : "System Generated"}
                              </div>
                            </Tooltip>
                          </Cell>
                          <Cell>
                            {(user.data!.role_id === Role.Admin ||
                              user.data!.role_id === Role.Manager ||
                              user.data!.role_id === Role.Engineer) &&
                            item.status_id === 4 ? (
                              <Link href={`/Checklist/Manage/${item.id}`}>
                                <AiOutlineFileProtect
                                  size={22}
                                  title={"Manage"}
                                />
                              </Link>
                            ) : item.status_id === 2 ||
                              item.status_id === 3 ||
                              item.status_id === 6 ||
                              item.status_id === 10 ? (
                              <>
                                <Link href={`/Checklist/Complete/${item.id}`}>
                                  <AiOutlineFileDone
                                    size={22}
                                    title={"Complete"}
                                  />
                                </Link>
                                <Link
                                  href={`/Checklist/Form/?action=Edit&id=${item.id}`}
                                >
                                  <AiOutlineEdit size={22} title={"Edit"} />
                                </Link>
                              </>
                            ) : item.status_id === 1 &&
                              user.data?.role_id !== Role.Specialist ? (
                              <Link
                                href={`/Checklist/Form/?action=Edit&id=${item.id}`}
                              >
                                <AiOutlineEdit size={22} title={"Assign"} />
                              </Link>
                            ) : item.status_id === 9 ? (
                              <Link
                                href={`/Checklist/Cancellation/?id=${item.id}`}
                              >
                                <HiBan size={22} title={"Cancel"} />
                              </Link>
                            ) : (
                              <div></div>
                            )}
                            <AiOutlineHistory
                              color={"#C70F2B"}
                              onClick={() => {
                                setHistory(item.activity_log);
                                setAssignedUserHistory(item.assigneduser);
                              }}
                              size={22}
                              title={"View History"}
                            />
                            <Link href={`/Checklist/View/${item.id}`}>
                              <AiOutlineFolderView size={22} title={"View"} />
                            </Link>
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
        ) : (
          <div
            style={{
              position: "absolute",
              top: "100%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              textAlign: "center",
            }}
          >
            <LoadingHourglass />
          </div>
        )}
        {history && (
          <ModuleModal
            isOpen={!!history}
            closeModal={() => setHistory(undefined)}
            closeOnOverlayClick={true}
          >
            <ChecklistHistory
              history={history!}
              assignedUser={assignedUserHistory}
            />
          </ModuleModal>
        )}
      </ModuleContent>
    </ModuleMain>
  );
}
