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

import React, { useState, useEffect, CSSProperties } from "react";
import { ModuleContent, ModuleHeader, ModuleMain, ModuleModal } from "../../components";

import { Column, CompactTable, RowOptions } from "@table-library/react-table-library/compact";
import { useTheme } from "@table-library/react-table-library/theme";
import { getTheme } from "@table-library/react-table-library/baseline";
import { usePagination } from "@table-library/react-table-library/pagination";

import { useRequest } from "../../components/SWR";
import { CMMSRequest } from "../../types/common/interfaces";
import Link from "next/link";
import { useRouter } from "next/router";
import styles from "../../styles/Request.module.scss";
import axios from "axios";
import TooltipBtn from "../../components/TooltipBtn";
import { FiRefreshCw } from "react-icons/fi";
import { HiOutlineDownload, HiOutlineLink } from "react-icons/hi";
import { BsChevronLeft, BsChevronRight, BsFileEarmarkPlus } from "react-icons/bs";
import { AiOutlineHistory } from "react-icons/ai";
import { AiOutlineUserAdd } from "react-icons/ai";
import { BiCommentCheck } from "react-icons/bi";
import Image from "next/image";
import { useCurrentUser } from "../../components/SWR";
import RequestHistory from "../../components/Request/RequestHistory";
import LoadingHourglass from "../../components/LoadingHourglass";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import PageButton from "../../components/PageButton";
import { Role } from "../../types/common/enums";

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
    fullname: string;
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
        default:
            return "#757575";
    }
};

