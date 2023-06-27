/* 
  EXPLANATION OF REQUEST MODULE
  
  The request module is made of 3 major components:
  - /components/request/RequestContainer.tsx
  - /components/request/RequestPreview.tsx
  - and lastly the request table found on /pages/Request/index.tsx

  - RequestContainer is a form component that allows users to fill
    in details to create new or corrective request. Engineers and 
    Managers can assign request to other users as well. Please 
    review it for more details

  - RequestPreview is meant to be a preview only component though
    it supports the feature of request completion and approval &
    rejection of request for operation specialists and managers 
    respectively.
  
  - Request table in the index page of request is made using react 
    table library. It supports table dropdown features.
*/

import React, {
  useState,
  useEffect,
  useRef,
  CSSProperties,
  MouseEventHandler,
} from "react";
import {
  ModuleContent,
  ModuleHeader,
  ModuleMain,
  ModuleModal,
} from "../../components";

import {
  Column,
  CompactTable,
  RowOptions,
} from "@table-library/react-table-library/compact";
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
import { useTheme } from "@table-library/react-table-library/theme";
import { getTheme } from "@table-library/react-table-library/baseline";

import {
  useRequest,
  useRequestFilter,
  useSpecificRequest,
} from "../../components/SWR";
import { CMMSRequest } from "../../types/common/interfaces";
import Link from "next/link";
import { useRouter } from "next/router";
import styles from "../../styles/Request.module.scss";
import instance from "../../axios.config.js";
import TooltipBtn from "../../components/TooltipBtn";
import { FiChevronsLeft, FiChevronsRight, FiRefreshCw } from "react-icons/fi";
import { HiOutlineDownload, HiOutlineLink } from "react-icons/hi";
import { BsFileEarmarkPlus } from "react-icons/bs";
import { AiOutlineHistory } from "react-icons/ai";
import { AiOutlineUserAdd } from "react-icons/ai";
import { BiCommentCheck } from "react-icons/bi";
import Image from "next/image";
import { useCurrentUser } from "../../components/SWR";
import RequestHistory from "../../components/Request/RequestHistory";
import LoadingHourglass from "../../components/LoadingHourglass";
import PageButton from "../../components/PageButton";
import { Role } from "../../types/common/enums";
import { GetServerSidePropsContext } from "next";
import Pagination from "../../components/Pagination";
import moment from "moment";
import SearchBar from "../../components/SearchBar/SearchBar";
import { request } from "http";
import animationStyles from "../../styles/animations.module.css";

/*export type TableNode<T> = {
  id: string;
  nodes?: TableNode<T>[] | Nullish;
  prop: T;
};*/

const indexedColumn: ("pending" | "assigned" | "review" | "approved")[] = [
  "pending",
  "assigned",
  "review",
  "approved",
];

export interface RequestItem {
  id: string;
  request_name?: string;
  created_date: Date;
  created_by: string;
  fault_name: string;
  fault_id?: number;
  asset_name: string;
  psa_id?: number;
  req_id?: number;
  plant_name: string;
  plant_id?: number;
  priority: string;
  priority_id: number;
  status: string;
  status_id?: number;
  assigned_user_email: string;
  assigned_user_id: number;
  assigned_user_name: string;
  fault_description?: string;
  uploaded_file?: any;
  requesthistory?: string;
  complete_comments?: string;
  completion_file?: any;
  activity_log?: { [key: string]: string }[];
  associatedrequestid?: number;
}

export interface RequestProps {
  filter?: boolean;
  status: number | string;
  plant: number;
  date: string;
  datetype: string;
  isReady?: boolean;
}

export const getColor = (status: string) => {
  switch (status) {
    case "PENDING":
      return "#b306ec";
    case "ASSIGNED":
      return "blue";
    case "COMPLETED":
    case "WORK DONE":
    case "APPROVED":
      return "#0ebd05";
    case "HIGH":
      return "#C74B50";
    case "MEDIUM":
      return "#FFAC41";
    case "LOW":
      return "#03C988";
    case "REJECTED":
    case "CANCELLED":
      return "red";
    case "REASSIGNED":
      return "#B71375";
    default:
      return "#757575";
  }
};

export const downloadCSV = async (type: string, filename?: string) => {
  try {
    const response = await instance({
      url: `/api/${type}/csv`,
      method: "get",
      responseType: "arraybuffer",
    });
    // console.log(response);
    const blob = new Blob([response.data]);
    const url = window.URL.createObjectURL(blob);
    const temp_link = document.createElement("a");
    temp_link.download =
      filename || `${type}_${moment().format("YYYY-MM-DD")}.csv`;
    temp_link.href = url;
    temp_link.click();
    temp_link.remove();
  } catch (e) {
    console.log(e);
  }
};

