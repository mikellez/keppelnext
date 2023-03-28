import React, { useState, useEffect, CSSProperties } from "react";
import {
  ModuleContent,
  ModuleHeader,
  ModuleMain,
  ModuleModal,
} from "../../components";

import { ThreeDots } from "react-loading-icons";

import {
  CompactTable,
  RowOptions,
} from "@table-library/react-table-library/compact";
import { Nullish } from "@table-library/react-table-library/types/common";
import { useTheme } from "@table-library/react-table-library/theme";
import { getTheme } from "@table-library/react-table-library/baseline";

import { useRequest } from "../../components/SWR";
import { CMMSRequest } from "../../types/common/interfaces";
import Link from "next/link";
import { useRouter } from "next/router";
import styles from "../../styles/Request.module.scss";
import axios from "axios";
import TooltipBtn from "../../components/TooltipBtn";
import { FiRefreshCw } from "react-icons/fi";
import { HiOutlineDownload, HiOutlineLink } from "react-icons/hi";
import { BsFileEarmarkPlus } from "react-icons/bs";
import { AiOutlineHistory } from "react-icons/ai";
import { AiOutlineUserAdd } from "react-icons/ai";
import Image from "next/image";
import { useCurrentUser } from "../../components/SWR";
import RequestHistory from "../../components/Request/RequestHistory";

export type TableNode<T> = {
  id: string;
  nodes?: TableNode<T>[] | Nullish;
  prop: T;
};

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
  const [requestNodes, setRequestNodes] = useState<TableNode<CMMSRequest>[]>(
    []
  );
  const [isReady, setReady] = useState(false);
  const [modalSrc, setModalSrc] = useState<string | undefined>();
  const [ids, setIds] = React.useState<string[]>([]);
  const [currentHistory, setCurrentHistory] = useState<string | undefined>();

  const router = useRouter();
  const { data } = useCurrentUser();

  const COLUMNS: any[] = [
    {
      label: "ID",
      resize: true,
      renderCell: (item: TableNode<CMMSRequest>) => item.prop.request_id,
    },
    {
      label: "Fault Type",
      resize: true,
      renderCell: (item: TableNode<CMMSRequest>) => item.prop.fault_name,
    },
    {
      label: "Location",
      resize: true,
      renderCell: (item: TableNode<CMMSRequest>) => item.prop.plant_name,
    },
    {
      label: "Priority",
      resize: true,
      renderCell: (item: TableNode<CMMSRequest>) => (
        <span
          style={{ color: getColor(item.prop.priority), fontWeight: "bold" }}
        >
          {item.prop.priority == null ? "-" : item.prop.priority}
        </span>
      ),
    },
    {
      label: "Status",
      resize: true,
      renderCell: (item: TableNode<CMMSRequest>) => (
        <span style={{ color: getColor(item.prop.status), fontWeight: "bold" }}>
          {item.prop.status}
        </span>
      ),
    },
    {
      label: "Filter By Date",
      resize: true,
      renderCell: (item: TableNode<CMMSRequest>) =>
        item.prop.created_date.toLocaleDateString("en-US", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        }),
    },
    {
      label: "Asset Name",
      resize: true,
      renderCell: (item: TableNode<CMMSRequest>) => item.prop.asset_name,
    },
    {
      label: "Requested By",
      resize: true,
      renderCell: (item: TableNode<CMMSRequest>) => item.prop.fullname,
    },
    {
      label: "",
      renderCell: (item: TableNode<CMMSRequest>) => (
        <div className={styles.iconsDiv}>
          <div
            className={styles.editIcon}
            style={{
              display:
                data?.role_id == 1 || data?.role_id == 1 || data?.role_id == 1
                  ? "block"
                  : "none",
            }}
            onClick={() => {
              router.push(`/Request/Assign/${item.prop.request_id}`);
              setReady(false);
            }}
          >
            <AiOutlineUserAdd size={18} title={"Assign"} />
          </div>
          <div
            className={styles.editIcon}
            onClick={() => {
              router.push(`/Request/CorrectiveRequest/${item.prop.request_id}`);
              setReady(false);
            }}
          >
            <HiOutlineLink size={18} title={"Create Corrective Request"} />
          </div>
          <div
            className={styles.editIcon}
            onClick={() => {
              setCurrentHistory(item.prop.requesthistory);
            }}
          >
            <AiOutlineHistory size={18} title={"View History"} />
          </div>
        </div>
      ),
    },
  ];

  const handleExpand = (item: TableNode<CMMSRequest>) => {
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
  } = useRequest();

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

  const ROW_OPTIONS: RowOptions = {
    renderAfterRow: (item: any) => {
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
                    <p>{item.prop.fault_description}</p>
                  </li>
                  <li className={styles.tableDropdownListItem}>
                    <p>
                      <strong>Assigned To</strong>
                    </p>
                    <p>
                      {item.prop.assigned_user_name.trim() === ""
                        ? "UNASSIGNED"
                        : item.prop.assigned_user_name}
                    </p>
                  </li>
                  <li className={styles.tableDropdownListItem}>
                    <p className={styles.tableDropdownListItemHeader}>
                      <strong>Fault File</strong>
                    </p>
                    {item.prop.uploaded_file ? (
                      <Image
                        src={URL.createObjectURL(
                          new Blob([
                            new Uint8Array(item.prop.uploaded_file.data),
                          ])
                        )}
                        alt=""
                        className={styles.tableDropdownImg}
                        onClick={() =>
                          setModalSrc(
                            URL.createObjectURL(
                              new Blob([
                                new Uint8Array(item.prop.uploaded_file.data),
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
                    {item.prop.completion_file ? (
                      <Image
                        src={URL.createObjectURL(
                          new Blob([
                            new Uint8Array(item.prop.completion_file.data),
                          ])
                        )}
                        alt=""
                        className={styles.tableDropdownImg}
                        onClick={() =>
                          setModalSrc(
                            URL.createObjectURL(
                              new Blob([
                                new Uint8Array(item.prop.completion_file.data),
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
                    <Link
                      href={`/Request/${
                        data?.role_id === 1 || data?.role_id === 2
                          ? "Manage"
                          : "Complete"
                      }/${item.id}`}
                    >
                      <strong>
                        {(data?.role_id === 1 || data?.role_id === 2) &&
                          item.prop.status_id === 3 &&
                          "Manage"}
                        {(data?.role_id === 3 || data?.role_id === 4) &&
                          (item.prop.status_id === 2 ||
                            item.prop.status_id === 5) &&
                          "Complete"}
                      </strong>
                    </Link>
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
    if (requestIsFetchValidating) setReady(false);

    if (requestData && !requestIsFetchValidating) {
      setRequestNodes(
        requestData.map((row: CMMSRequest): TableNode<CMMSRequest> => {
          return {
            id: row.request_id,
            prop: row,
          };
        })
      );
      setReady(true);
    }
  }, [requestData, requestIsFetchValidating]);

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
        {!isReady && (
          <div style={{ width: "100%", textAlign: "center" }}>
            <ThreeDots fill="black" />
          </div>
        )}
        {requestFetchError && <div>{requestFetchError.toString()}</div>}
        {requestFetchError && <div>error</div>}
        {isReady && (
          <>
            <CompactTable
              columns={COLUMNS}
              data={{ nodes: requestNodes }}
              theme={theme}
              layout={{ custom: true }}
              rowProps={ROW_PROPS}
              rowOptions={ROW_OPTIONS}
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
