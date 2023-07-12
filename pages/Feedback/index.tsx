/* 
  EXPLANATION OF Feedback MODULE
  
  The Feedback module is made of 3 major components:
  - /components/feedback/FeedbackAssignmentForm.tsx
  - /components/feedback/FeedbackCompletedForm.tsx
  - /components/Guest/FeedbackContainer.tsx

  - FeedbackAssignmentForm is a form component that allows users to fill
    in details to assign feedbacks that were submitted. Engineers and 
    Managers can assign feedbacks to other users as well. Please 
    review it for more details

  - FeedbackCompleteForm is the form componenet that allows user to fill
    in detail to complete the feedback that were assigned. Engineers and
    managers can complete the feedbacks as well. Please review the componenet
    for more information
  
  - FeedbackContainer is a form component that allows guest and users to fill
    in details to create and submit a new feedback. You can access with or without
    an account. Please review the component for more details

*/

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
import FeedbackHistory from "../../components/Feedback/FeedbackHistory";
import moment from "moment";

const indexedColumn: ("pending" | "assigned" | "completed")[] = [
  "pending",
  "assigned",
  "completed",
];

export interface FeedbackFormProps {
  feedbackData: CMMSFeedback;
  setFeedbackData: React.Dispatch<React.SetStateAction<CMMSFeedback>>;
  disableForm?: boolean;
}

// const downloadCSV = async (type: string, activeTabIndex: number) => {
//   try {
//     const response = await instance({
//       url: `/api/${type}/csv?activeTab=${JSON.stringify(activeTabIndex)}`,
//       method: "get",
//       responseType: "arraybuffer",
//     });
//     const blob = new Blob([response.data]);
//     const url = window.URL.createObjectURL(blob);
//     const temp_link = document.createElement("a");
//     temp_link.download = `${type}.csv`;
//     temp_link.href = url;
//     temp_link.click();
//     temp_link.remove();
//   } catch (e) {
//     console.log(e);
//   }
// };

export default function Feedback() {
  const [feedbackItems, setFeedbackItems] = useState<CMMSFeedback[]>([]);
  const [isReady, setReady] = useState(false);
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const user = useCurrentUser();
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [history, setHistory] = useState<
    { [key: string]: string }[] | undefined
  >(undefined);

  const theme = useTheme([
    getTheme(),
    {
      Table:
        "--data-table-library_grid-template-columns:  4em 15em 8em 15em 9em 8em 11em 7em 5em;",
    },
  ]);

  const switchColumns = (index: number) => {
    if (isReady) {
      setReady(false);
      setActiveTabIndex(index);
      // setPage(1);
    }
  };

  useEffect(() => {
    setReady(false);

    const PARAMS = [
      "id",
      "description",
      "status",
      "created_date",
      "assigned_user_name",
      "plant_name",
      "loc_floor",
      "loc_room",
      "name",
    ];

    instance
      .get(
        `/api/feedback/${indexedColumn[activeTabIndex]}?page=${page}&expand=${PARAMS}`
      )
      .then((response) => {
        setFeedbackItems(
          response.data.rows.map((row: CMMSFeedback) => {
            return {
              ...row,
            };
          })
        );
        setTotalPages(response.data.total);
        setReady(true);
      })
      .catch((e) => {
        setReady(true);
        setFeedbackItems([]);
      });
  }, [activeTabIndex, page]);
  // console.log(isReady);
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
        {
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
        }
        {isReady && feedbackItems.length === 0 && <div></div>}
        {isReady ? (
          <>
            <Table
              data={{ nodes: feedbackItems }}
              theme={theme}
              layout={{ custom: true, horizontalScroll: true }}
            >
              {(tableList: CMMSFeedback[]) => (
                <>
                  <Header>
                    <HeaderRow>
                      <HeaderCell resize>ID</HeaderCell>
                      <HeaderCell resize>Details</HeaderCell>
                      <HeaderCell resize>Status</HeaderCell>
                      <HeaderCell resize>Created On</HeaderCell>
                      <HeaderCell resize>Assigned To</HeaderCell>
                      <HeaderCell resize>Plant</HeaderCell>
                      <HeaderCell resize>Location</HeaderCell>
                      <HeaderCell resize>Created By</HeaderCell>
                      <HeaderCell resize>Actions</HeaderCell>
                    </HeaderRow>
                  </Header>

                  <Body>
                    {tableList.map((item) => {
                      // console.log(item);
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
                          <Cell>
                            {moment(new Date(item.created_date)).format(
                              "MMMM Do YYYY, h:mm:ss a"
                            )}
                          </Cell>
                          <Cell>{item.assigned_user_name}</Cell>
                          <Cell>{item.plant_name}</Cell>
                          <Cell>
                            {item.loc_floor} floor, {item.loc_room}
                          </Cell>
                          <Cell>{item.name}</Cell>
                          <Cell>
                            {item.status_id === 2 || item.status_id === 3 ? (
                              <>
                                <Link href={`/Feedback/Complete/${item.id}`}>
                                  <AiOutlineFileDone
                                    size={22}
                                    title={"Complete"}
                                  />
                                </Link>
                              </>
                            ) : (user.data!.role_id === Role.Admin ||
                                user.data!.role_id === Role.Manager ||
                                user.data!.role_id === Role.Engineer) &&
                              item.status_id === 1 ? (
                              <Link href={`/Feedback/Assign/${item.id}`}>
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