export default function Request(props: RequestProps) {
  const [requestItems, setRequestItems] = useState<RequestItem[]>([]);
  const [isReady, setReady] = useState(false);
  const [modalSrc, setModalSrc] = useState<string | undefined>();
  const [ids, setIds] = React.useState<string[]>([]);
  const [currentHistory, setCurrentHistory] = useState<
    { [key: string]: string }[] | undefined
  >();
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const searchRef = useRef({ value: "" });
  const currentDate = moment().format("YYYY-MM-DD");
  const filename = `${currentDate} Request History.csv`;
  const router = useRouter();
  const { data } = useCurrentUser();

  const switchColumns = (index: number) => {
    setReady(false);
    setActiveTabIndex(index);
    setRequestItems([]);
    setPage(1);
  };

  const handleExpand = async (item: RequestItem) => {
    // console.log(item);
    if (ids.includes(item.id)) {
      setIds(ids.filter((id) => id !== item.id));
    } else {
      setIds(ids.concat(item.id));
      instance.get(`/api/request/${item.id}`).then((res) => {
        const request = res.data;
        // console.log(request);
        // update with further details
        setRequestItems((prev) =>
          prev.map((req) =>
            req.id === item.id
              ? {
                  ...request,
                  // created_by: item.created_by,
                  id: request.request_id,
                  created_date: new Date(request.created_date),
                }
              : req
          )
        );
      });
    }
  };

  const filteredRequest = useRequestFilter(props, page);
  const allRequest = useRequest(
    indexedColumn[activeTabIndex],
    page,
    searchRef.current.value,
    [
      "request_id",
      "fault_name",
      "plant_name",
      "priority",
      "status",
      "created_date",
      "asset_name",
      "created_by",
      "status_id",
      "associatedrequestid",
      "activity_log",
    ]
  );

  const {
    data: requestData,
    error: requestFetchError,
    isValidating: requestIsFetchValidating,
    mutate: requestMutate,
  } = props?.filter ? filteredRequest : allRequest;

  const theme = useTheme([
    getTheme(),
    {
      Table: `--data-table-library_grid-template-columns:  5em 13em 8em 6em 6em 14em 15em 8em 6em;
        
        `,
      HeaderRow: `
				background-color: #eaf5fd;
			`,
      Row: `
				&:nth-of-type(odd) {
					background-color: #d2e9fb;
				}

				&:nth-of-type(even) {
					background-color: #eaf5fd;
				}

        &:nth-of-type(n) {
          cursor: pointer
        }
			`,
    },
  ]);

  useEffect(() => {
    if (requestData && !requestIsFetchValidating) {
      if (requestData?.rows?.length > 0) {
        setRequestItems(
          requestData.rows.map((row: CMMSRequest, total: number) => {
            // console.log(requestData);

            return {
              id: row.request_id,
              ...row,
              created_date: new Date(row.created_date),
            };
          })
        );
        setReady(true);
        setTotalPages(requestData.total);
      }
    }
    if (requestData?.rows?.length === 0) {
      setReady(true);
      // setRequestItems([]);
      setTotalPages(1);
    }
  }, [requestData, requestIsFetchValidating, isReady, page, props?.isReady]);

  return (
    <ModuleMain>
      <ModuleHeader title="Request" header="Request">
        <SearchBar
          ref={searchRef}
          onSubmit={() => {
            setReady(false);
            setRequestItems([]);
          }}
        />
        <TooltipBtn onClick={() => requestMutate()} text="Refresh">
          <FiRefreshCw size={20} />
        </TooltipBtn>
        <Link href="./Request/New">
          <TooltipBtn text="New Request">
            <BsFileEarmarkPlus href="./Request/New" size={20} />
          </TooltipBtn>
        </Link>
        <a>
          <TooltipBtn
            text="Export CSV"
            onClick={() => downloadCSV("request", filename)}
          >
            <HiOutlineDownload size={20} />
          </TooltipBtn>
        </a>
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
              top: "100%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              textAlign: "center",
            }}
          >
            <LoadingHourglass />
          </div>
        )}

        {isReady && (
          <>
            <Table
              data={{ nodes: requestItems }}
              theme={theme}
              layout={{ custom: true, horizontalScroll: true }}
            >
              {(tableList: RequestItem[]) => (
                <>
                  <Header>
                    <HeaderRow>
                      <HeaderCell resize>ID</HeaderCell>
                      <HeaderCell resize>Fault Type</HeaderCell>
                      <HeaderCell resize>Location</HeaderCell>
                      <HeaderCell resize>Priority</HeaderCell>
                      <HeaderCell resize>Status</HeaderCell>
                      <HeaderCell resize>Date</HeaderCell>
                      <HeaderCell resize>Asset Name</HeaderCell>
                      <HeaderCell resize>Requested By</HeaderCell>
                      <HeaderCell resize>Action</HeaderCell>
                    </HeaderRow>
                  </Header>
                  <Body>
                    {tableList.map((item) => {
                      return (
                        <React.Fragment key={item.id}>
                          <Row item={item} onClick={handleExpand}>
                            <Cell>{item.id}</Cell>
                            <Cell>{item.fault_name}</Cell>
                            <Cell>{item.plant_name}</Cell>
                            <Cell
                              style={{
                                color: getColor(item.priority),
                                fontWeight: "bold",
                              }}
                            >
                              {item.priority == null ? "-" : item.priority}
                            </Cell>
                            <Cell
                              style={{
                                color: getColor(item.status),
                                fontWeight: "bold",
                              }}
                            >
                              {item.status}
                            </Cell>
                            <Cell>
                              {`${moment(new Date(item.created_date)).format(
                                "MMMM Do YYYY, h:mm:ss a"
                              )}`}
                            </Cell>
                            <Cell>{item.asset_name}</Cell>
                            <Cell>{item.created_by}</Cell>
                            <Cell>
                              <div className={styles.iconsDiv}>
                                {(item.status_id === 1 ||
                                  item.status_id === 2) && (
                                  <div
                                    className={styles.editIcon}
                                    style={{
                                      display:
                                        data?.role_id == Role.Admin ||
                                        data?.role_id == Role.Manager ||
                                        data?.role_id == Role.Engineer
                                          ? "block"
                                          : "none",
                                      // visibility:
                                      //     item.status_id === 1 || item.status_id === 2 ? "visible" : "hidden",
                                    }}
                                    onClick={() => {
                                      router.push(`/Request/Assign/${item.id}`);
                                      setReady(false);
                                    }}
                                  >
                                    <AiOutlineUserAdd
                                      size={18}
                                      title={"Assign"}
                                    />
                                  </div>
                                )}
                                {item.status_id === 3 && (
                                  <div
                                    className={styles.editIcon}
                                    style={{
                                      display:
                                        data?.role_id == Role.Admin ||
                                        data?.role_id == Role.Manager
                                          ? "block"
                                          : "none",
                                      // visibility: item.status_id === 3 ? "visible" : "hidden",
                                    }}
                                    onClick={() => {
                                      router.push(`/Request/Manage/${item.id}`);
                                      setReady(false);
                                    }}
                                  >
                                    <BiCommentCheck
                                      size={18}
                                      title={"Manage"}
                                    />
                                  </div>
                                )}
                                {item.associatedrequestid === null &&
                                  item.status_id != 4 && (
                                    <div
                                      className={styles.editIcon}
                                      onClick={() => {
                                        router.push(
                                          `/Request/CorrectiveRequest/${item.id}`
                                        );
                                        setReady(false);
                                      }}
                                    >
                                      <HiOutlineLink
                                        size={18}
                                        title={"Create Corrective Request"}
                                      />
                                    </div>
                                  )}
                                <div
                                  className={styles.editIcon}
                                  onClick={() => {
                                    setCurrentHistory(item.activity_log);
                                  }}
                                >
                                  <AiOutlineHistory
                                    size={18}
                                    title={"View History"}
                                  />
                                </div>
                              </div>
                            </Cell>
                          </Row>

                          {ids.includes(item.id) &&
                            (item.fault_description != undefined ? (
                              <tr
                                style={{
                                  display: "flex",
                                  gridColumn: "1 / -1",
                                }}
                              >
                                <td style={{ flex: "1" }}>
                                  <ul className={styles.tableUL}>
                                    <li
                                      className={styles.tableDropdownListItem}
                                    >
                                      <p>
                                        <strong>Fault Description</strong>
                                      </p>
                                      <p>{item.fault_description}</p>
                                    </li>
                                    <li
                                      className={styles.tableDropdownListItem}
                                    >
                                      <p>
                                        <strong>Assigned To</strong>
                                      </p>
                                      <p>
                                        {item.assigned_user_name.trim() === ""
                                          ? "UNASSIGNED"
                                          : item.assigned_user_name}
                                      </p>
                                    </li>
                                    <li
                                      className={styles.tableDropdownListItem}
                                    >
                                      <p
                                        className={
                                          styles.tableDropdownListItemHeader
                                        }
                                      >
                                        <strong>Fault File</strong>
                                      </p>
                                      {item.uploaded_file ? (
                                        <Image
                                          src={URL.createObjectURL(
                                            new Blob([
                                              new Uint8Array(
                                                item.uploaded_file.data
                                              ),
                                            ])
                                          )}
                                          alt=""
                                          className={styles.tableDropdownImg}
                                          onClick={() =>
                                            setModalSrc(
                                              URL.createObjectURL(
                                                new Blob([
                                                  new Uint8Array(
                                                    item.uploaded_file.data
                                                  ),
                                                ])
                                              )
                                            )
                                          }
                                          width={200}
                                          height={200}
                                        />
                                      ) : (
                                        <p>No File</p>
                                      )}
                                    </li>
                                    <li
                                      className={styles.tableDropdownListItem}
                                    >
                                      <p
                                        className={
                                          styles.tableDropdownListItemHeader
                                        }
                                      >
                                        <strong>Completion File</strong>
                                      </p>
                                      {item.completion_file ? (
                                        <Image
                                          src={URL.createObjectURL(
                                            new Blob([
                                              new Uint8Array(
                                                item.completion_file.data
                                              ),
                                            ])
                                          )}
                                          alt=""
                                          className={styles.tableDropdownImg}
                                          onClick={() =>
                                            setModalSrc(
                                              URL.createObjectURL(
                                                new Blob([
                                                  new Uint8Array(
                                                    item.completion_file.data
                                                  ),
                                                ])
                                              )
                                            )
                                          }
                                          width={200}
                                          height={200}
                                        />
                                      ) : (
                                        <p>No File</p>
                                      )}
                                    </li>
                                    <li
                                      className={styles.tableDropdownListItem}
                                    >
                                      {(data?.role_id === Role.Admin ||
                                        data?.role_id === Role.Manager ||
                                        data?.role_id === Role.Engineer) &&
                                      item.status_id === 3 ? (
                                        <Link
                                          href={`/Request/Manage/${item.id}`}
                                        >
                                          <strong>Manage</strong>
                                        </Link>
                                      ) : (data?.role_id === Role.Engineer ||
                                          data?.role_id === Role.Specialist) &&
                                        (item.status_id === 2 ||
                                          item.status_id === 5) ? (
                                        <Link
                                          href={`/Request/Complete/${item.id}`}
                                        >
                                          <strong>Complete</strong>
                                        </Link>
                                      ) : (
                                        <Link href={`/Request/View/${item.id}`}>
                                          <strong>View</strong>
                                        </Link>
                                      )}
                                    </li>
                                  </ul>
                                </td>
                              </tr>
                            ) : (
                              <tr
                                style={{
                                  display: "flex",
                                  gridColumn: "1 / -1",
                                }}
                              >
                                <td>
                                  <svg
                                    width={64}
                                    height={64}
                                    stroke={"#808080"}
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                  >
                                    <g className={animationStyles.spinner_V8m1}>
                                      <circle
                                        cx="12"
                                        cy="12"
                                        r="9.5"
                                        fill="none"
                                        strokeWidth={3}
                                      />
                                    </g>
                                  </svg>
                                </td>
                              </tr>
                            ))}
                        </React.Fragment>
                      );
                    })}
                  </Body>
                </>
              )}
            </Table>
            {requestItems.length === 0 && <div>No Requests</div>}
            <Pagination
              setPage={setPage}
              setReady={setReady}
              totalPages={totalPages}
              page={page}
            />
          </>
        )}
        <ModuleModal
          isOpen={!!modalSrc}
          closeModal={() => setModalSrc(undefined)}
          closeOnOverlayClick={true}
          hideHeader={true}
          className={styles.imageModal}
        >
          <Image src={modalSrc as string} alt="" width={500} height={500} />
        </ModuleModal>
        {currentHistory && (
          <ModuleModal
            isOpen={!!currentHistory}
            closeModal={() => setCurrentHistory(undefined)}
            closeOnOverlayClick={true}
          >
            <RequestHistory history={currentHistory!} />
          </ModuleModal>
        )}
      </ModuleContent>
    </ModuleMain>
  );
}
