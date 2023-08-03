import React, { useEffect, useState } from "react";
import instance from "../../../types/common/axios.config";
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
import { CMMSTimeline } from "../../../types/common/interfaces";
import { getColor } from "../../Request";
import LoadingHourglass from "../../../components/LoadingHourglass";
import {
  AiOutlineEdit,
  AiOutlineFileDone,
  AiOutlineFolderView,
  AiOutlineHistory,
} from "react-icons/ai";
import { BiCommentCheck } from "react-icons/bi";
import Tooltip from "rc-tooltip";
import moment from "moment";
import { getTimelinesByStatus } from "../../../components/Schedule/TimelineSelect";
import { Modal } from "antd";
import CreateScheduleModal from "../../../components/Schedule/CreateScheduleModal";
import { ScheduleCreateOptions } from "../Create";
import { ScheduleInfo } from "../../../components/Schedule/ScheduleTemplate";
import { getSchedules } from "../Timeline/[id]";
import ApproveSchedulePreviewModal from "../../../components/Schedule/ApproveSchedulePreviewModal";

// 3 : Draft, 1 : approved
const indexedColumn: (3 | 4)[] = [3, 4];

export default function Pending() {
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [isReady, setReady] = useState<boolean>(false);
  const [scheduleTimelines, setScheduleTimelines] = useState<CMMSTimeline[]>(
    []
  );
  const [approveModal, setApproveModal] = useState<boolean>(false);
  const [submitModal, setSubmitModal] = useState<boolean>(false);
  const [selectedTimeline, setSelectedTimeline] = useState<number>();
  const [selectedTimelineItem, setSelectedTimelineItem] =
    useState<ScheduleInfo[]>();
  const theme = useTheme([
    getTheme(),
    {
      Table:
        "--data-table-library_grid-template-columns: 5em 20em 10em 25em 13em 8em;",
    },
  ]);

  const { data } = useCurrentUser();

  const checkManager = (role: number) => {
    if (role == 1 || role == 2) {
      return true;
    } else if (role == 3 || role == 4) {
      return false;
    }
  };
  const [isManager, setIsManager] = useState<boolean>();
  const [activeTabIndex, setActiveTabIndex] = useState<number>(
    isManager ? 1 : 0
  );

  useEffect(() => {
    const role = data?.role_id;
    if (role == 1 || role == 2) {
      setIsManager(true);
      setActiveTabIndex(1);
    } else if (role == 3 || role == 4) {
      setIsManager(false);
      setActiveTabIndex(0);
    }
    console.log(role);
  }, [data]);

  const handleOptions = (activeTab: number) => {
    if (activeTab == 0) {
      return ScheduleCreateOptions.Drafts;
    } else if (activeTab == 1) {
      return ScheduleCreateOptions.Approved;
    }
  };

  useEffect(() => {
    if (data?.role_id) {
      setIsManager(checkManager(data.role_id));
      getTimelinesByStatus(
        indexedColumn[checkManager(data.role_id) ? 1 : 0],
        activeTabIndex == 0 ? true : false
      )
        .then((result: any) => {
          if (result) {
            //   console.log(result);
            setScheduleTimelines(result);
          } else {
            setScheduleTimelines([]);
          }
        })
        .catch((err) => {
          console.log(err);
          setScheduleTimelines([]);
        });

      setReady(true);
    }
  }, [activeTabIndex, data]);

  useEffect(() => {
    if (selectedTimeline) {
      getSchedules(selectedTimeline!)
        .then((res) => {
          if (res) {
            setSelectedTimelineItem(res);
          }
        })
        .catch(console.log);
    }
  }, [selectedTimeline]);

  return (
    <ModuleMain>
      <ModuleHeader
        title="Pending Schedule Task"
        header="Pending Schedule Task"
      />
      <ModuleContent>
        {
          <ul className="nav nav-tabs">
            <li className={"nav-link"}>
              <span style={{ all: "unset" }}>
                {handleOptions(activeTabIndex)}
              </span>
            </li>
          </ul>
        }

        {isReady && scheduleTimelines?.length === 0 && <div></div>}
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
                            {!isManager ? (
                              <Tooltip
                                overlayInnerStyle={{ fontSize: "0.7rem" }}
                                placement="bottom"
                                trigger={["hover"]}
                                overlay={<span>{"Approve"}</span>}
                              >
                                <AiOutlineEdit
                                  color="#C70F2B"
                                  size={22}
                                  title={"Edit"}
                                  onClick={() => {
                                    setSelectedTimeline(item.id);
                                    setSubmitModal(true);
                                  }}
                                />
                              </Tooltip>
                            ) : (
                              <Tooltip
                                overlayInnerStyle={{ fontSize: "0.7rem" }}
                                placement="bottom"
                                trigger={["hover"]}
                                overlay={<span>{"Approve"}</span>}
                              >
                                <BiCommentCheck
                                  color="#C70F2B"
                                  size={22}
                                  title={"Approve"}
                                  onClick={() => {
                                    setApproveModal(true);
                                    setSelectedTimeline(item.id);
                                  }}
                                />
                              </Tooltip>
                            )}
                          </Cell>
                        </Row>
                      );
                    })}
                  </Body>
                </>
              )}
            </Table>
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
          closeModal={() => {
            setSubmitModal(false);
          }}
          option={handleOptions(activeTabIndex)}
          title={"Create from " + handleOptions(activeTabIndex)?.toString()}
          specificTimelineId={selectedTimeline}
          closeOnBlur={true}
        />
        <ApproveSchedulePreviewModal
          modalOpenRef={approveModal}
          setModalRef={setApproveModal}
          title="Approve"
          scheduleInfo={selectedTimelineItem!}
          timelineId={selectedTimeline!}
        />
      </ModuleContent>
    </ModuleMain>
  );
}
