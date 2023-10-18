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

import {
  Body,
  Cell,
  Header,
  HeaderCell,
  HeaderRow,
  OnClick,
  Row,
  Table,
} from "@table-library/react-table-library";
import PickerWithType from "../../components/PickerWithType";
import type { DatePickerProps } from "antd";
import { Select } from "antd";
import { getTheme } from "@table-library/react-table-library/baseline";
import { useTheme } from "@table-library/react-table-library/theme";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  AiOutlineEdit,
  AiOutlineFileDone,
  AiOutlineFileProtect,
  AiOutlineFolderView,
  AiOutlineHistory,
} from "react-icons/ai";
import { BsFileEarmarkPlus } from "react-icons/bs";
import { HiOutlineDownload } from "react-icons/hi";
import {
  ModuleContent,
  ModuleHeader,
  ModuleMain,
  ModuleModal,
} from "../../components";
import LoadingHourglass from "../../components/LoadingHourglass";
import {
  useChecklist,
  useChecklistFilter,
  useCurrentUser,
} from "../../components/SWR";
import TooltipBtn from "../../components/TooltipBtn";
import instance from "../../types/common/axios.config";
import { CMMSChecklist } from "../../types/common/interfaces";
import { getColor } from "../Request";

import Tooltip from "rc-tooltip";
import "rc-tooltip/assets/bootstrap_white.css";

import moment from "moment";
import { useRouter } from "next/router";
import ChecklistHistory from "../../components/Checklist/ChecklistHistory";
import Pagination from "../../components/Pagination";
import SearchBar from "../../components/SearchBar/SearchBar";
import { Checklist_Status } from "../../types/common/enums";
import {
  downloadChecklistPDF,
  downloadMultipleChecklistsPDF,
} from "./View/[id]";

const { Option } = Select;
type PickerType = "date";

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
  checklist_status?: string;
}

export interface ChecklistProps {
  filter?: boolean;
  status?: number | string;
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
    console.log(e);
  }
};

