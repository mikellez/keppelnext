import React, { useState, useEffect } from "react";
import {
  ModuleContent,
  ModuleFooter,
  ModuleHeader,
  ModuleMain,
} from "../../components";
import styles from "../../styles/Dashboard.module.scss";
import DashboardBox from "../../components/Dashboard/DashboardBox";
import PlantSelect from "../../components/PlantSelect";
import { CMMSDashboardData } from "../../types/common/interfaces";
import PChart from "../../components/Dashboard/PChart";
import { fetchData } from ".";
import { ThreeDots } from "react-loading-icons";
import LoadingHourglass from "../../components/LoadingHourglass";
import type { DatePickerProps, TimePickerProps } from 'antd';
import { Select } from 'antd';
import PickerWithType from "../../components/PickerWithType";
import moment from "moment";

const { Option } = Select;

type PickerType = 'date';

export default function ManagerDashboad() {
  const [isReady, setIsReady] = useState<boolean>(false);
  const [plant, setPlant] = useState<number>(0);
  const [field, setField] = useState<string>("status");
  const [pickerwithtype, setPickerWithType] = useState<{
    date: string,
    datetype: PickerType
  }>({ date: 'all', datetype: 'date' });
  const [request, setRequest] = useState<{
    pendingRequest: CMMSDashboardData | null;
    closedRequest: CMMSDashboardData | null;
  }>({ pendingRequest: null, closedRequest: null });
  const [checklistData, setChecklistData] = useState<CMMSDashboardData[]>();
  const [requestData, setRequestData] = useState<CMMSDashboardData[]>();

  const handleDateChange: DatePickerProps['onChange'] = (date, dateString) => {
    setPickerWithType({ date: dateString ? moment(date?.toDate()).format("YYYY-MM-DD") : 'all', datetype: pickerwithtype.datetype });
  }

  const handleDateTypeChange = (value: PickerType) => {
    let { date } = pickerwithtype;
    setPickerWithType({ date: date || 'all', datetype: value });
  }

  useEffect(() => {
    const { datetype, date } = pickerwithtype;

    fetchData("request", plant, field, datetype, date).then((result) => {
      if (result) setRequestData(result);
    });

    fetchData("request", plant, "status", datetype, date).then((result) => {
      setRequest({
        pendingRequest: result?.filter((data) => data.id === 1)[0],
        closedRequest: result?.filter((data) => data.id === 4)[0],
      });
      setTimeout(() => {
        setIsReady(true);
      }, 500);
    });
  }, [plant, field, pickerwithtype]);

  useEffect(() => {
    const { datetype, date } = pickerwithtype;

    fetchData("checklist", plant, "status", datetype, date).then((result) => {
      if (result) setChecklistData(result);
    });
  }, [plant, pickerwithtype]);

  const pendingChecklist = checklistData?.filter((data) => data.id === 1)[0];
  const completedChecklist = checklistData?.filter((data) => data.id === 4)[0];
  const totalRequest = requestData?.reduce((accumulator, currentValue) => {
    return accumulator + currentValue.value;
  }, 0);
  const totalChecklist = checklistData?.reduce((accumulator, currentValue) => {
    return accumulator + currentValue.value;
  }, 0);

  if (!isReady) {
    return (
      <div style={{ position: "absolute", top:"calc((100% - 8rem) / 2)", left:"50%", transform:"translate(-50%,-50%)"}}>
        <LoadingHourglass />
      </div>
    );
  }

  return (
    <ModuleMain>
      <ModuleHeader header="Dashboard">
          <Select value={pickerwithtype.datetype} onChange={handleDateTypeChange}>
            <Option value="date">Date</Option>
            <Option value="week">Week</Option>
            <Option value="month">Month</Option>
            <Option value="quarter">Quarter</Option>
            <Option value="year">Year</Option>
          </Select>
          <PickerWithType type={pickerwithtype.datetype} onChange={handleDateChange}/>

        <PlantSelect
          onChange={(e) => setPlant(parseInt(e.target.value))}
          allPlants
        />
      </ModuleHeader>
      <ModuleContent>
        <div className={styles.dashboardMain}>
          <DashboardBox title="Pending Requests" style={{ gridArea: "a" }}>
            <p className={styles.dashboardPendingdNumber}>
              {request.pendingRequest ? request.pendingRequest.value : 0}
            </p>
          </DashboardBox>
          <DashboardBox title="Closed Requests" style={{ gridArea: "b" }}>
            <p className={styles.dashboardCompletedNumber}>
              {request.closedRequest ? request.closedRequest.value : 0}
            </p>
          </DashboardBox>
          <DashboardBox title="Pending Checklists" style={{ gridArea: "c" }}>
            <p className={styles.dashboardPendingdNumber}>
              {pendingChecklist ? pendingChecklist.value : 0}
            </p>
          </DashboardBox>
          <DashboardBox title="Completed Checklists" style={{ gridArea: "d" }}>
            <p className={styles.dashboardCompletedNumber}>
              {completedChecklist ? completedChecklist.value : 0}
            </p>
          </DashboardBox>
          <DashboardBox
            title={"Total Requests: " + totalRequest}
            filter={
              <select
                className={`form-select ${styles.dashboardRequestButton}`}
                onChange={(event) => {
                  setField(event.target.value);
                }}
              >
                <option value="status">Status</option>
                <option value="fault">Fault Types</option>
                <option value="priority">Priority</option>
              </select>
            }
            style={{ gridArea: "e" }}
          >
            {requestData && requestData.length > 0 ? (
              <PChart data={requestData} />
            ) : (
              <p className={styles.dashboardNoChart}>No requests</p>
            )}
          </DashboardBox>
          <DashboardBox
            title={"Total Checklists: " + totalChecklist}
            style={{ gridArea: "f" }}
          >
            {checklistData && checklistData.length > 0 ? (
              <PChart data={checklistData} />
            ) : (
              <p className={styles.dashboardNoChart}>No requests</p>
            )}
          </DashboardBox>
          <DashboardBox
            title="Change of Parts Requested"
            style={{ gridArea: "g" }}
          ></DashboardBox>
        </div>
      </ModuleContent>
    </ModuleMain>
  );
}


function dayjs(date: import("dayjs").Dayjs | null, arg1: string): string {
  throw new Error("Function not implemented.");
}
// 1. Consolidated View ( All Plants) of the above Engineer Set of KPIs
// Filters for Year/Quarter/Month/Week
// Filters by Plant/Plants (Multiple Selections)
// Filters by Requests/Checklists or Both
