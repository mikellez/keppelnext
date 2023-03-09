import React, { useState, useEffect } from "react";
import { ModuleContent, ModuleFooter, ModuleHeader, ModuleMain } from "../../components";
import styles from "../../styles/Dashboard.module.scss";
import DashboardBox from "../../components/Dashboard/DashboardBox";
import PlantSelect from "../../components/PlantSelect";
import { CMMSDashboardData } from "../../types/common/interfaces";
import axios from "axios";

async function fetchData(type: string, plant: number) {
    const url = `/api/dashboard/${type}/${plant}`;
    return await axios.get<CMMSDashboardData[]>(url)
        .then(res => {
            return res.data
        })
        .catch(err => console.log(err))
};

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

    console.log(requestData)
    console.log(checklistData)

    return (
        <ModuleMain>
            <ModuleHeader header="Dashboard">
                <PlantSelect onChange={(e) => setPlant(parseInt(e.target.value))} allPlants />
            </ModuleHeader>
            <ModuleContent>
                <div className={styles.dashboardMain}>
                    <DashboardBox title="Pending Requests" style={{gridArea: "a"}}>
                        
                    </DashboardBox>
                    <DashboardBox title="Closed Requests" style={{gridArea: "b"}}>

                    </DashboardBox>
                    <DashboardBox title="Pending Checklists" style={{gridArea: "c"}}>

                    </DashboardBox>
                    <DashboardBox title="Completed Checklists" style={{gridArea: "d"}}>

                    </DashboardBox>
                    <DashboardBox title="Total Requests" style={{gridArea: "e"}}>

                    </DashboardBox>
                    <DashboardBox title="Total Checklists" style={{gridArea: "f"}}>

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