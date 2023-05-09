import React, { useEffect, useState } from "react";
import PickerWithType from "../../components/PickerWithType";
import { ModuleContent, ModuleHeader, ModuleMain } from "../../components";
import { Select } from 'antd';
import moment from "moment";
import { useTheme } from "@table-library/react-table-library/theme";
import { getTheme } from "@table-library/react-table-library/baseline";
import type { DatePickerProps} from 'antd';
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
import { downloadCSV } from "../Request";
import { HiOutlineDownload } from "react-icons/hi";
import TooltipBtn from "../../components/TooltipBtn";
import instance from "../../axios.config";
type PickerType = 'date';
const { Option } = Select;

export default function AccountLog() {
  type PickerType = 'day' |'month' | 'year';
  const [activityItems, setActivityItems] = useState<CMMSActivitylog[]>([]);
  const [isReady, setReady] = useState(false);
  const [datee, setDate]= useState<string>("Date & Time");
  const [type, setType] = useState<string>("Type");
  const [userName, setUserName] = useState<string>("User Name");
  const [pickerwithtype, setPickerWithType] = useState<{
    date: string | null,
    datetype: PickerType
}>({ date: null, datetype: 'day' });

const handleDateChange: DatePickerProps['onChange'] = (date, dateString) => {
    setPickerWithType((prevState)=>{return{ date: dateString ? moment(date?.toDate()).format("YYYY-MM-DD") : moment().format('YYYY-MM-DD'), datetype: prevState.datetype || 'month' }});
  }

const handleDateTypeChange = (value: PickerType) => {
    let { date } = pickerwithtype;
    setPickerWithType({ date: date || moment().format('YYYY-MM-DD'), datetype: value || 'month' });
}
const { date, datetype } = pickerwithtype;


  async function sortDate() {
    if (datee == "Date & Time" || datee == "Date & Time ▲") {
      setDate("Date & Time ▼");
      setActivityItems((prevState)=>{
        const newState = [...prevState]
        newState.sort((a, b) => new Date(b.event_time) > new Date(a.event_time) ? 1 : -1)
        return newState
      });
      console.log(activityItems)
    } else if (datee == "Date & Time ▼") {
      setDate("Date & Time ▲");
      setActivityItems((prevState)=>{
        const newState = [...prevState]
        newState.sort((a, b) => new Date(a.event_time) > new Date(b.event_time) ? 1 : -1)
        return newState
      });
      console.log(activityItems)
    } 
  }
  async function sortType() {
    if (type == "Type" || type == "Type ▲") {
      setType("Type ▼");
      setActivityItems((prevState)=>{
        const newState = [...prevState]
        newState.sort((a, b) => (a.type > b.type) ? 1 : -1)
        return newState
      });
    }
    else if (type == "Type ▼") {
      setType("Type ▲");
      setActivityItems((prevState)=>{
        const newState = [...prevState]
        newState.sort((a, b) => (a.type < b.type) ? 1 : -1)
        return newState
      });
    }
  }
  async function sortUserName() {
    if (userName == "User Name" || userName == "User Name ▲") {
      setUserName("User Name ▼");
      setActivityItems((prevState)=>{
        const newState = [...prevState]
        newState.sort((a, b) => (a.user_name > b.user_name) ? 1 : -1)
        return newState
      });
    }
    else if (userName == "User Name ▼") {
      setUserName("User Name ▲");
      setActivityItems((prevState)=>{
        const newState = [...prevState]
        newState.sort((a, b) => (a.user_name < b.user_name) ? 1 : -1)
        return newState
      });
    }
  }


  const updateTable = (foo: Function) => {
    setReady(false);
    foo().then((res: any) => setReady(true));
  };

  let { data, error, isValidating, mutate } = useAccountlog("/api/activity/account_log");
  const theme = useTheme([
    getTheme(),
    {
      Table:
        "--data-table-library_grid-template-columns:  5em calc(90% - 40em) 7em 8em 10em 10em 10%;",
    },
  ]);

  useEffect(() => {
    if (!isReady && data && !isValidating) {
      setActivityItems(data)
      setReady(true);
    }
  }, [data, isValidating]);
  useEffect(() => {
    if (date){
    setReady(false);
    console.log(`/api/activity/account_log/` + datetype + `/${date}`);
    instance(`/api/activity/account_log/` + datetype + `/${date}`).then((res: any) => {
      console.log(res.data);
      setActivityItems(res.data);
      setReady(true);
    });}

}, [date]);

  return (
    <ModuleMain>
      <ModuleHeader title="Activity Log" header="Activity Log">
      <Select value={pickerwithtype.datetype} onChange={handleDateTypeChange}>
                    <Option value="day">Date</Option>
                    <Option value="month">Month</Option>
                    <Option value="year">Year</Option>
                </Select>
                <PickerWithType type={pickerwithtype.datetype} onChange={handleDateChange}/>
        <TooltipBtn text="Export CSV" onClick={() => downloadCSV("activity")}>
          <HiOutlineDownload size={20} />
        </TooltipBtn>
      </ModuleHeader>
      <ModuleContent>
        {isReady && <Table data={{ nodes: activityItems }} theme={theme}>
          {(tableList: CMMSActivitylog[]) => (
            <>
              <Header>
                <HeaderRow>
                  <HeaderCell resize
                  onClick={() =>updateTable(sortUserName)}
                  style={{cursor: "pointer"}}
                  >
                    {userName}</HeaderCell>
                  <HeaderCell resize
                  onClick={() =>updateTable(sortType)}
                  style={{cursor: "pointer"}}
                  >{type}</HeaderCell>
                  <HeaderCell resize>Activity</HeaderCell>
                  <HeaderCell resize
                  onClick={() =>updateTable(sortDate)}
                  style={{cursor: "pointer"}}
                  >{datee}</HeaderCell>
                </HeaderRow>
              </Header>

              <Body>
                {tableList.map((item) => {
                  return (
                    <Row key={item.id} item={item}>
                      <Cell>{item.user_name}</Cell>
                      <Cell>{item.type}</Cell>
                      <Cell>{item.description}</Cell>
                      <Cell>
                        {new Date(
                          item.event_time
                        ).toLocaleString()}
                      </Cell>
                    </Row>
                  );
                })}
              </Body>
            </>
          )}
        </Table>}
      </ModuleContent>
    </ModuleMain>
  );
}
