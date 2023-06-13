import React, { useEffect, useState } from "react";
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
  useCurrentUser,
  useFeedbackFilter,
  useFeedback,
} from "../../components/SWR";
import { CMMSFeedback } from "../../types/common/interfaces";
import { ThreeDots } from "react-loading-icons";
import { getColor } from "../Request";
import { HiOutlineDownload } from "react-icons/hi";
import TooltipBtn from "../../components/TooltipBtn";
import { BsFileEarmarkPlus } from "react-icons/bs";
import LoadingHourglass from "../../components/LoadingHourglass";
import instance from "../../types/common/axios.config";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import {
  AiOutlineFolderView,
  AiOutlineFileDone,
  AiOutlineFileProtect,
  AiOutlineHistory,
  AiOutlineUserAdd,
} from "react-icons/ai";
import PageButton from "../../components/PageButton";
import styles from "../../styles/Request.module.scss";
import { Role } from "../../types/common/enums";
import Pagination from "../../components/Pagination";
import { GetServerSidePropsContext } from "next";
import ChecklistHistory from "../../components/Checklist/ChecklistHistory";
import FeedbackHistory from "../../components/Feedback/FeedbackHistory";

const indexedColumn: ("pending" | "assigned" | "completed")[] = [
  "pending",
  "assigned",
  "completed",
];

export interface FeedbackItem {
  id: number;
  created_date: Date;
  description?: string;
  status_id?: number;
  createdbyuser: string;
  feedback_id: number;
  loc_floor: string;
  loc_room: string;
  plant_id: number;
  status: string;
  assigned_user_email: string;
  assigned_user_id: number;
  assigned_user_name: string;
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

export default function Feedback(props: FeedbackProps) {
  const [feedbackItems, setFeedbackItems] = useState<FeedbackItem[]>([]);
  const [isReady, setReady] = useState(false);
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const user = useCurrentUser();
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [history, setHistory] = useState<
    { [key: string]: string }[] | undefined
  >(undefined);
  const filteredData = useFeedbackFilter(props, page);
  const columnData = useFeedback(indexedColumn[activeTabIndex], page);

  const { data, error, isValidating, mutate } = props.filter
    ? filteredData
    : columnData;

  const theme = useTheme([
    getTheme(),
    {
      Table:
        "--data-table-library_grid-template-columns:  5em calc(90% - 46em) 7em 8em 10em 10em 10% 5em;",
    },
  ]);

  const switchColumns = (index: number) => {
    if (isReady) {
      setReady(false);
      setActiveTabIndex(index);
      setPage(1);
    }
  };

  const editRow: OnClick<FeedbackItem> = (item, event) => {
    const feedbackRow = item;
  };

  useEffect(() => {
    if (data && !isValidating) {
      if (props?.filter) {
        if (data?.rows?.length > 0) {
          setFeedbackItems(
            data.rows.map((row: CMMSFeedback) => {
              return {
                id: row.feedback_id,
                ...row,
              };
            })
          );

          setReady(true);
          setTotalPages(data.total);
        }
      }
    }
    // if (!data) {
    //     setReady(false);
    //     setChecklistItems([]);
    //     setTotalPages(1);
    // }
  }, [data, isValidating, isReady, page, props?.isReady]);

  useEffect(() => {
    if (!props?.filter) {
      setReady(false);
      instance
        .get(`/api/feedback/${indexedColumn[activeTabIndex]}?page=${page}`)
        .then((response) => {
          setFeedbackItems(
            response.data.rows.map((row: CMMSFeedback) => {
              return {
                id: row.feedback_id,
                ...row,
              };
            })
          );
          setTotalPages(response.data.total);
          setReady(true);
        })
        .catch((e) => {
          setFeedbackItems([]);
        });
    }
  }, [activeTabIndex, page]);

  return (
    <ModuleMain>
      <ModuleHeader title="Feedback" header="Feedback">
        {/* <Link href="/feedback/Form?action=New"> */}
        {/* <TooltipBtn text="New feedback">
            <BsFileEarmarkPlus size={20} />
          </TooltipBtn>
        </Link>
        <TooltipBtn
          onClick={() => downloadCSV("feedback", activeTabIndex)}
          text="Export CSV"
        >
          <HiOutlineDownload size={20} />
        </TooltipBtn> */}
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
              <span style={{ all: "unset" }}>Completed</span>
            </li>
          </ul>
        )}
        {isReady && feedbackItems.length === 0 && <div>No Feedback</div>}
        {isReady ? (
          <>
            <Table
              data={{ nodes: feedbackItems }}
              theme={theme}
              layout={{ custom: true }}
            >
              {(tableList: FeedbackItem[]) => (
                <>
                  <Header>
                    <HeaderRow>
                      <HeaderCell resize>ID</HeaderCell>
                      <HeaderCell resize>Details</HeaderCell>
                      <HeaderCell resize>Status</HeaderCell>
                      <HeaderCell resize>Created On</HeaderCell>
                      <HeaderCell resize>Assigned To</HeaderCell>
                      <HeaderCell resize>Location</HeaderCell>
                      <HeaderCell resize>Created By</HeaderCell>
                      <HeaderCell resize>Actions</HeaderCell>
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
                          <Cell>{item.assigned_user_name}</Cell>
                          <Cell>
                            {item.loc_floor} floor, {item.loc_room}
                          </Cell>
                          <Cell>{item.createdbyuser}</Cell>
                          <Cell>
                            {((user.data!.role_id === Role.Admin ||
                              user.data!.role_id === Role.Manager ||
                              user.data!.role_id === Role.Engineer) &&
                              item.status_id === 2) ||
                            item.status_id === 3 ? (
                              <>
                                <Link href={`/Feedback/Complete/${item.id}`}>
                                  <AiOutlineFileDone
                                    size={22}
                                    title={"Complete"}
                                  />
                                </Link>
                              </>
                            ) : item.status_id === 1 ? (
                              <Link href={`/Feedback/Form/${item.id}`}>
                                <AiOutlineUserAdd size={22} title={"Assign"} />
                              </Link>
                            ) : (
                              <Link href={`/Feedback/View/${item.id}`}>
                                <AiOutlineFolderView size={22} title={"View"} />
                              </Link>
                            )}
                            <AiOutlineHistory
                              color={"#C70F2B"}
                              onClick={() => setHistory(item.activity_log)}
                              size={22}
                              title={"View History"}
                            />
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
            <FeedbackHistory history={history!} />
          </ModuleModal>
        )}
      </ModuleContent>
    </ModuleMain>
  );
}