export const downloadCSV = async (type: string) => {
    try {
        const response = await axios({
            url: `/api/${type}/csv`,
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

export default function Request() {
    const [requestItems, setRequestItems] = useState<RequestItem[]>([]);
    const [isReady, setReady] = useState(false);
    const [modalSrc, setModalSrc] = useState<string | undefined>();
    const [ids, setIds] = React.useState<string[]>([]);
    const [currentHistory, setCurrentHistory] = useState<string | undefined>();
    const [activeTabIndex, setActiveTabIndex] = useState(0);

    const router = useRouter();
    const { data } = useCurrentUser();

    const pageData = { nodes: requestItems };

    const pagination = usePagination(pageData, {
        state: {
            page: 0,
            size: 10,
        },
    });
    const totalPages = pagination.state.getTotalPages(pageData.nodes);

    const switchColumns = (index: number) => {
        setReady(false);
        setActiveTabIndex(index);
    };

    const COLUMNS: Column<RequestItem>[] = [
        {
            label: "ID",
            resize: true,
            renderCell: (item) => item.id,
        },
        {
            label: "Fault Type",
            resize: true,
            renderCell: (item) => item.fault_name,
        },
        {
            label: "Location",
            resize: true,
            renderCell: (item) => item.plant_name,
        },
        {
            label: "Priority",
            resize: true,
            renderCell: (item) => (
                <span style={{ color: getColor(item.priority), fontWeight: "bold" }}>
                    {item.priority == null ? "-" : item.priority}
                </span>
            ),
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
            label: "Asset Name",
            resize: true,
            renderCell: (item) => item.asset_name,
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
                                router.push(`/Request/Assign/${item.id}`);
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
                                router.push(`/Request/Manage/${item.id}`);
                                setReady(false);
                            }}
                        >
                            <BiCommentCheck size={18} title={"Manage"} />
                        </div>
                    )}
                    <div
                        className={styles.editIcon}
                        onClick={() => {
                            router.push(`/Request/CorrectiveRequest/${item.id}`);
                            setReady(false);
                        }}
                    >
                        <HiOutlineLink size={18} title={"Create Corrective Request"} />
                    </div>
                    <div
                        className={styles.editIcon}
                        onClick={() => {
                            setCurrentHistory(item.requesthistory);
                        }}
                    >
                        <AiOutlineHistory size={18} title={"View History"} />
                    </div>
                </div>
            ),
        },
    ];

    const handleExpand = (item: RequestItem) => {
        if (ids.includes(item.id)) {
            setIds(ids.filter((id) => id !== item.id));
        } else {
            setIds(ids.concat(item.id));
        }
    };

    const {
        data: requestData,
        error: requestFetchError,
        isValidating: requestIsFetchValidating,
        mutate: requestMutate,
    } = useRequest(indexedColumn[activeTabIndex]);

    const theme = useTheme([
        getTheme(),
        {
            Table: `--data-table-library_grid-template-columns:  5em 18% 8em 7em 8em 8em calc(72% - 42em) 10% 6em;
        overflow-x: hidden
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

    const ROW_PROPS = {
        onClick: handleExpand,
    };

    const ROW_OPTIONS: RowOptions<RequestItem> = {
        renderAfterRow: (item) => {
            return (
                <>
                    {ids.includes(item.id) && (
                        <tr style={{ display: "flex", gridColumn: "1 / -1" }}>
                            <td style={{ flex: "1" }}>
                                <ul className={styles.tableUL}>
                                    <li className={styles.tableDropdownListItem}>
                                        <p>
                                            <strong>Fault Description</strong>
                                        </p>
                                        <p>{item.fault_description}</p>
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
                                        <p className={styles.tableDropdownListItemHeader}>
                                            <strong>Fault File</strong>
                                        </p>
                                        {item.uploaded_file ? (
                                            <Image
                                                src={URL.createObjectURL(
                                                    new Blob([
                                                        new Uint8Array(item.uploaded_file.data),
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
                                    <li className={styles.tableDropdownListItem}>
                                        <p className={styles.tableDropdownListItemHeader}>
                                            <strong>Completion File</strong>
                                        </p>
                                        {item.completion_file ? (
                                            <Image
                                                src={URL.createObjectURL(
                                                    new Blob([
                                                        new Uint8Array(item.completion_file.data),
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

    useEffect(() => {
        // if (requestIsFetchValidating) setReady(false);

        if (!isReady && requestData && !requestIsFetchValidating) {
            if (requestData.length > 0) {
                setRequestItems(
                    requestData.map((row: CMMSRequest) => {
                        return {
                            id: row.request_id,
                            request_name: row.request_name,
                            created_date: row.created_date,
                            fullname: row.fullname,
                            fault_name: row.fault_name,
                            fault_id: row.fault_id,
                            asset_name: row.asset_name,
                            psa_id: row.psa_id,
                            req_id: row.req_id,
                            plant_name: row.plant_name,
                            plant_id: row.plant_id,
                            priority: row.priority,
                            priority_id: row.priority_id,
                            status: row.status,
                            status_id: row.status_id,
                            assigned_user_email: row.assigned_user_email,
                            assigned_user_id: row.assigned_user_id,
                            assigned_user_name: row.assigned_user_name,
                            fault_description: row.fault_description,
                            uploaded_file: row.uploaded_file,
                            requesthistory: row.requesthistory,
                            complete_comments: row.complete_comments,
                            completion_file: row.completion_file,
                        };
                    })
                );
            } else {
                setRequestItems([]);
            }
            setReady(true);
        }
    }, [requestData, requestIsFetchValidating, isReady]);

    return (
        <ModuleMain>
            <ModuleHeader title="Request" header="Request">
                <TooltipBtn onClick={() => requestMutate()} text="Refresh">
                    <FiRefreshCw size={20} />
                </TooltipBtn>
                <Link href="./Request/New">
                    <TooltipBtn text="New Request">
                        <BsFileEarmarkPlus href="./Request/New" size={20} />
                    </TooltipBtn>
                </Link>
                <a>
                    <TooltipBtn text="Export CSV" onClick={() => downloadCSV("request")}>
                        <HiOutlineDownload size={20} />
                    </TooltipBtn>
                </a>
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
                {!isReady && (
                    <div
                        style={{
                            position: "absolute",
                            top: "50%",
                            left: "50%",
                            transform: "translate(-50%, -50%)",
                            textAlign: "center",
                        }}
                    >
                        <LoadingHourglass />
                    </div>
                )}
                {requestFetchError && <div>{requestFetchError.toString()}</div>}
                {requestFetchError && <div>error</div>}
                {isReady && (
                    <>
                        <CompactTable
                            columns={COLUMNS}
                            data={{ nodes: requestItems }}
                            theme={theme}
                            layout={{ custom: true }}
                            rowProps={ROW_PROPS}
                            rowOptions={ROW_OPTIONS}
                            pagination={pagination}
                        />
                        <div className={styles.requestPagination}>
                            <FaChevronLeft
                                size={15}
                                className={`${styles.paginationChevron} ${
                                    pagination.state.page - 1 >= 0 ? styles.active : styles.disabled
                                }`}
                                onClick={() =>
                                    pagination.state.page - 1 >= 0
                                        ? pagination.fns.onSetPage(pagination.state.page - 1)
                                        : ""
                                }
                            />
                            <span>
                                {pagination.state.page >= 2 && (
                                    <span>
                                        <PageButton pagination={pagination}>1</PageButton>
                                        {pagination.state.page - 1 >= 2 && <span>...</span>}
                                    </span>
                                )}
                                {pagination.state
                                    .getPages(pageData.nodes)
                                    .map((data: any, index: number) => {
                                        if (
                                            index === pagination.state.page + 1 ||
                                            index === pagination.state.page ||
                                            index === Math.abs(pagination.state.page - 1)
                                        ) {
                                            return (
                                                <PageButton key={index} pagination={pagination}>
                                                    {index + 1}
                                                </PageButton>
                                            );
                                        }
                                    })}
                                {pagination.state.page <= totalPages - 3 && (
                                    <span>
                                        {totalPages - pagination.state.page >= 4 && (
                                            <span>...</span>
                                        )}
                                        <PageButton pagination={pagination}>
                                            {totalPages}
                                        </PageButton>
                                    </span>
                                )}
                            </span>
                            <FaChevronRight
                                size={15}
                                className={`${styles.paginationChevron} ${
                                    pagination.state.page + 1 <= totalPages - 1
                                        ? styles.active
                                        : styles.disabled
                                }`}
                                onClick={() =>
                                    pagination.state.page + 1 <= totalPages - 1
                                        ? pagination.fns.onSetPage(pagination.state.page + 1)
                                        : ""
                                }
                            />
                        </div>
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
                <ModuleModal
                    isOpen={!!currentHistory}
                    closeModal={() => setCurrentHistory(undefined)}
                    closeOnOverlayClick={true}
                >
                    <RequestHistory history={currentHistory} />
                </ModuleModal>
            </ModuleContent>
        </ModuleMain>
    );
}
