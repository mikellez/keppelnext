import React, { useState, useEffect } from "react";
import { ModuleContent, ModuleFooter, ModuleHeader, ModuleMain } from "../../components";
import styles from "../../styles/Dashboard.module.scss";
import DashboardBox from "../../components/Dashboard/DashboardBox";
import PlantSelect, { getPlants } from "../../components/PlantSelect";
import { CMMSDashboardData } from "../../types/common/interfaces";
import PChart from "../../components/Dashboard/PChart";
import { fetchData } from ".";
import type { DatePickerProps, TimePickerProps } from 'antd';
import { Select } from 'antd';
import PickerWithType from "../../components/PickerWithType";
import moment from "moment";
import Request from "../Request/index";
import Checklist from "../Checklist";

const { Option } = Select;

type PickerType = 'date';

export default function SpecialistDashboad() {
    const [showDiv, setShowDiv] = useState<string>();
    const [active, setActive] = useState("");
    const [isRequestReady, setIsRequestReady] = useState<boolean>(false);
    const [isChecklistReady, setIsChecklistReady] = useState<boolean>(false);
    const [plant, setPlant] = useState<number>();
    const [checklistData, setChecklistData] = useState<CMMSDashboardData[]>();
    const [requestData, setRequestData] = useState<CMMSDashboardData[]>();
    const [pickerwithtype, setPickerWithType] = useState<{
        date: string,
        datetype: PickerType
    }>({ date: 'all', datetype: 'date' });

    const handleDateChange: DatePickerProps['onChange'] = (date, dateString) => {
        setPickerWithType({ date: dateString ? moment(date?.toDate()).format("YYYY-MM-DD") : 'all', datetype: pickerwithtype.datetype });
    }

    const handleDateTypeChange = (value: PickerType) => {
        let { date } = pickerwithtype;
        setPickerWithType({ date: date || 'all', datetype: value });
    }

    const handleDashboardClick = (e: { currentTarget: { id: any; }; }) => {
        const { id } = e.currentTarget;
        setShowDiv(id);
        setActive(id);
    }

    useEffect(() => {
        const { datetype, date } = pickerwithtype;
        setIsChecklistReady(false);
        setIsRequestReady(false);

        getPlants("/api/getUserPlants").then(result => {
            if (result) {
                console.log(result)
                setPlant(result[0].plant_id)
                
                fetchData("checklist", result[0].plant_id as number, "status", datetype, date).then(result => {
                    if (result) {
                        setChecklistData(result)
                        setIsChecklistReady(true);
                    }
                });
                fetchData("request", result[0].plant_id as number, "status", datetype, date).then(result => {
                    if (result) {
                        setRequestData(result) 
                        setIsRequestReady(true);
                    }
                });
            }
        })
    }, [pickerwithtype, active]);

    const pendingRequest = requestData?.filter(data => data.id === 1)[0];
    const closedRequest = requestData?.filter(data => data.id === 4)[0];
    const pendingChecklist = checklistData?.filter(data => data.id === 1)[0];
    const completedChecklist = checklistData?.filter(data => data.id === 4)[0];

    const { datetype, date } = pickerwithtype;

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
                <PlantSelect onChange={(e) => setPlant(parseInt(e.target.value))} accessControl default />
            </ModuleHeader>
            <ModuleContent>
                <div className={styles.dashboardMain}>
                    <DashboardBox id="pending-requests-box" title="Pending Requests" style={{ gridArea: "a" }} onClick={handleDashboardClick} className={active === "pending-requests-box" ? styles.active : ""}>
                        <p className={styles.dashboardPendingdNumber}>
                        {pendingRequest ? pendingRequest.value : 0}
                        </p>
                    </DashboardBox>
                    <DashboardBox id="closed-requests-box" title="Closed Requests" style={{ gridArea: "b" }} onClick={handleDashboardClick} className={active === "closed-requests-box" ? styles.active : ""}>
                        <p className={styles.dashboardCompletedNumber}>
                        {closedRequest ? closedRequest.value : 0}
                        </p>
                    </DashboardBox>
                    <DashboardBox id="pending-checklists-box" title="Pending Checklists" style={{ gridArea: "c" }} onClick={handleDashboardClick} className={active === "pending-checklists-box" ? styles.active : ""}>
                        <p className={styles.dashboardPendingdNumber}>
                        {pendingChecklist ? pendingChecklist.value : 0}
                        </p>
                    </DashboardBox>
                    <DashboardBox id="completed-checklists-box" title="Completed Checklists" style={{ gridArea: "d" }} onClick={handleDashboardClick} className={active === "completed-checklists-box" ? styles.active : ""}>
                        <p className={styles.dashboardCompletedNumber}>
                        {completedChecklist ? completedChecklist.value : 0}
                        </p>
                    </DashboardBox>
                </div>

                {showDiv === 'pending-requests-box' && 
                <Request 
                    isReady={isRequestReady} 
                    filter={true} 
                    status={1} 
                    date={date} 
                    datetype={datetype} 
                    plant={plant as number} 
                    />}
                {showDiv === 'closed-requests-box' && 
                <Request 
                    isReady={isRequestReady} 
                    filter={true} 
                    status={4} 
                    date={date} 
                    datetype={datetype} 
                    plant={plant as number} 
                    />}
                {showDiv === 'pending-checklists-box' && 
                <Checklist 
                    isReady={isChecklistReady} 
                    filter={true} 
                    status={1} 
                    date={date} 
                    datetype={datetype} 
                    plant={plant as number} />}
                {showDiv === 'completed-checklists-box' && 
                <Checklist 
                    isReady={isChecklistReady} 
                    filter={true} 
                    status={4} 
                    date={date} 
                    datetype={datetype} 
                    plant={plant as number} 
                    />}

            </ModuleContent>
       </ModuleMain>
    );
};