import React, { useEffect, useState } from "react";
import instance from "../../../types/common/axios.config";
import { useRouter } from "next/router";
import Link from "next/link";
import TooltipBtn from "../../../components/TooltipBtn";
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
import { MdPostAdd } from "react-icons/md";
import {
  ModuleContent,
  ModuleHeader,
  ModuleMain,
  ModuleModal,
} from "../../../components";
import { useTheme } from "@table-library/react-table-library/theme";
import { getTheme } from "@table-library/react-table-library/baseline";
import { useCurrentUser } from "../../../components/SWR";
import {
  CMMSFeedback,
  CMMSLicense,
  CMMSSchedule,
  CMMSTimeline,
} from "../../../types/common/interfaces";
import { getColor } from "../../Request";
import LoadingHourglass from "../../../components/LoadingHourglass";
import Pagination from "../../../components/Pagination";
import {
  AiOutlineEdit,
  AiOutlineFileDone,
  AiOutlineFolderView,
  AiOutlineHistory,
} from "react-icons/ai";
import { BiRefresh } from "react-icons/bi";
import Tooltip from "rc-tooltip";
import moment from "moment";
import { getTimelinesByStatus } from "../../../components/Schedule/TimelineSelect";
import { Modal } from "antd";
import CreateScheduleModal from "../../../components/Schedule/CreateScheduleModal";
import { ScheduleCreateOptions } from "../Create";

// 3 : Draft, 1 : approved
const indexedColumn: (3 | 1)[] = [3, 1];

export default function Drafts() {
  const [activeTabIndex, setActiveTabIndex] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [isReady, setReady] = useState<boolean>(false);
  const [scheduleTimelines, setScheduleTimelines] = useState<CMMSTimeline[]>(
    []
  );
  const [submitModal, setSubmitModal] = useState<boolean>(false);
  const [selectedTimeline, setSelectedTimeline] = useState<number>();
  const theme = useTheme([
    getTheme(),
    {
      Table:
        "--data-table-library_grid-template-columns: 5em 20em 10em 25em 13em 8em;",
    },
  ]);

  const handleOptions = (activeTab: number) => {
    if (activeTab == 0) {
      return ScheduleCreateOptions.Drafts;
    } else if (activeTab == 1) {
      return ScheduleCreateOptions.Approved;
    }
  };

  const switchColumns = (index: number) => {
    if (isReady) {
      setReady(false);
      setActiveTabIndex(index);
      // setPage(1);
    }
  };

  useEffect(() => {
    getTimelinesByStatus(indexedColumn[activeTabIndex], true)
      .then((result) => {
        if (result) {
          //   console.log(result);
          setScheduleTimelines(result);
        }
      })
      .catch((err) => {
        console.log(err);
      });

    setReady(true);
  }, [activeTabIndex]);

  return (
    <ModuleMain>
      <ModuleHeader title="View Draft schedule" header="View Draft Schedule" />
      <ModuleContent>
        {
          <ul className="nav nav-tabs">
            <li
              onClick={() => {
                activeTabIndex !== 0 && switchColumns(0);
              }}
              className={"nav-link" + (activeTabIndex === 0 ? " active" : "")}
            >
              <span style={{ all: "unset" }}>Drafts</span>
            </li>
            <li
              onClick={() => {
                activeTabIndex !== 1 && switchColumns(1);
              }}
              className={"nav-link" + (activeTabIndex === 1 ? " active" : "")}
            >
              <span style={{ all: "unset" }}>Approved</span>
            </li>
          </ul>
        }
        {isReady && scheduleTimelines?.length === 0 && <div> no Schedules</div>}
        {isReady ? (
          <>
            <Table
              data={{ nodes: scheduleTimelines }}
              theme={theme}
              layout={{ custom: true, horizontalScroll: true }}
            >
              {(tableList: CMMSTimeline[]) => (
                <>
                  <Header>
                    <HeaderRow>
                      <HeaderCell resize>ID</HeaderCell>
                      <HeaderCell resize>Schedule Name</HeaderCell>
                      <HeaderCell resize>Plant Name</HeaderCell>
                      <HeaderCell resize>Description</HeaderCell>
                      <HeaderCell resize>Date Created</HeaderCell>
                      <HeaderCell resize>Actions</HeaderCell>
                    </HeaderRow>
                  </Header>
                  <Body>
                    {tableList.map((item) => {
                      // console.log(item);
                      const key = {
                        id: item.id!,
                      };
                      return (
                        <Row key={item.id} item={key}>
                          <Cell>{item.id}</Cell>
                          <Cell>{item.name}</Cell>
                          <Cell>
                            <Tooltip
                              overlayInnerStyle={{ fontSize: "0.7rem" }}
                              placement="bottom"
                              trigger={["hover"]}
                              overlay={<span>{item.plantId}</span>}
                            >
                              <div>{item.plantName}</div>
                            </Tooltip>
                          </Cell>
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
                            <Tooltip
                              overlayInnerStyle={{ fontSize: "0.7rem" }}
                              placement="bottom"
                              trigger={["hover"]}
                              overlay={
                                <span>
                                  {item.created_date
                                    ? moment(
                                        new Date(item.created_date)
                                      ).format("MMMM Do YYYY, h:mm:ss a")
                                    : null}
                                </span>
                              }
                            >
                              <div>
                                {item.created_date
                                  ? moment(new Date(item.created_date)).format(
                                      "MMMM Do YYYY, h:mm:ss a"
                                    )
                                  : null}
                              </div>
                            </Tooltip>
                          </Cell>
                          <Cell>
                            <AiOutlineEdit
                              color="#C70F2B"
                              size={22}
                              title={"Edit"}
                              onClick={() => {
                                setSelectedTimeline(item.id);
                                setSubmitModal(true);
                              }}
                            />
                            {/* <Link href={`/License/View/${item.id}`}>
                              <AiOutlineFolderView size={22} title={"View"} />
                            </Link> */}
                            {/* <AiOutlineHistory
                              color={"#C70F2B"}
                              onClick={() => setHistory(item.activity_log)}
                              size={22}
                              title={"View History"}
                            /> */}
                          </Cell>
                        </Row>
                      );
                    })}
                  </Body>
                </>
              )}
            </Table>

            {/* <Pagination
              setPage={setPage}
              setReady={setReady}
              totalPages={totalPages}
              page={page}
            /> */}
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
        {/* {history && (
          <ModuleModal
            isOpen={!!history}
            closeModal={() => setHistory(undefined)}
            closeOnOverlayClick={true}
            large
          >
            <LicenseHistory history={history} />
          </ModuleModal>
        )} */}
        <CreateScheduleModal
          isOpen={submitModal}
          closeModal={() => setSubmitModal(false)}
          option={handleOptions(activeTabIndex)}
          title={"Create from " + handleOptions(activeTabIndex)?.toString()}
          specificTimelineId={selectedTimeline}
        />
      </ModuleContent>
    </ModuleMain>
  );
}
