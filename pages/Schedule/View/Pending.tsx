/**
 * Documentation of view pending Schedule Module
 *
 *
 * This module makes use of 2 main componenets
 * - CreateScheduleModal
 * - ApproveSchedulePreviewModal
 *
 * The page will show different data depending on the userpermissions from useCurrentUser
 * Drafts will be shown when the user does not have the "CanManageSchedules" permission while pending drafts will be shown when
 * the user has the permission.
 *
 *
 * For each entry there will be a action button at the end.
 * For drafts - Submit button at the end will open the CreateScheduleModal
 * For Approval - ApproveSchedulePreviewModal will be shown
 * For Completed - ApproveSchedulePreviewModal will be shown with its remarks, accept, reject columns removed.
 *
 * upon any action, the page will be reloaded
 *
 *
 */

import React, { useEffect, useState } from "react";
import ReactTooltip from "react-tooltip";
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
  AiOutlineDelete
} from "react-icons/ai";
import { BiCommentCheck } from "react-icons/bi";

import moment from "moment";
import { getTimelinesByStatus } from "../../../components/Schedule/TimelineSelect";
import { Modal } from "antd";
import CreateScheduleModal from "../../../components/Schedule/CreateScheduleModal";
import { ScheduleCreateOptions } from "../Create";
import { ScheduleInfo } from "../../../components/Schedule/ScheduleTemplate";
import { getSchedules } from "../Timeline/[id]";
import ApproveSchedulePreviewModal from "../../../components/Schedule/ApproveSchedulePreviewModal";
import Tooltip from "rc-tooltip";
import Pagination from "../../../components/Pagination";
import { BsTrashFill } from "react-icons/bs";
import ModuleSimplePopup, { SimpleIcon } from "../../../components/ModuleLayout/ModuleSimplePopup";
import router from "next/router";
import { PermissionsRoles } from "../../../types/common/enums";
import {
  changeTimelineStatus
} from "../../../pages/Schedule/Manage";

// 3 : Draft, 1 : approved
const indexedColumn: (3 | 4)[] = [3, 4];