export default function Checklist(props: ChecklistProps) {
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([]);
  const [isReady, setReady] = useState(false);
  const { userPermission } = useCurrentUser();
  const [activeTabIndex, setActiveTabIndex] = useState(
    userPermission("engineer") ? 0 : 1 // Specialists directed to "assigned tab" upon entering
  );
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [history, setHistory] = useState<
    { [key: string]: string }[] | undefined
  >(undefined);
  const searchRef = useRef({ value: "" });
  const [assignedUserHistory, setAssignedUserHistory] = useState<string>("");
  const [IdHeader, setIdHeader] = useState("ID");
  const [blockReset, setBlockReset] = useState<Boolean>(false);
  const [detailsHeader, setDetailsHeader] = useState<string>("Details");
  const [statusHeader, setStatusHeader] = useState<string>("Status");
  const [overdueStatusHeader, setOverdueStatusHeader] =
    useState<string>("Overdue");
  const [dateArrow, setDateArrow] = useState("");
  const [assignedToHeader, setAssignedToHeader] = useState("Assigned To");
  const [signOffHeader, setSignOffHeader] = useState("Signed Off By");
  const [createdByHeader, setCreatedByHeader] = useState("Created By");
  const [sortField, setSortField] = useState("cl.checklist_id");
  const [sortOrder, setSortOrder] = useState("desc");
  const [dataChanged, setDataChanged] = useState(false);
  const [pickerwithtype, setPickerWithType] = useState<{
    date: string;
    datetype: PickerType;
  }>({ date: "all", datetype: "date" });

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
    "checklist_status",
  ];

  const filteredData = useChecklistFilter(
    props,
    page,
    searchRef.current.value,
    fields
  );
  let columnData = useChecklist(
    indexedColumn[activeTabIndex],
    page,
    searchRef.current.value,
    fields,
    sortField,
    sortOrder
  );
  const router = useRouter();

  const { data, error, isValidating, mutate } = props.filter
    ? filteredData
    : columnData;

  // Used for adding the overdue column into the template when the assigned/pending tab is selected
  const tableFormat =
    activeTabIndex === 0 || activeTabIndex === 1 || activeTabIndex === 2
      ? `--data-table-library_grid-template-columns:  8em 5em 25em 7em 15em 10em 8em 8em 8em;
      
  `
      : `--data-table-library_grid-template-columns:  6em 5em 25em 7em 15em 8em 8em 8em;
      
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
  }, [dataChanged, data, isValidating, isReady, page, props?.isReady]);

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
        "checklist_status",
      ];
      const fieldsString = fields.join(",");

      instance
        .get(
          `/api/checklist/${indexedColumn[activeTabIndex]}?page=${page}&expand=${fieldsString}&search=${searchRef.current.value}`
        )
        .then((response) => {
          if (!blockReset) {
            setChecklistItems(
              response.data.rows.map((row: CMMSChecklist) => {
                return {
                  id: row.checklist_id,
                  ...row,
                };
              })
            );
          }

          if (dataChanged && data) {
            setChecklistItems(
              data.rows.map((row: CMMSChecklist) => {
                return {
                  id: row.checklist_id,
                  ...row,
                };
              })
            );
          }
          setTotalPages(response.data.total);
          setReady(true);
        })
        .catch((e) => {
          setChecklistItems([]);
        });
    }
  }, [data, dataChanged, activeTabIndex, page, isReady]);

  const updateTable = (foo: Function) => {
    setReady(false);
    foo().then((res: any) => {
      setReady(true);
    });
  };

  async function sortId() {
    setBlockReset(true);
    setSortField("cl.checklist_id");

    if (IdHeader === "ID" || IdHeader === "ID ▲") {
      setIdHeader("ID ▼");
      setSortOrder("desc");
    } else if (IdHeader === "ID ▼") {
      setIdHeader("ID ▲");
      setSortOrder("asc");
    }
    setDataChanged(true);
  }

  async function sortDetails() {
    setBlockReset(true);
    setSortField("cl.description");
    if (detailsHeader === "Details" || detailsHeader === "Details ▲") {
      setDetailsHeader("Details ▼");
      setSortOrder("desc");
    } else if (detailsHeader === "Details ▼") {
      setDetailsHeader("Details ▲");
      setSortOrder("asc");
    }
    setDataChanged(true);
  }

  async function sortStatus() {
    setBlockReset(true);
    setSortField("st.status");
    if (statusHeader === "Status" || statusHeader === "Status ▲") {
      setStatusHeader("Status ▼");
      setSortOrder("desc");
    } else if (statusHeader === "Status ▼") {
      setStatusHeader("Status ▲");
      setSortOrder("asc");
    }
    setDataChanged(true);
  }

  async function sortOverdueStatus() {
    setBlockReset(true);
    setSortField("cl.overdue_status");
    if (
      overdueStatusHeader === "Overdue" ||
      overdueStatusHeader === "Overdue ▲"
    ) {
      setOverdueStatusHeader("Overdue ▼");
      setSortOrder("desc");
    } else if (overdueStatusHeader === "Overdue ▼") {
      setOverdueStatusHeader("Overdue ▲");
      setSortOrder("asc");
    }
    setDataChanged(true);
  }
  async function sortDate(activeTabIndex: any) {
    setBlockReset(true);
    let dateType =
      activeTabIndex === 2
        ? "Completed Date"
        : activeTabIndex === 3
        ? "Approved Date"
        : "Created On";

    if (dateType == "Created On") {
      setSortField("cl.created_date");
    } else if (dateType == "Completed Date") {
      setSortField("cs.date");
    } else if (dateType == "Approved Date") {
      setSortField("cs.date");
    }

    if (dateArrow == "" || dateArrow == " ▲") {
      setDateArrow(" ▼");
      setSortOrder("desc");
    } else if (dateArrow == " ▼") {
      setDateArrow(" ▲");
      setSortOrder("asc");
    }
    setDataChanged(true);
  }

  async function sortAssignedTo() {
    setBlockReset(true);
    setSortField("assigneduser");
    if (
      assignedToHeader === "Assigned To" ||
      assignedToHeader === "Assigned To ▲"
    ) {
      setAssignedToHeader("Assigned To ▼");
      setSortOrder("desc");
    } else if (assignedToHeader === "Assigned To ▼") {
      setAssignedToHeader("Assigned To ▲");
      setSortOrder("asc");
    }
    setDataChanged(true);
  }

  async function sortSignOffBy() {
    setBlockReset(true);
    setSortField("signoffuser");
    if (
      signOffHeader === "Signed Off By" ||
      signOffHeader === "Signed Off By ▲"
    ) {
      setSignOffHeader("Signed Off By ▼");
      setSortOrder("desc");
    } else if (signOffHeader === "Signed Off By ▼") {
      setSignOffHeader("Signed Off By ▲");
      setSortOrder("asc");
    }
    setDataChanged(true);
  }

  async function sortCreatedBy() {
    setBlockReset(true);
    setSortField("createdbyuser");
    if (
      createdByHeader === "Created By" ||
      createdByHeader === "Created By ▲"
    ) {
      setCreatedByHeader("Created By ▼");
      setSortOrder("desc");
    } else if (createdByHeader === "Created By ▼") {
      setCreatedByHeader("Created By ▲");
      setSortOrder("asc");
    }
    setDataChanged(true);
  }

  const downloadMultipleChecklistPDF = () => {
    let checklistIdArray = [];

    if (data) {
      for (const row in checklistItems) {
        checklistIdArray.push(data.rows[row]["checklist_id"]);
      }
      downloadMultipleChecklistsPDF(checklistIdArray);
    }
  };

  function getEndOfMonth(date: Date) {
    // Create a new Date object based on the input date
    const endOfMonth = new Date(date);

    // Set the day of the month to the last day of the month
    endOfMonth.setUTCDate(1); // Move to the beginning of the month
    endOfMonth.setUTCMonth(endOfMonth.getUTCMonth() + 1); // Move to the next month
    endOfMonth.setUTCDate(0); // Set to the last day of the previous month

    // Set the time to the end of the day
    endOfMonth.setUTCHours(23, 59, 59, 999);

    return endOfMonth;
  }

  function parseWeekString(weekString: String) {
    const numbersDashString = weekString.slice(0, -2);
    const numbersArray = numbersDashString.split("-");
    const year = parseInt(numbersArray[0], 10);
    const week = parseInt(numbersArray[1], 10);
    const januaryFirst = new Date(year, 0, 1);
    januaryFirst.setHours(0, 0, 0, 0);
    const daysToAdd = (week - 1) * 7 + 1;
    januaryFirst.setDate(januaryFirst.getDate() + daysToAdd);
    return januaryFirst;
  }

  function getEndOfWeek(date: Date) {
    const endOfWeek = new Date(date);

    // Calculate the number of days until the end of the week (Sunday)
    const daysUntilSunday = 7 - endOfWeek.getUTCDay();

    // Add the number of days to the current date
    endOfWeek.setUTCDate(endOfWeek.getUTCDate() + daysUntilSunday);

    // Set the time to the end of the day
    endOfWeek.setUTCHours(23, 59, 59, 999);

    return endOfWeek;
  }

  function getFirstDayOfQuarter(dateString: String) {
    const year = parseInt(dateString.slice(0, 4), 10);
    const quarter = dateString.slice(-2);
    let firstDayOfQuarter;
    let lastDayOfQuarter;
    switch (quarter) {
      case "Q1":
        firstDayOfQuarter = new Date(year, 0, 1);
        lastDayOfQuarter = new Date(year, 2, 31);
        break;
      case "Q2":
        firstDayOfQuarter = new Date(year, 3, 1);
        lastDayOfQuarter = new Date(year, 5, 31);
        break;
      case "Q3":
        firstDayOfQuarter = new Date(year, 6, 1);
        lastDayOfQuarter = new Date(year, 8, 31);
        break;
      case "Q4":
        firstDayOfQuarter = new Date(year, 9, 1);
        lastDayOfQuarter = new Date(year, 11, 31);
        break;
    }
    return [firstDayOfQuarter, lastDayOfQuarter];
  }

  const handleDateChange: DatePickerProps["onChange"] = (date, dateString) => {
    //if no input display rows as per normal
    if (dateString == null) {
      return;
    }

    let dateStart;
    let dateEnd;
    let datetype = pickerwithtype.datetype;

    if (datetype == "date") {
      dateStart = new Date(dateString);
      const endOfDay = new Date(dateStart);
      endOfDay.setHours(23, 59, 59, 999);
      dateEnd = endOfDay;
    } else if (datetype == "week") {
      const dateObjectWeek = new Date(parseWeekString(dateString));
      const dateObjectWeekEnd = getEndOfWeek(dateObjectWeek);
      dateStart = dateObjectWeek;
      dateEnd = dateObjectWeekEnd;
    } else if (datetype == "month") {
      const dateObjectMonth = new Date(dateString);
      const dateObjectMonthEnd = getEndOfMonth(dateObjectMonth);
      dateStart = dateObjectMonth;
      dateEnd = dateObjectMonthEnd;
    } else if (datetype == "quarter") {
      [dateStart, dateEnd] = getFirstDayOfQuarter(dateString);
    } else if (datetype == "year") {
      const year = parseInt(dateString.slice(0, 4), 10);
      dateStart = new Date(year, 0, 1);
      dateEnd = new Date(year, 11, 31);
    }

    let filteredDataRows: CMMSChecklist[] = [];
    if (data && dateStart && dateEnd) {
      for (const row of data.rows) {
        const rowCreatedDate = new Date(row.created_date);

        if (rowCreatedDate >= dateStart && rowCreatedDate <= dateEnd) {
          filteredDataRows.push(row);
        }
      }

      setChecklistItems(
        filteredDataRows.map((row: CMMSChecklist) => {
          return {
            id: row.checklist_id,
            ...row,
          };
        })
      );
    }

    setPickerWithType({
      date: dateString ? moment(date?.toDate()).format("YYYY-MM-DD") : "all",
      datetype: pickerwithtype.datetype,
    });
  };

  const handleDateTypeChange = (value: PickerType) => {
    let { date } = pickerwithtype;
    setPickerWithType({ date: date || "all", datetype: value });
  };

  return (
    <ModuleMain>
      <div
        style={{
          display: "flex",
          alignItems: "stretch",
          flexDirection: "column",
        }}
      >
        <ModuleHeader title="Checklist" header="Checklist">
          <SearchBar
            ref={searchRef}
            onSubmit={() => {
              setReady(false);
              setChecklistItems([]);
            }}
          />
          {userPermission("canCreateChecklist") && (
            <Link href="/Checklist/Form?action=New">
              <TooltipBtn text="New Checklist">
                <BsFileEarmarkPlus size={20} />
              </TooltipBtn>
            </Link>
          )}
          {/* <TooltipBtn
          onClick={() => downloadCSV("checklist", activeTabIndex)}
          text="Export CSV"
        > */}
          <TooltipBtn
            onClick={() => downloadMultipleChecklistPDF()}
            text="Download PDF"
          >
            <HiOutlineDownload size={20} />
          </TooltipBtn>
        </ModuleHeader>
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <Select
            value={pickerwithtype.datetype}
            onChange={handleDateTypeChange}
          >
            <Option value="date">Date</Option>
            <Option value="week">Week</Option>
            <Option value="month">Month</Option>
            <Option value="quarter">Quarter</Option>
            <Option value="year">Year</Option>
          </Select>
          <div style={{ paddingLeft: "10px" }}>
            <PickerWithType
              type={pickerwithtype.datetype}
              onChange={handleDateChange}
            />
          </div>
        </div>
      </div>
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
                      <HeaderCell resize>Action</HeaderCell>
                      <HeaderCell
                        resize
                        onClick={() => updateTable(sortId)}
                        style={{ cursor: "pointer" }}
                      >
                        {IdHeader}
                      </HeaderCell>
                      <HeaderCell
                        resize
                        onClick={() => updateTable(sortDetails)}
                        style={{ cursor: "pointer" }}
                      >
                        {detailsHeader}
                      </HeaderCell>
                      <HeaderCell
                        resize
                        onClick={() => updateTable(sortStatus)}
                        style={{ cursor: "pointer" }}
                      >
                        {statusHeader}
                      </HeaderCell>
                      <HeaderCell
                        resize
                        onClick={() =>
                          updateTable(() => sortDate(activeTabIndex))
                        }
                        style={{ cursor: "pointer" }}
                      >
                        {activeTabIndex === 2
                          ? "Completed Date"
                          : activeTabIndex === 3
                          ? "Approved Date"
                          : "Created On"}
                        {dateArrow}
                      </HeaderCell>
                      {/*Only show the Overdue column for the pending and assigned tabs*/}
                      {(activeTabIndex === 0 ||
                        activeTabIndex === 1 ||
                        activeTabIndex === 2) && (
                        <HeaderCell
                          resize
                          onClick={() => updateTable(sortOverdueStatus)}
                          style={{ cursor: "pointer" }}
                        >
                          {overdueStatusHeader}
                        </HeaderCell>
                      )}
                      <HeaderCell
                        resize
                        onClick={() => updateTable(sortAssignedTo)}
                        style={{ cursor: "pointer" }}
                      >
                        {assignedToHeader}
                      </HeaderCell>
                      <HeaderCell
                        resize
                        onClick={() => updateTable(sortSignOffBy)}
                        style={{ cursor: "pointer" }}
                      >
                        {signOffHeader}
                      </HeaderCell>
                      <HeaderCell
                        resize
                        onClick={() => updateTable(sortCreatedBy)}
                        style={{ cursor: "pointer" }}
                      >
                        {createdByHeader}
                      </HeaderCell>
                    </HeaderRow>
                  </Header>

                  <Body>
                    {tableList.map((item) => {
                      return (
                        <Row key={item.id} item={item}>
                          <Cell>
                            { userPermission('canManageChecklist') &&
                            [ 
                              Checklist_Status.Work_Done, 
                              Checklist_Status.Reassignment_Request 
                            ].includes(item.status_id) ? (
                              <Link href={`/Checklist/Manage/${item.id}`}>
                                <AiOutlineFileProtect
                                  size={22}
                                  title={"Manage"}
                                />
                              </Link>
                            ) : userPermission('canCompleteChecklist') && 
                            [
                              Checklist_Status.Assigned, 
                              Checklist_Status.Reassigned, 
                              Checklist_Status.Rejected, 
                              Checklist_Status.Rejected_Cancellation
                            ].includes(item.status_id) ? (
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
                            ) : userPermission('canAssignChecklist') && item.status_id === Checklist_Status.Pending 
                               ? (
                              <Link
                                href={`/Checklist/Form/?action=Edit&id=${item.id}`}
                              >
                                <AiOutlineEdit size={22} title={"Assign"} />
                              </Link>
                            ) : userPermission('canManageChecklist') && item.status_id ===
                                Checklist_Status.Pending_Cancellation  ? (
                              <Link
                                href={`/Checklist/Cancellation/?id=${item.id}`}
                              >
                                <AiOutlineFileProtect
                                  size={22}
                                  title={"Manage"}
                                />
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
                                        const statusArr =
                                          item?.checklist_status?.split(",");
                                        const status = statusArr?.filter(
                                          (element) =>
                                            element.includes("WORK DONE")
                                        )[0];
                                        const statusDate =
                                          status &&
                                          status.substring(
                                            -status?.indexOf(":")
                                          );
                                        dateToDisplay = statusDate;
                                        /*dateToDisplay = item.activity_log
                                          .reverse()
                                          .find(
                                            (activity) =>
                                              activity["activity_type"] ===
                                              "WORK DONE"
                                          )?.date;*/
                                      } else if (activeTabIndex === 3) {
                                        const statusArr =
                                          item?.checklist_status?.split(",");
                                        const status = statusArr?.filter(
                                          (element) =>
                                            element.includes("APPROVED")
                                        )[0];
                                        const statusDate =
                                          status &&
                                          status.substring(
                                            -status?.indexOf(":")
                                          );
                                        /*dateToDisplay = statusDate;
                                        dateToDisplay = item.activity_log
                                          .reverse()
                                          .find(
                                            (activity) =>
                                              activity["activity_type"] ===
                                              "APPROVED"
                                          )?.date;*/
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
                                        const statusArr = item?.checklist_status?.split(",");
                                        const status = statusArr?.filter(element => element.includes('WORK DONE'))[0];
                                        const statusDate = status && status.slice(status?.indexOf(":")+2);
                                        dateToDisplay = statusDate;
                                        /*dateToDisplay = item.activity_log
                                          .reverse()
                                          .find(
                                            (activity) =>
                                              activity["activity_type"] ===
                                              "WORK DONE"
                                          )?.date;*/
                                      } else if (activeTabIndex === 3) {
                                        const statusArr = item?.checklist_status?.split(",");
                                        const status = statusArr?.filter(element => element.includes('CANCELLED') || element.includes('APPROVED'))[0];
                                        const statusDate = status && status.slice(status?.indexOf(":")+2);
                                        dateToDisplay = statusDate;
                                        /*dateToDisplay = statusDate;
                                        dateToDisplay = item.activity_log
                                          .reverse()
                                          .find(
                                            (activity) =>
                                              activity["activity_type"] ===
                                              "APPROVED"
                                          )?.date;*/
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
                            {userPermission("canManageChecklist") &&
                            [
                              Checklist_Status.Work_Done,
                              Checklist_Status.Reassignment_Request,
                            ].includes(item.status_id) ? (
                              <Link href={`/Checklist/Manage/${item.id}`}>
                                <AiOutlineFileProtect
                                  size={22}
                                  title={"Manage"}
                                />
                              </Link>
                            ) : userPermission("canCompleteChecklist") &&
                              [
                                Checklist_Status.Assigned,
                                Checklist_Status.Reassigned,
                                Checklist_Status.Rejected,
                                Checklist_Status.Rejected_Cancellation,
                              ].includes(item.status_id) ? (
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
                            ) : userPermission("canAssignChecklist") &&
                              item.status_id === Checklist_Status.Pending ? (
                              <Link
                                href={`/Checklist/Form/?action=Edit&id=${item.id}`}
                              >
                                <AiOutlineEdit size={22} title={"Assign"} />
                              </Link>
                            ) : userPermission("canManageChecklist") &&
                              item.status_id ===
                                Checklist_Status.Pending_Cancellation ? (
                              <Link
                                href={`/Checklist/Cancellation/?id=${item.id}`}
                              >
                                <AiOutlineFileProtect
                                  size={22}
                                  title={"Manage"}
                                />
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
