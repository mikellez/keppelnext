import React from "react";
import { ModuleContent, ModuleFooter, ModuleHeader, ModuleMain } from "../../components";
import styles from "../../styles/Dashboard.module.scss";
import DashboardBox from "../../components/Dashboard/DashboardBox";
import PlantSelect from "../../components/PlantSelect";

export default function EngineerDashboad() {
    return (
        <ModuleMain>
            <ModuleHeader header="Dashboard">
                <PlantSelect onChange={() => {}} accessControl />
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