import React, { useState, useEffect } from "react";
import { ModuleContent, ModuleFooter, ModuleHeader, ModuleMain } from "../../components";
import styles from "../../styles/Dashboard.module.scss";
import DashboardBox from "../../components/Dashboard/DashboardBox";
import PlantSelect, { getPlants } from "../../components/PlantSelect";
import { CMMSDashboardData } from "../../types/common/interfaces";
import PChart from "../../components/Dashboard/PChart";
import { fetchData } from ".";

export default function EngineerDashboad() {
    const [plant, setPlant] = useState<number>();
    const [checklistData, setChecklistData] = useState<CMMSDashboardData[]>();
    const [requestData, setRequestData] = useState<CMMSDashboardData[]>();

    useEffect(() => {
        getPlants("/api/getUserPlants").then(result => {
            if (result) {
                console.log(result)
                setPlant(result[0].plant_id)
                fetchData("checklist", plant as number, "status").then(result => {
                    if (result) setChecklistData(result)
                });
                fetchData("request", plant as number, "status").then(result => {
                    if (result) setRequestData(result)
                });
            }
        })
    }, [plant]);

    const pendingRequest = requestData?.filter(data => data.id === 1)[0];
    const closedRequest = requestData?.filter(data => data.id === 4)[0];
    const pendingChecklist = checklistData?.filter(data => data.id === 1)[0];
    const completedChecklist = checklistData?.filter(data => data.id === 4)[0];

    return (
        <ModuleMain>
            <ModuleHeader header="Dashboard">
                <PlantSelect onChange={(e) => setPlant(parseInt(e.target.value))} accessControl default />
            </ModuleHeader>
            <ModuleContent>
                <div className={styles.dashboardMain}>
                    <DashboardBox title="Pending Requests" style={{gridArea: "a"}}>
                        <p className={styles.dashboardPendingdNumber}>{pendingRequest ? pendingRequest.value : 0}</p>
                    </DashboardBox>
                    <DashboardBox title="Closed Requests" style={{gridArea: "b"}}>
                        <p className={styles.dashboardCompletedNumber}>{closedRequest ? closedRequest.value : 0}</p>
                    </DashboardBox>
                    <DashboardBox title="Pending Checklists" style={{gridArea: "c"}}>
                        <p className={styles.dashboardPendingdNumber}>{pendingChecklist ? pendingChecklist.value : 0}</p>
                    </DashboardBox>
                    <DashboardBox title="Completed Checklists" style={{gridArea: "d"}}>
                        <p className={styles.dashboardCompletedNumber}>{completedChecklist ? completedChecklist.value : 0}</p>
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