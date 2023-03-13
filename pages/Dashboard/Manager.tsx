import React, { useState, useEffect } from "react";
import { ModuleContent, ModuleFooter, ModuleHeader, ModuleMain } from "../../components";
import styles from "../../styles/Dashboard.module.scss";
import DashboardBox from "../../components/Dashboard/DashboardBox";
import PlantSelect from "../../components/PlantSelect";
import { CMMSDashboardData } from "../../types/common/interfaces";
import PChart from "../../components/Dashboard/PChart";
import { fetchData } from ".";

export default function ManagerDashboad() {
    const [plant, setPlant] = useState<number>(0);
    const [checklistData, setChecklistData] = useState<CMMSDashboardData[]>();
    const [requestData, setRequestData] = useState<CMMSDashboardData[]>();

    useEffect(() => {
        fetchData("checklist", plant).then(result => {
            if (result) setChecklistData(result)
        });
        fetchData("request", plant).then(result => {
            if (result) setRequestData(result)
        });
    }, [plant])

    const pendingRequest = requestData?.filter(data => data.status_id === 1)[0];
    const closedRequest = requestData?.filter(data => data.status_id === 4)[0];
    const pendingChecklist = checklistData?.filter(data => data.status_id === 1)[0];
    const completedChecklist = checklistData?.filter(data => data.status_id === 4)[0];

    console.log(requestData)

    return (
        <ModuleMain>
            <ModuleHeader header="Dashboard">
                <PlantSelect onChange={(e) => setPlant(parseInt(e.target.value))} allPlants />
            </ModuleHeader>
            <ModuleContent>
                <div className={styles.dashboardMain}>
                    <DashboardBox title="Pending Requests" style={{gridArea: "a"}}>
                        <p className={styles.dashboardPendingdNumber}>{pendingRequest ? pendingRequest.count : 0}</p>
                    </DashboardBox>
                    <DashboardBox title="Closed Requests" style={{gridArea: "b"}}>
                        <p className={styles.dashboardCompletedNumber}>{closedRequest ? closedRequest.count : 0}</p>
                    </DashboardBox>
                    <DashboardBox title="Pending Checklists" style={{gridArea: "c"}}>
                        <p className={styles.dashboardPendingdNumber}>{pendingChecklist ? pendingChecklist.count : 0}</p>
                    </DashboardBox>
                    <DashboardBox title="Completed Checklists" style={{gridArea: "d"}}>
                        <p className={styles.dashboardCompletedNumber}>{completedChecklist ? completedChecklist.count : 0}</p>
                    </DashboardBox>
                    <DashboardBox title="Total Requests" style={{gridArea: "e"}}>
                        {
                            requestData && requestData.length > 0 ? <PChart data={requestData} /> : 
                            <p className={styles.dashboardNoChart}>No requests</p>
                        }
                    </DashboardBox>
                    <DashboardBox title="Total Checklists" style={{gridArea: "f"}}>
                        {
                            checklistData && checklistData.length > 0 ? <PChart data={checklistData} /> : 
                            <p className={styles.dashboardNoChart}>No requests</p>
                        }
                    </DashboardBox>
                    <DashboardBox title="Change of Parts Requested" style={{gridArea: "g"}}>
                    </DashboardBox>
                </div>
            </ModuleContent>
       </ModuleMain>
    );
};

// 1. Consolidated View ( All Plants) of the above Engineer Set of KPIs
// Filters for Year/Quarter/Month/Week
// Filters by Plant/Plants (Multiple Selections)
// Filters by Requests/Checklists or Both