export default function Pending() {
  const {data, userPermission} = useCurrentUser();
  const [confirmDelete, setConfirmDelete] = useState<boolean>(false);
  const [confirmDeleteApproval, setConfirmDeleteApproval] = useState<boolean>(false);
  const [deleteTimeline, setDeleteTimeline] = useState<number>();
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
  const [scheduleTimelineItems, setScheduleTimelineItems] =
    useState<ScheduleInfo>();
  const theme = useTheme([
    getTheme(),
    {
      Table:
        "--data-table-library_grid-template-columns: 5em 15em 10em 20em 15em 10em 5em;",
    },
  ]);

  const [activeTabIndex, setActiveTabIndex] = useState<number>(0);
  const [triggerTab, setTriggerTab] = useState<boolean>(false);
  const [remarks, setRemarks] = useState<string>("");

  const handleOptions = (activeTab: number) => {
    if (activeTab == 0) {
      return ScheduleCreateOptions.Drafts;
    } else if (activeTab == 1) {
      return ScheduleCreateOptions.Approved;
    }
  };

  const handleDelete = () => {
    instance
      .delete(`/api/timeline/${deleteTimeline}`)
      .then((res) => {
        // console.log(res);
        router.push("/Schedule/View/Pending");
        setTriggerTab(true);
        setConfirmDelete(false);
      })
      .catch((err) => console.log(err));
  };

  const handleDeleteApproval = () => {
    changeTimelineStatus(6, deleteTimeline as number)
      .then((result) => {
        // Close and clear modal fields
        router.push("/Schedule/View/Pending");
        setTriggerTab(true);
        setConfirmDeleteApproval(false);
      })

  }

  useEffect(() => {
    if (data?.permissions) {
      let url = "";
      let itemURL = "";
      switch (activeTabIndex) {
        case 0:
          url = `/api/timeline_drafts?page=${page}`;
          // itemURL =
          break;
        case 1:
          url = `/api/timeline_pending?page=${page}`;
          break;
        case 2:
          url = `/api/timeline_approved?page=${page}`;
          break;
        /*case 3:
          url = `/api/timeline_completed?page=${page}`;
          break;*/
      }

      instance
        .get(url)
        .then((res: any) => {
          // console.log(res);
          setScheduleTimelines(res.data.rows);
          setTotalPages(res.data.totalPages);
        })
        .catch((err) => {
          console.log(err);
          setScheduleTimelines([]);
        });

      setReady(true);
    }
  }, [activeTabIndex, data, page, triggerTab]);

  const switchColumns = (index: number) => {
    if (isReady) {
      setReady(false);
      setActiveTabIndex(index);
      setPage(1);
    }
  };

  useEffect(() => {
    if (selectedTimeline) {
      getSchedules(selectedTimeline!)
        .then((res) => {
          if (res) {
            setSelectedTimelineItem(res);
            console.log(selectedTimeline);
          }
        })
        .catch(console.log);
    }
  }, [selectedTimeline]);

  return (
    <ModuleMain>
      <ModuleHeader
        title="Pending Schedule Task"
        header={
          activeTabIndex === 0
            ? "Schedule Drafts"
            : activeTabIndex === 1
            ? "Pending Schedules"
            : "Approved Schedules"
        }
      />
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
            {userPermission(PermissionsRoles.CanManageChecklist) && (
              <>
                <li
                  onClick={() => {
                    activeTabIndex !== 1 && switchColumns(1);
                  }}
                  className={
                    "nav-link" + (activeTabIndex === 1 ? " active" : "")
                  }
                >
                  <span style={{ all: "unset" }}>Pending</span>
                </li>
                <li
                  onClick={() => {
                    activeTabIndex !== 2 && switchColumns(2);
                  }}
                  className={
                    "nav-link" + (activeTabIndex === 2 ? " active" : "")
                  }
                >
                  <span style={{ all: "unset" }}>Approved</span>
                </li>
              </>
            )}
          </ul>
        }

        {isReady && scheduleTimelines?.length === 0 && (
          <div>
            {activeTabIndex === 0
              ? "No Schedule Drafts"
              : "No Pending Schedules"}
          </div>
        )}
        {isReady && scheduleTimelines?.length > 0 && (
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
                      <HeaderCell resize>Status</HeaderCell>
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
                          <Cell>
                            <Tooltip
                              overlayInnerStyle={{ fontSize: "0.7rem" }}
                              placement="bottom"
                              trigger={["hover"]}
                              overlay={<span>{item.id}</span>}
                            >
                              {<div>{item.id}</div>}
                            </Tooltip>
                          </Cell>
                          <Cell>
                            <Tooltip
                              overlayInnerStyle={{ fontSize: "0.7rem" }}
                              placement="bottom"
                              trigger={["hover"]}
                              overlay={<span>{item.name}</span>}
                            >
                              {<div>{item.name}</div>}
                            </Tooltip>
                          </Cell>
                          <Cell>
                            <Tooltip
                              overlayInnerStyle={{ fontSize: "0.7rem" }}
                              placement="bottom"
                              trigger={["hover"]}
                              overlay={<span>{item.plantName}</span>}
                            >
                              <span>{item.plantName}</span>
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
                            {activeTabIndex == 0 ? (
                              <Tooltip
                                overlayInnerStyle={{ fontSize: "0.7rem" }}
                                placement="bottom"
                                trigger={["hover"]}
                                overlay={<span>{"Approve"}</span>}
                              >
                                <AiOutlineEdit
                                  color="#C70F2B"
                                  size={22}
                                  title="Edit"
                                  onClick={() => {
                                    setSelectedTimeline(item.id);
                                    setSubmitModal(true);
                                  }}
                                  style={{ cursor: "pointer" }}
                                />
                              </Tooltip>
                            ) : activeTabIndex == 1 ? (
                              <Tooltip
                                overlayInnerStyle={{ fontSize: "0.7rem" }}
                                placement="bottom"
                                trigger={["hover"]}
                                overlay={<span>{"Manage"}</span>}
                              >
                                <BiCommentCheck
                                  color="#C70F2B"
                                  size={22}
                                  title="Approve"
                                  onClick={() => {
                                    setApproveModal(true);
                                    setSelectedTimeline(item.id);
                                    setRemarks(item.remarks);
                                  }}
                                  style={{ cursor: "pointer" }}
                                />
                              </Tooltip>
                            ) : (
                              // {/* </Tooltip> */}
                              <>
                              <AiOutlineFolderView
                                color="#C70F2B"
                                size={22}
                                title="View"
                                onClick={() => {
                                  setApproveModal(true);
                                  setSelectedTimeline(item.id);
                                }}
                                style={{ cursor: "pointer" }}
                              />
                              {activeTabIndex == 2 && item.status !== 'CANCELLED' &&
                                <AiOutlineDelete
                                  color="#C70F2B"
                                  size={22}
                                  title="Delete"
                                  onClick={() => {
                                    userPermission(PermissionsRoles.CanManageSchedule) ? setConfirmDeleteApproval(true) : setConfirmDelete(true);
                                    setDeleteTimeline(item.id);
                                  }}
                                  style={{ cursor: "pointer" }}
                                />}
                              </>
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
          tabIndex={activeTabIndex}
          modalOpenRef={approveModal}
          setModalRef={setApproveModal}
          title="Approve"
          scheduleInfo={selectedTimelineItem!}
          timelineId={selectedTimeline!}
          closeOnBlur
          remarks={remarks}
        />
        {userPermission(PermissionsRoles.CanManageSchedule) ? 
        <ModuleSimplePopup
          setModalOpenState={setConfirmDeleteApproval}
          modalOpenState={confirmDeleteApproval}
          title="Are you sure?"
          text="This action will be submitted for approval"
          icon={SimpleIcon.Exclaim}
          shouldCloseOnOverlayClick={true}
          buttons={[
            <button
              key="deleteConfirm"
              onClick={handleDeleteApproval}
              className="btn btn-primary"
            >
              Submit
            </button>,
            <button
              key="deleteCancel"
              onClick={() => setConfirmDeleteApproval(false)}
              className="btn btn-secondary"
            >
              Cancel
            </button>,
          ]}
        />
        :
        <ModuleSimplePopup
          setModalOpenState={setConfirmDelete}
          modalOpenState={confirmDelete}
          title="Are you sure?"
          text="This action cannot be undone"
          icon={SimpleIcon.Exclaim}
          shouldCloseOnOverlayClick={true}
          buttons={[
            <button
              key="deleteConfirm"
              onClick={handleDelete}
              className="btn btn-primary"
            >
              Delete
            </button>,
            <button
              key="deleteCancel"
              onClick={() => setConfirmDelete(false)}
              className="btn btn-secondary"
            >
              Cancel
            </button>,
          ]}
        />

        }
      </ModuleContent>
    </ModuleMain>
  );
}
