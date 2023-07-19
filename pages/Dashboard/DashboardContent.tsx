import React, { useState, useEffect } from "react";
import {
  ModuleContent,
  ModuleFooter,
  ModuleHeader,
  ModuleMain,
} from "../../components";
import styles from "../../styles/Dashboard.module.scss";
import DashboardBox from "../../components/Dashboard/DashboardBox";
import PlantSelect, { getPlants } from "../../components/PlantSelect";
import { CMMSDashboardData, CMMSFeedback } from "../../types/common/interfaces";
import PChart from "../../components/Dashboard/PChart";
import { fetchData } from ".";
import { ThreeDots } from "react-loading-icons";
import LoadingHourglass from "../../components/LoadingHourglass";
import type { DatePickerProps, TimePickerProps } from 'antd';
import { Select } from 'antd';
import PickerWithType from "../../components/PickerWithType";
import moment from "moment";
import Request from "../Request/index";
import Checklist from "../Checklist";
import ChangeOfPartsPage from "../ChangeOfParts";
import Feedback from "../Feedback";
import { set } from "nprogress";
import instance from "../../types/common/axios.config";

const { Option } = Select;

type PickerType = 'date';

export default function DashboardContent({ role_id }: { role_id: number }) {
  const [showTotalContainer, setShowTotalContainer] = useState<boolean>(true);
  const [page, setPage] = useState(1);
  const [showDiv, setShowDiv] = useState<string>();
  const [active, setActive] = useState("");
  const [isReady, setIsReady] = useState<boolean>(false);
  const [isChecklistReady, setIsChecklistReady] = useState<boolean>(false);
  const [isRequestReady, setIsRequestReady] = useState<boolean>(false);
  const [isCOPReady, setIsCOPReady] = useState<boolean>(false);
  const [isFeedbackReady, setIsFeedbackReady] = useState<boolean>(false);
  const [plant, setPlant] = useState<number>(0);
  const [field, setField] = useState<string>("status");
  const [pickerwithtype, setPickerWithType] = useState<{
    date: string,
    datetype: PickerType
  }>({ date: 'all', datetype: 'date' });
  const [request, setRequest] = useState<{
    totalPendingRequest: number;
    totalOutstandingRequest: number;
    totalClosedRequest: number;
  }>({ totalPendingRequest: 0, totalOutstandingRequest: 0, totalClosedRequest: 0 });
  const [checklist, setChecklist] = useState<{
    totalPendingChecklist: number;
    totalOutstandingChecklist: number;
    totalClosedChecklist: number;
  }>({ totalPendingChecklist: 0, totalOutstandingChecklist: 0, totalClosedChecklist: 0 });
  const [cop, setCOP] = useState<{
    totalScheduledCOP: number;
    totalCompletedCOP: number;
  }>({ totalScheduledCOP: 0, totalCompletedCOP: 0 });
  const [feedback, setFeedback] = useState<{
    totalPendingFeedback: number;
    totalOutstandingFeedback: number;
    totalCompletedFeedback: number;
  }>({ totalPendingFeedback: 0, totalOutstandingFeedback: 0, totalCompletedFeedback: 0 });
  const [checklistData, setChecklistData] = useState<CMMSDashboardData[]>();
  const [requestData, setRequestData] = useState<CMMSDashboardData[]>();
  const [copData, setCOPData] = useState<CMMSDashboardData[]>();
  const [feedbackData, setFeedbackData] = useState<CMMSDashboardData[]>();

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

  const fetchRequests = () => {
    const { datetype, date } = pickerwithtype; 

    setIsRequestReady(false);

    fetchData("request", plant, field, datetype, date).then((result) => {
      if (result) setRequestData(result);
    });

    fetchData("request", plant, "status", datetype, date).then((result) => {
      setRequest({
        totalPendingRequest: result?.filter((data) => data.id === 1)[0]?.value || 0,
        totalOutstandingRequest: 
          result?.filter((data) => [2].includes(data.id))
          ?.reduce((accumulator, currentValue) => accumulator + currentValue.value, 0) || 0,
        totalClosedRequest: 
          result?.filter((data) => [3, 4, 5, 6].includes(data.id))
          ?.reduce((accumulator, currentValue) => accumulator + currentValue.value, 0) || 0,
      });

      setTimeout(() => {
        setIsReady(true);
      }, 500);
      setIsRequestReady(true);
    });
  }

  const fetchChecklists = () => {
    const { datetype, date } = pickerwithtype; 

    setIsChecklistReady(false);

    fetchData("checklist", plant, "status", datetype, date).then((result) => {
      if (result) {
        setChecklistData(result);
        setIsChecklistReady(true);
        setChecklist({
          totalPendingChecklist: result?.filter((data) => data.id === 1)[0]?.value || 0,
          totalOutstandingChecklist:
            result?.filter((data) => [2].includes(data.id))
            ?.reduce((accumulator, currentValue) => accumulator + currentValue.value, 0) || 0,
          totalClosedChecklist:
            result?.filter((data) => [3, 4, 5, 6].includes(data.id))
            ?.reduce((accumulator, currentValue) => accumulator + currentValue.value, 0) || 0,
        });
      }
    });
  }

  const fetchCOPs = async () => {
    const { datetype, date } = pickerwithtype; 

    setIsRequestReady(false);

    const getScheduledCOP = instance.get(`/api/changeOfParts/scheduled/${plant}/${datetype}/${date}`)

    const getCompletedCOP = instance.get(`/api/changeOfParts/completed/${plant}/${datetype}/${date}`)

    const getAllCOP = await Promise.all([getScheduledCOP, getCompletedCOP]);

    const scheduleData = getAllCOP[0].data;
    const completedData = getAllCOP[1].data;

    const totalScheduledCOP = scheduleData?.length || 0;
    const totalCompletedCOP = completedData?.length || 0;

    console.log('scheduled', getAllCOP)

    setCOPData([
      {'name': 'Scheduled', 'value': totalScheduledCOP, 'fill': '#C74B50', 'id': 1},
      {'name': 'Completed', 'value': totalCompletedCOP, 'fill': '#03C988', 'id': 2}
    ]);

    setCOP({
      totalScheduledCOP: scheduleData.length,
      totalCompletedCOP: completedData.length
    });

    setTimeout(() => {
      setIsReady(true);
    }, 500);
    setIsCOPReady(true);
  }

  const fetchFeedbacks = async () => {
    const { datetype, date } = pickerwithtype;

    const getPendingFeedback = instance.get(`/api/feedback/pending/${plant}/${datetype}/${date}`);
    const getOustandingFeedback = instance.get(`/api/feedback/outstanding/${plant}/${datetype}/${date}`);
    const getCompletedFeedback = instance.get(`/api/feedback/completed/${plant}/${datetype}/${date}`);
    
    const getAllFeedback = await Promise.all([getPendingFeedback, getOustandingFeedback, getCompletedFeedback]);

    const pendingFeedback = getAllFeedback[0].data?.rows;
    const outstandingFeedback = getAllFeedback[1].data?.rows;
    const completedFeedback = getAllFeedback[2].data?.rows;

    setFeedbackData([
      {'name': 'Pending', 'value': pendingFeedback?.length || 0, 'fill': '#C74B50', 'id': 1},
      {'name': 'Outstanding', 'value': outstandingFeedback?.length || 0, 'fill': '#810CA8', 'id': 2},
      {'name': 'Completed', 'value': completedFeedback?.length || 0, 'fill': '#03C988', 'id': 3},
    ]);

    setFeedback({
      totalPendingFeedback: pendingFeedback?.length || 0,
      totalOutstandingFeedback: outstandingFeedback?.length || 0,
      totalCompletedFeedback: completedFeedback?.length || 0
    });

    console.log(feedbackData)

    setTimeout(() => {
      setIsReady(true);
    }, 500);
    setIsFeedbackReady(true);
  }

  useEffect(() => {
    const { datetype, date } = pickerwithtype;

    if([3, 4].includes(role_id)) { // engineer, specialist
      getPlants("/api/getUserPlants").then(result => {
          if (result) {
            setPlant(result[0].plant_id)
            fetchRequests();
            fetchChecklists();
            fetchCOPs();
            fetchFeedbacks();
          }
      })

      if(role_id == 4) {
        setShowTotalContainer(false);
      }

    } else {

      fetchRequests();
      fetchChecklists();
      fetchCOPs();
      fetchFeedbacks();
    }
    

  }, [plant, field, pickerwithtype, active]);


  const totalRequest = requestData?.reduce((accumulator, currentValue) => {
    return accumulator + currentValue.value;
  }, 0);
  const totalChecklist = checklistData?.reduce((accumulator, currentValue) => {
    return accumulator + currentValue.value;
  }, 0);
  const totalCOP = copData?.reduce((accumulator, currentValue) => {
    return accumulator + currentValue.value;
  }, 0);
  const totalFeedback = feedbackData?.reduce((accumulator, currentValue) => {
    return accumulator + currentValue.value;
  }, 0);

  if (!isReady) {
    return (
      <div style={{ position: "absolute", top:"calc((100% - 8rem) / 2)", left:"50%", transform:"translate(-50%,-50%)"}}>
        <LoadingHourglass />
      </div>
    );
  }

  const { date, datetype } = pickerwithtype;

  const { totalPendingRequest, totalOutstandingRequest, totalClosedRequest } = request;
  const { totalPendingChecklist, totalOutstandingChecklist, totalClosedChecklist } = checklist;
  const { totalScheduledCOP, totalCompletedCOP } = cop;
  const { totalPendingFeedback, totalOutstandingFeedback, totalCompletedFeedback } = feedback;

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

        {[3,4].includes(role_id) 
          ?<PlantSelect
            onChange={(e) => setPlant(parseInt(e.target.value))}
            accessControl
            default
          />
          :<PlantSelect
          onChange={(e) => setPlant(parseInt(e.target.value))}
          allPlants
        />
        }
      </ModuleHeader>
      <ModuleContent>
        <div className={styles.dashboardMain}>
          <DashboardBox id="pending-requests-box" title="Pending Requests" style={{ gridArea: "a" }} onClick={handleDashboardClick} className={active === "pending-requests-box" ? styles.active : ""}>
            <p className={styles.dashboardPendingdNumber}>
              {totalPendingRequest}
            </p>
          </DashboardBox>
          <DashboardBox id="outstanding-requests-box" title="Outstanding Requests" style={{ gridArea: "b" }} onClick={handleDashboardClick} className={active === "outstanding-requests-box" ? styles.active : ""}>
            <p className={styles.dashboardOutstandingNumber}>
              {totalOutstandingRequest}
            </p>
          </DashboardBox>
          <DashboardBox id="closed-requests-box" title="Completed Requests" style={{ gridArea: "c" }} onClick={handleDashboardClick} className={active === "closed-requests-box" ? styles.active : ""}>
            <p className={styles.dashboardCompletedNumber}>
              {totalClosedRequest}
            </p>
          </DashboardBox>
          {showTotalContainer && <DashboardBox
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
            style={{ gridArea: "d" }}
          >
            {requestData && requestData.length > 0 ? (
              <PChart data={requestData} />
            ) : (
              <p className={styles.dashboardNoChart}>No requests</p>
            )}
          </DashboardBox>
          }
          <DashboardBox id="pending-checklists-box" title="Pending Checklists" style={{ gridArea: "e" }} onClick={handleDashboardClick} className={active === "pending-checklists-box" ? styles.active : ""}>
            <p className={styles.dashboardPendingdNumber}>
              {totalPendingChecklist}
            </p>
          </DashboardBox>
          <DashboardBox id="outstanding-checklists-box" title="Outstanding Checklists" style={{ gridArea: "f" }} onClick={handleDashboardClick} className={active === "outstanding-checklists-box" ? styles.active : ""}>
            <p className={styles.dashboardOutstandingNumber}>
              {totalOutstandingChecklist}
            </p>
          </DashboardBox>
          <DashboardBox 
            id="completed-checklists-box" 
            title="Completed Checklists" 
            style={{ gridArea: "g" }} 
            onClick={handleDashboardClick} 
            className={active === "completed-checklists-box" ? styles.active : ""}>
            <p className={styles.dashboardCompletedNumber}>
              {totalClosedChecklist}
            </p>
          </DashboardBox>
          {showTotalContainer && <DashboardBox
            title={"Total Checklists: " + totalChecklist}
            style={{ gridArea: "h" }}
          >
            {checklistData && checklistData.length > 0 ? (
              <PChart data={checklistData} />
            ) : (
              <p className={styles.dashboardNoChart}>No requests</p>
            )}
          </DashboardBox>
          }
          <DashboardBox
            id="scheduled-cop-box"
            title="Scheduled Change of Parts"
            style={{ gridArea: "i" }}
            onClick={handleDashboardClick} 
            className={active === "scheduled-cop-box" ? styles.active : ""}
          >
            <p className={styles.dashboardPendingdNumber}>
              {totalScheduledCOP}
            </p>
          </DashboardBox>
          <DashboardBox
            id="completed-cop-box"
            title="Completed Change of Parts"
            style={{ gridArea: "j" }}
            onClick={handleDashboardClick}
            className={active === "completed-cop-box" ? styles.active : ""}
          >
            <p className={styles.dashboardCompletedNumber}>
              {totalCompletedCOP}
            </p>
          </DashboardBox>
          <DashboardBox
            title=""
            style={{ gridArea: "k" }}
          ></DashboardBox>
          {showTotalContainer && <DashboardBox
            title={"Total Change of Parts: " + totalCOP}
            style={{ gridArea: "l" }}
          >
            {copData && copData.length > 0 ? (
              <PChart data={copData} />
            ) : (
              <p className={styles.dashboardNoChart}>No change of parts</p>
            )}
          </DashboardBox>
          }
          <DashboardBox
            id="pending-feedback-box"
            title="Pending Feedbacks"
            style={{ gridArea: "m" }}
            onClick={handleDashboardClick} 
            className={active === "pending-feedback-box" ? styles.active : ""}
          >
            <p className={styles.dashboardPendingdNumber}>
              {totalPendingFeedback}
            </p>
          </DashboardBox>
          <DashboardBox
            id="outstanding-feedback-box"
            title="Outstanding Feedbacks"
            style={{ gridArea: "n" }}
            onClick={handleDashboardClick}
            className={active === "outstanding-feedback-box" ? styles.active : ""}
          >
            <p className={styles.dashboardOutstandingNumber}>
              {totalOutstandingFeedback}
            </p>
          </DashboardBox>
          <DashboardBox
            id="completed-feedback-box"
            title="Completed Feedbacks"
            style={{ gridArea: "o" }}
            onClick={handleDashboardClick}
            className={active === "completed-feedback-box" ? styles.active : ""}
          >
            <p className={styles.dashboardCompletedNumber}>
              {totalCompletedFeedback}
            </p>
          </DashboardBox>
          {showTotalContainer && <DashboardBox
            title={"Total Feedbacks: " + totalFeedback}
            style={{ gridArea: "p" }}
          >
            {feedbackData && feedbackData.length > 0 ? (
              <PChart data={feedbackData} />
            ) : (
              <p className={styles.dashboardNoChart}>No feedbacks</p>
            )}
          </DashboardBox>
          }
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
        {showDiv === 'outstanding-requests-box' && 
          <Request 
            isReady={isRequestReady} 
            filter={true} 
            status={"2"} 
            date={date} 
            datetype={datetype} 
            plant={plant as number} 
            />}
        {showDiv === 'closed-requests-box' && 
          <Request 
            isReady={isRequestReady} 
            filter={true} 
            status={"3,4,5,6"} 
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
        {showDiv === 'outstanding-checklists-box' && 
          <Checklist 
            isReady={isChecklistReady} 
            filter={true} 
            status={2} 
            date={date} 
            datetype={datetype} 
            plant={plant as number} 
            />}
        {showDiv === 'completed-checklists-box' && 
          <Checklist 
            isReady={isChecklistReady} 
            filter={true} 
            status={"3,4,5,6"} 
            date={date} 
            datetype={datetype} 
            plant={plant as number} 
             />}
        {showDiv === 'scheduled-cop-box' && 
          <ChangeOfPartsPage 
            changeOfParts={[]} 
            activeCOPType={0} 
            filter={true}/>
        }
        {showDiv === 'completed-cop-box' && 
          <ChangeOfPartsPage 
            changeOfParts={[]} 
            activeCOPType={1} 
            filter={true}/>
        }
        {showDiv === 'pending-feedback-box' && 
        <Feedback 
          filter={true} 
          activeTabIndex={0} />
        }
        {showDiv === 'outstanding-feedback-box' && 
        <Feedback 
          filter={true} 
          activeTabIndex={1} />
        }
        {showDiv === 'completed-feedback-box' && 
        <Feedback 
          filter={true} 
          activeTabIndex={2} />
        }
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
