  import React, { useEffect, useState } from "react";
  import PickerWithType from "../../components/PickerWithType";
  import Tooltip from 'rc-tooltip';
  import 'rc-tooltip/assets/bootstrap_white.css';
  import { ModuleContent, ModuleHeader, ModuleMain } from "../../components";
  import { Select } from "antd";
  import moment from "moment";
  import { useTheme } from "@table-library/react-table-library/theme";
  import { getTheme } from "@table-library/react-table-library/baseline";
  import type { DatePickerProps } from "antd";
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
  import { useAccountlog } from "../../components/SWR";
  import { CMMSActivitylog } from "../../types/common/interfaces";
  import { HiOutlineDownload } from "react-icons/hi";
  import TooltipBtn from "../../components/TooltipBtn";
  import instance from "../../axios.config";
  import Pagination from "../../components/Pagination";
  import LoadingHourglass from "../../components/LoadingHourglass";
  type PickerType = "date";
  const { Option } = Select;

  export default function AccountLog() {
    type PickerType = "day" | "month" | "year";
    const [activityItems, setActivityItems] = useState<CMMSActivitylog[]>([]);
    const [isReady, setReady] = useState(false);
    const [datee, setDate] = useState<string>("Date & Time");
    const [type, setType] = useState<string>("Type");
    const [userName, setUserName] = useState<string>("User Name");
    const [pickerwithtype, setPickerWithType] = useState<{
      date: string | null;
      datetype: PickerType;
    }>({ date: null, datetype: "day" });
    const [justInitialised, setJustInitialised] = useState<boolean>(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const handleDateChange: DatePickerProps["onChange"] = (date, dateString) => {
      setPickerWithType((prevState) => {
        return {
          date: dateString
            ? moment(date?.toDate()).format("YYYY-MM-DD")
            : moment().startOf("month").format("YYYY-MM-DD"),
          datetype: dateString ? prevState.datetype || "month" : "month",
        };
      });
    };

    const handleDateTypeChange = (value: PickerType) => {
      let { date } = pickerwithtype;
      setPickerWithType({
        date: date || moment().format("YYYY-MM-DD"),
        datetype: value || "month",
      });
    };
    const { date, datetype } = pickerwithtype;
    // console.log("date", date);

    async function sortDate() {
      if (datee == "Date & Time" || datee == "Date & Time ▲") {
        setDate("Date & Time ▼");
        setActivityItems((prevState) => {
          const newState = [...prevState];
          newState.sort((a, b) =>
            new Date(b.event_time) > new Date(a.event_time) ? 1 : -1
          );
          return newState;
        });
      } else if (datee == "Date & Time ▼") {
        setDate("Date & Time ▲");
        setActivityItems((prevState) => {
          const newState = [...prevState];
          newState.sort((a, b) =>
            new Date(a.event_time) > new Date(b.event_time) ? 1 : -1
          );
          return newState;
        });
      }
    }
    async function sortType() {
      if (type == "Type" || type == "Type ▲") {
        setType("Type ▼");
        setActivityItems((prevState) => {
          const newState = [...prevState];
          newState.sort((a, b) => (a.type > b.type ? 1 : -1));
          return newState;
        });
      } else if (type == "Type ▼") {
        setType("Type ▲");
        setActivityItems((prevState) => {
          const newState = [...prevState];
          newState.sort((a, b) => (a.type < b.type ? 1 : -1));
          return newState;
        });
      }
    }
    async function sortUserName() {
      if (userName == "User Name" || userName == "User Name ▲") {
        setUserName("User Name ▼");
        setActivityItems((prevState) => {
          const newState = [...prevState];
          newState.sort((a, b) => (a.user_name > b.user_name ? 1 : -1));
          return newState;
        });
      } else if (userName == "User Name ▼") {
        setUserName("User Name ▲");
        setActivityItems((prevState) => {
          const newState = [...prevState];
          newState.sort((a, b) => (a.user_name < b.user_name ? 1 : -1));
          return newState;
        });
      }
    }

    async function downloadCSV() {
      try {
        const response = await instance.post("/api/activity/csv", activityItems);
        const blob = new Blob([response.data]);
        const url = window.URL.createObjectURL(blob);
        const temp_link = document.createElement("a");
        if (date) {
          temp_link.download = `${date}_${datetype}_activity_log.csv`;
        } else {
          temp_link.download = `activity_log.csv`;
        }
        temp_link.href = url;
        temp_link.click();
        temp_link.remove();
      } catch (e) {
        console.log(e);
      }
    }

    const updateTable = (foo: Function) => {
      setReady(false);
      foo().then((res: any) => setReady(true));
    };

    let { data, error, isValidating, mutate } = useAccountlog(
      "/api/activity/account_log"
    );
    // console.log(data);
    // console.log(error);
    const theme = useTheme([
      getTheme(),
      {
        Table:
          "--data-table-library_grid-template-columns:  5em calc(90% - 40em) 7em 8em 10em 10em 10%;",
      },
    ]);

    useEffect(() => {
      if (!isReady && data && !isValidating) {
        setTotalPages(data.totalPages);
        setActivityItems(data.logs);
        setReady(true);
      }
    }, [data, isValidating]);

    // useEffect(() => {
    //   console.log("test", justInitialised);
    //   if (justInitialised && activityItems) {
    //     console.log("Initial")
    //     // sortDate();
    //     // setJustInitialised(false);
    //   }
    // }, [])

    useEffect(() => {
      if (date) {
        setReady(false);
        // console.log(data);
        // console.log(`/api/activity/account_log/` + datetype + `/${date}`);
        instance(
          `/api/activity/account_log/` + datetype + `/${date}?page=${page}`
        ).then((res: any) => {
          // console.log(res.data);
          setActivityItems(res.data.logs);
          setTotalPages(res.data.totalPages);
          setReady(true);
        });
      } else {
        setReady(false);
        // console.log(`/api/activity/account_log`);
        instance(`/api/activity/account_log?page=${page}`).then((res: any) => {
          // console.log(res.data);
          setActivityItems(res.data.logs);
          setTotalPages(res.data.totalPages);
          setReady(true);
        });
      }
    }, [date, page]);

    useEffect(() => {
      setPage(1);
    }, [date]);

    return (
      <ModuleMain>
        <ModuleHeader title="Activity Log" header="Activity Log">
          <Select value={pickerwithtype.datetype} onChange={handleDateTypeChange}>
            <Option value="day">Date</Option>
            <Option value="month">Month</Option>
            <Option value="year">Year</Option>
          </Select>
          <PickerWithType
            type={pickerwithtype.datetype}
            onChange={handleDateChange}
          />
          <TooltipBtn text="Export CSV" onClick={() => downloadCSV()}>
            <HiOutlineDownload size={20} />
          </TooltipBtn>
        </ModuleHeader>
        <ModuleContent>
          {isReady && (
            <>
              <Table data={{ nodes: activityItems }} theme={theme}>
                {(tableList: CMMSActivitylog[]) => (
                  <>
                    <Header>
                      <HeaderRow>
                        <HeaderCell
                          resize
                          onClick={() => updateTable(sortUserName)}
                          style={{ cursor: "pointer" }}
                        >
                          {userName}
                        </HeaderCell>
                        <HeaderCell
                          resize
                          onClick={() => updateTable(sortType)}
                          style={{ cursor: "pointer" }}
                        >
                          {type}
                        </HeaderCell>
                        <HeaderCell resize>Activity</HeaderCell>
                        <HeaderCell
                          resize
                          onClick={() => updateTable(sortDate)}
                          style={{ cursor: "pointer" }}
                        >
                          {datee}
                        </HeaderCell>
                      </HeaderRow>
                    </Header>

                    <Body>
                      {tableList.map((item, index) => {
                        // console.log(item.id);
                        return (
                          <Row key={index} item={item}>
                            <Cell>{item.user_name}</Cell>
                            <Cell>{item.type}</Cell>         
                            <Cell>
                            {/*Using the rc-tooltip library https://www.npmjs.com/package/rc-tooltip*/}
                            <Tooltip 
                            overlayInnerStyle={{
                              "fontSize": "0.7rem"}} 
                            placement="bottom" 
                            trigger={["hover"]} 
                            overlay={<span >{item.description}</span>}>
                              <div>{item.description}</div>
                            </Tooltip>
                              </Cell>
                            <Cell>
                              {item.event_time
                                ? moment(new Date(item.event_time)).format(
                                    "MMMM Do YYYY, h:mm:ss a"
                                  )
                                : " "}
                            </Cell>
                          </Row>
                        );
                      })}
                    </Body>
                  </>
                )}
              </Table>
              <Pagination
                page={page}
                setPage={setPage}
                totalPages={totalPages}
                setReady={setReady}
              />
            </>
          )}
          {!isReady && <LoadingHourglass />}
        </ModuleContent>
      </ModuleMain>
    );
  }
