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

export default function ManagerDashboad() {
  const [plant, setPlant] = useState<number>(0);
  const [field, setField] = useState<string>("status");
  const [request, setRequest] = useState<{
    pendingRequest: CMMSDashboardData | null;
    closedRequest: CMMSDashboardData | null;
  }>({ pendingRequest: null, closedRequest: null });
  const [checklistData, setChecklistData] = useState<CMMSDashboardData[]>();
  const [requestData, setRequestData] = useState<CMMSDashboardData[]>();

  useEffect(() => {
    fetchData("request", plant, field).then((result) => {
      if (result) setRequestData(result);
    });

    fetchData("request", plant, "status").then((result) => {
      setRequest({
        pendingRequest: result?.filter((data) => data.id === 1)[0],
        closedRequest: result?.filter((data) => data.id === 4)[0],
      });
    });
  }, [plant, field]);

  useEffect(() => {
    fetchData("checklist", plant, "status").then((result) => {
      if (result) setChecklistData(result);
    });
  }, [plant]);

  const pendingChecklist = checklistData?.filter((data) => data.id === 1)[0];
  const completedChecklist = checklistData?.filter((data) => data.id === 4)[0];
  const totalRequest = requestData?.reduce((accumulator, currentValue) => {
    return accumulator + currentValue.value;
  }, 0);
  const totalChecklist = checklistData?.reduce((accumulator, currentValue) => {
    return accumulator + currentValue.value;
  }, 0);

  return (
    <ModuleMain>
      <ModuleHeader header="Dashboard">
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

// 1. Consolidated View ( All Plants) of the above Engineer Set of KPIs
// Filters for Year/Quarter/Month/Week
// Filters by Plant/Plants (Multiple Selections)
// Filters by Requests/Checklists or Both
