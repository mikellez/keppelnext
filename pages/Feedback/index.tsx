import React, {
  useState,
  useEffect,
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
import { useTheme } from "@table-library/react-table-library/theme";
import { getTheme } from "@table-library/react-table-library/baseline";

import { useRequest, useRequestFilter } from "../../components/SWR";
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
import { downloadCSV } from "../Request";

const indexedColumn: ("pending" | "assigned" | "review")[] = [
  "pending",
  "assigned",
  "review",
];

export interface FeedbackItem {
  id: string;
  created_date: Date;
  fullname: string;
  psa_id?: number;
  req_id?: number;
  plant_loc: string;
  plant_id: number;
  status: string;
  status_id?: number;
  assigned_user_email: string;
  assigned_user_id: number;
  assigned_user_name: string;
  feedback_description?: string;
  requesthistory?: string;
  complete_comments?: string;
  completion_file?: any;
  activity_log?: { [key: string]: string }[];
}

export interface FeedbackProps {
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
    case "":
    case "WORK DONE":
    case "FOR REVIEW":
      return "#0ebd05";
    default:
      return "#757575";
  }
};

export default function Feedback(props: FeedbackProps) {
  const [requestItems, setRequestItems] = useState<FeedbackItem[]>([]);
  const [isReady, setReady] = useState(false);
  const [modalSrc, setModalSrc] = useState<string | undefined>();
  const [ids, setIds] = React.useState<string[]>([]);
  const [currentHistory, setCurrentHistory] = useState<
    { [key: string]: string }[] | undefined
  >();
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
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

  const COLUMNS: Column<FeedbackItem>[] = [
    {
      label: "ID",
      resize: true,
      renderCell: (item) => item.id,
    },
    {
      label: "Feedback By",
      resize: true,
      renderCell: (item) => item.fullname,
    },
    {
      label: "Plant Location",
      resize: true,
      renderCell: (item) => item.plant_id,
    },
    {
      label: "Status",
      resize: true,
      renderCell: (item) => (
        <span style={{ color: getColor(item.status), fontWeight: "bold" }}>
          {item.status}
        </span>
      ),
    },
    {
      label: "Date",
      resize: true,
      renderCell: (item) =>
        item.created_date.toLocaleDateString("en-US", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        }),
    },
    {
      label: "Location",
      resize: true,
      renderCell: (item) => item.plant_loc,
    },
    {
      label: "Requested By",
      resize: true,
      renderCell: (item) => item.fullname,
    },
    {
      label: "",
      renderCell: (item) => (
        <div className={styles.iconsDiv}>
          {(item.status_id === 1 || item.status_id === 2) && (
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
                router.push(`/Feedback/Assign/${item.id}`);
                setReady(false);
              }}
            >
              <AiOutlineUserAdd size={18} title={"Assign"} />
            </div>
          )}
          {item.status_id === 3 && (
            <div
              className={styles.editIcon}
              style={{
                display:
                  data?.role_id == Role.Admin || data?.role_id == Role.Manager
                    ? "block"
                    : "none",
                // visibility: item.status_id === 3 ? "visible" : "hidden",
              }}
              onClick={() => {
                router.push(`/Feedback/Manage/${item.id}`);
                setReady(false);
              }}
            >
              <BiCommentCheck size={18} title={"Manage"} />
            </div>
          )}
          <div
            className={styles.editIcon}
            onClick={() => {
              setCurrentHistory(item.activity_log);
            }}
          >
            <AiOutlineHistory size={18} title={"View History"} />
          </div>
        </div>
      ),
    },
  ];
  //   const handleExpand = (item: FeedbackItem) => {
  //     if (ids.includes(item.id)) {
  //       setIds(ids.filter((id) => id !== item.id));
  //     } else {
  //       setIds(ids.concat(item.id));
  //     }
  //   };

  //   const filteredRequest = useRequestFilter(props, page);
  //   const allRequest = useRequest(indexedColumn[activeTabIndex], page);

  //   const {
  //     data: requestData,
  //     error: requestFetchError,
  //     isValidating: requestIsFetchValidating,
  //     mutate: requestMutate,
  //   } = props?.filter ? filteredRequest : allRequest;

  //   const theme = useTheme([
  //     getTheme(),
  //     {
  //       Table: `--data-table-library_grid-template-columns:  5em 18% 8em 7em 8em 8em calc(72% - 42em) 10% 6em;
  //         overflow-x: hidden
  //         `,
  //       HeaderRow: `
  // 				background-color: #eaf5fd;
  // 			`,
  //       Row: `
  // 				&:nth-of-type(odd) {
  // 					background-color: #d2e9fb;
  // 				}

  // 				&:nth-of-type(even) {
  // 					background-color: #eaf5fd;
  // 				}

  //         &:nth-of-type(n) {
  //           cursor: pointer
  //         }
  // 			`,
  //     },
  //   ]);

  //   const ROW_PROPS = {
  //     onClick: handleExpand,
  //   };
  const ROW_OPTIONS: RowOptions<FeedbackItem> = {
    renderAfterRow: (item) => {
      return (
        <>
          {ids.includes(item.id) && (
            <tr style={{ display: "flex", gridColumn: "1 / -1" }}>
              <td style={{ flex: "1" }}>
                <ul className={styles.tableUL}>
                  <li className={styles.tableDropdownListItem}>
                    <p>
                      <strong>Plant Location</strong>
                    </p>
                    <p>{item.plant_loc}</p>
                  </li>
                  <li className={styles.tableDropdownListItem}>
                    <p>
                      <strong>Assigned To</strong>
                    </p>
                    <p>
                      {item.assigned_user_name.trim() === ""
                        ? "UNASSIGNED"
                        : item.assigned_user_name}
                    </p>
                  </li>
                  <li className={styles.tableDropdownListItem}>
                    {
                      // (data?.role_id === Role.Admin ||
                      //     data?.role_id === Role.Manager) &&
                      // item.status_id === 3 ? (
                      //     <Link href={`/Request/Manage/${item.id}`}>
                      //         <strong>Manage</strong>
                      //     </Link>
                      // ) :
                      (data?.role_id === Role.Engineer ||
                        data?.role_id === Role.Specialist) &&
                      (item.status_id === 2 || item.status_id === 5) ? (
                        <Link href={`/Request/Complete/${item.id}`}>
                          <strong>Complete</strong>
                        </Link>
                      ) : (
                        <Link href={`/Request/View/${item.id}`}>
                          <strong>View</strong>
                        </Link>
                      )
                    }
                  </li>
                </ul>
              </td>
            </tr>
          )}
        </>
      );
    },
  };

  /*useEffect(() => {
    if(props?.isReady) {
      alert(props?.isReady);
      setReady(props?.isReady);
    }
  }, [props?.isReady]);*/

  console.log(isReady);
  //   useEffect(() => {
  //     // if (requestIsFetchValidating) setReady(false);

  //     if (requestData && !requestIsFetchValidating) {
  //       if (requestData?.rows?.length > 0) {
  //         setRequestItems(
  //           requestData.rows.map((row: CMMSRequest, total: number) => {
  //             return {
  //               id: row.request_id,
  //               ...row,
  //               created_date: new Date(row.created_date),
  //             };
  //           })
  //         );
  //         setReady(true);
  //         setTotalPages(requestData.total);
  //       }
  //     }
  //     if (requestData?.rows?.length === 0) {
  //       setReady(true);
  //       setRequestItems([]);
  //       setTotalPages(1);
  //     }
  //   }, [requestData, requestIsFetchValidating, isReady, page, props?.isReady]);

  return (
    <ModuleMain>
      <ModuleHeader title="Feedback" header="Feedback">
        <TooltipBtn
          //   onClick={() => requestMutate()}
          text="Refresh"
        >
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
        {/*requestFetchError && <div>{requestFetchError.toString()}</div>*/}
        {/*requestFetchError && <div>error</div>*/}
        {/* {isReady && (
          <>
            <CompactTable
              columns={COLUMNS}
              data={{ nodes: requestItems }}
              theme={theme}
              layout={{ custom: true }}
              rowProps={ROW_PROPS}
              rowOptions={ROW_OPTIONS}
            />
            {requestItems.length === 0 && <div>No Requests</div>}
            <Pagination
              setPage={setPage}
              setReady={setReady}
              totalPages={totalPages}
              page={page}
            />
          </>
        )} */}
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
