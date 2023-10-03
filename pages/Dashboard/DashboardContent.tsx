import type { DatePickerProps } from "antd";
import { Select } from "antd";
import moment from "moment";
import { useEffect, useState } from "react";
import {
  ModuleContent,
  ModuleHeader,
  ModuleMain,
  ModuleModal
} from "../../components";
import DashboardBox from "../../components/Dashboard/DashboardBox";
import PChart from "../../components/Dashboard/PChart";
import LoadingHourglass from "../../components/LoadingHourglass";
import PickerWithType from "../../components/PickerWithType";
import PlantSelect, { getPlants } from "../../components/PlantSelect";
import { useCurrentUser } from "../../components/SWR";
import styles from "../../styles/Dashboard.module.scss";
import instance from "../../types/common/axios.config";
import { PermissionsRoles } from "../../types/common/enums";
import { CMMSDashboardData } from "../../types/common/interfaces";
import ChangeOfPartsPage from "../ChangeOfParts";
import Checklist from "../Checklist";
import Feedback from "../Feedback";
import Request from "../Request/index";
import { fetchData } from ".";

const { Option } = Select;

type PickerType = "date";

export default function DashboardContent({ permissions }: { permissions: string[] }) {
  const {data, userPermission} = useCurrentUser();
  const [showTotalContainer, setShowTotalContainer] = useState<boolean>(false);
  const [page, setPage] = useState(1);
  const [showDiv, setShowDiv] = useState<string>();
  const [active, setActive] = useState("");
  const [isReady, setIsReady] = useState<boolean>(false);
  const [isChecklistReady, setIsChecklistReady] = useState<boolean>(false);
  const [isRequestReady, setIsRequestReady] = useState<boolean>(false);
  const [isCOPReady, setIsCOPReady] = useState<boolean>(false);
  const [isFeedbackReady, setIsFeedbackReady] = useState<boolean>(false);
  const [isLicenseReady, setIsLicenseReady] = useState<boolean>(false);
  const [plant, setPlant] = useState<number>(0);
  const [field, setField] = useState<string>("status");
  const [displayModal, setDisplayModal] = useState<boolean>(false);
  const [expiredLicenseInDays, setExpiredLicencesInDays] =
    useState<string>("expiry");
  const [pickerwithtype, setPickerWithType] = useState<{
    date: string;
    datetype: PickerType;
  }>({ date: "all", datetype: "date" });
  const [request, setRequest] = useState<{
    totalPendingRequest: number;
    totalOutstandingRequest: number;
    totalClosedRequest: number;
    totalOverdueRequest: number;
  }>({
    totalPendingRequest: 0,
    totalOutstandingRequest: 0,
    totalClosedRequest: 0,
    totalOverdueRequest: 0,
  });
  const [checklist, setChecklist] = useState<{
    totalPendingChecklist: number;
    totalOutstandingChecklist: number;
    totalClosedChecklist: number;
    totalOverdueChecklist: number;
  }>({
    totalPendingChecklist: 0,
    totalOutstandingChecklist: 0,
    totalClosedChecklist: 0,
    totalOverdueChecklist: 0,
  });
  const [cop, setCOP] = useState<{
    totalScheduledCOP: number;
    totalCompletedCOP: number;
  }>({ totalScheduledCOP: 0, totalCompletedCOP: 0 });
  const [feedback, setFeedback] = useState<{
    totalPendingFeedback: number;
    totalOutstandingFeedback: number;
    totalCompletedFeedback: number;
  }>({
    totalPendingFeedback: 0,
    totalOutstandingFeedback: 0,
    totalCompletedFeedback: 0,
  });
  const [license, setLicense] = useState<{
    totalDraftLicense: number;
    totalAcquiredLicense: number;
    totalLicenseExpiredIn30: number;
    totalLicenseExpiredIn60: number;
    totalLicenseExpiredIn90: number;
  }>({ 
    totalDraftLicense: 0, 
    totalAcquiredLicense: 0, 
    totalLicenseExpiredIn30: 0, 
    totalLicenseExpiredIn60: 0, 
    totalLicenseExpiredIn90: 0 
  });
  const [checklistData, setChecklistData] = useState<CMMSDashboardData[]>();
  const [requestData, setRequestData] = useState<CMMSDashboardData[]>();
  const [copData, setCOPData] = useState<CMMSDashboardData[]>();
  const [feedbackData, setFeedbackData] = useState<CMMSDashboardData[]>();
  const [licenseData, setLicenseData] = useState<CMMSDashboardData[]>();

  const [requestAccess, setRequestAccess] = useState<boolean>(permissions.includes(PermissionsRoles.CanViewDashboardRequestTicket));
  const [checklistAccess, setChecklistAccess] = useState<boolean>(permissions.includes(PermissionsRoles.CanViewDashboardChecklist));
  const [changeOfPartsAccess, setChangeOfPartsAccess] = useState<boolean>(permissions.includes(PermissionsRoles.CanViewDashboardChangeOfParts));
  const [feedbackAccess, setFeedbackAccess] = useState<boolean>(permissions.includes(PermissionsRoles.CanViewDashboardFeedback));
  const [licenseAccess, setLicenseAccess] = useState<boolean>(permissions.includes(PermissionsRoles.CanViewDashboardLicense));
  const [allPlantAccess, setAllPlantAccess] = useState<boolean>(permissions.includes(PermissionsRoles.CanAccessAllPlants));
  const [manageRequestAccess, setManageRequestAccess] = useState<boolean>(permissions.includes(PermissionsRoles.CanManageRequestTicket));
  const [manageChecklistAccess, setManageChecklistAccess] = useState<boolean>(permissions.includes(PermissionsRoles.CanManageChecklist));

  const handleDateChange: DatePickerProps["onChange"] = (date, dateString) => {
    setPickerWithType({
      date: dateString ? moment(date?.toDate()).format("YYYY-MM-DD") : "all",
      datetype: pickerwithtype.datetype,
    });
  };

  const handleDateTypeChange = (value: PickerType) => {
    let { date } = pickerwithtype;
    setPickerWithType({ date: date || "all", datetype: value });
  };

  const handleDashboardClick = (e: { currentTarget: { id: any } }) => {
    const { id } = e.currentTarget;
    setShowDiv(id);
    setActive(id);
    setDisplayModal(true);
  };

  const fetchRequests = async () => {
    const { datetype, date } = pickerwithtype;
    const PARAMS = ["id"];

    //console.log(`/api/request/pending/${plant}/${datetype}/${date}`);
    const getPendingRequest = instance.get(
      `/api/request/pending/${plant}/${datetype}/${date}?expand=${PARAMS.join(',')}`
    );
    const getOustandingRequest = instance.get(
      `/api/request/outstanding/${plant}/${datetype}/${date}?expand=${PARAMS.join(',')}`
    );
    const getCompletedRequest = instance.get(
      `/api/request/completed/${plant}/${datetype}/${date}?expand=${PARAMS.join(',')}`
    );
    const getOverdueRequest = instance.get(
      `/api/request/overdue/${plant}/${datetype}/${date}?expand=${PARAMS.join(',')}`
    );

    const getAllRequest = await Promise.all([
      getPendingRequest,
      getOustandingRequest,
      getCompletedRequest,
      getOverdueRequest
    ]);
    // console.log(getAllFeedback);

    const pendingRequest = getAllRequest[0].data?.rows;
    const outstandingRequest = getAllRequest[1].data?.rows;
    const completedRequest = getAllRequest[2].data?.rows;
    const overdueRequest = getAllRequest[3].data?.rows;

    //console.log(getAllRequest);

    // Don't include overdue requests in total number of requests
    if(field != "status"){
      fetchData("request", plant, field, datetype, date).then((result) => {
        if (result) setRequestData(result);
      });
    }
    else{
      setRequestData([
        {
          name: "Pending",
          value: pendingRequest?.length || 0,
          fill: "#C74B50",
          id: 1,
        },
        {
          name: "Outstanding",
          value: outstandingRequest?.length || 0,
          fill: "#810CA8",
          id: 2,
        },
        {
          name: "Completed",
          value: completedRequest?.length || 0,
          fill: "#03C988",
          id: 3,
        },
      ]);
    }

    setRequest({
      totalPendingRequest: pendingRequest?.length || 0,
      totalOutstandingRequest: outstandingRequest?.length || 0,
      totalOverdueRequest: overdueRequest?.length || 0,
      totalClosedRequest: completedRequest?.length || 0
    });

    // console.log(feedbackData)

    setTimeout(() => {
      setIsReady(true);
    }, 500);
    setIsRequestReady(true);
  };

  const fetchChecklists = async () => {
    const { datetype, date } = pickerwithtype;
    const PARAMS = ["id"];

    //console.log(`/api/checklist/pending/${plant}/${datetype}/${date}`);
    const getPendingChecklist = instance.get(
      `/api/checklist/pending/${plant}/${datetype}/${date}?expand=${PARAMS.join(',')}`
    );
    const getOustandingChecklist = instance.get(
      `/api/checklist/outstanding/${plant}/${datetype}/${date}?expand=${PARAMS.join(',')}`
    );
    const getCompletedChecklist = instance.get(
      `/api/checklist/completed/${plant}/${datetype}/${date}?expand=${PARAMS.join(',')}`
    );
    const getOverdueChecklist = instance.get(
      `/api/checklist/overdue/${plant}/${datetype}/${date}?expand=${PARAMS.join(',')}`
    );

    const getAllChecklist = await Promise.all([
      getPendingChecklist,
      getOustandingChecklist,
      getCompletedChecklist,
      getOverdueChecklist
    ]);
    // console.log(getAllFeedback);

    const pendingChecklist = getAllChecklist[0].data?.rows;
    const outstandingChecklist = getAllChecklist[1].data?.rows;
    const completedChecklist = getAllChecklist[2].data?.rows;
    const overdueChecklist = getAllChecklist[3].data?.rows;

    //console.log(getAllChecklist);

    setChecklistData([
      {
        name: "Pending",
        value: pendingChecklist?.length || 0,
        fill: "#C74B50",
        id: 1,
      },
      {
        name: "Outstanding",
        value: outstandingChecklist?.length || 0,
        fill: "#810CA8",
        id: 2,
      },
      {
        name: "Completed",
        value: completedChecklist?.length || 0,
        fill: "#03C988",
        id: 3,
      },
    ]);

    setChecklist({
      totalPendingChecklist: pendingChecklist?.length || 0,
      totalOutstandingChecklist: outstandingChecklist?.length || 0,
      totalOverdueChecklist: overdueChecklist?.length || 0,
      totalClosedChecklist: completedChecklist?.length || 0
    });

    // console.log(feedbackData)

    setTimeout(() => {
      setIsReady(true);
    }, 500);
    setIsChecklistReady(true);
  };

  const fetchCOPs = async () => {
    const { datetype, date } = pickerwithtype;
    const PARAMS = ["id"];

    setIsRequestReady(false);

    const getScheduledCOP = instance.get(
      `/api/changeOfParts/scheduled/${plant}/${datetype}/${date}?expand=${PARAMS.join(',')}`
    );

    const getCompletedCOP = instance.get(
      `/api/changeOfParts/completed/${plant}/${datetype}/${date}?expand=${PARAMS.join(',')}`
    );

    const getAllCOP = await Promise.all([getScheduledCOP, getCompletedCOP]);

    const scheduleData = getAllCOP[0].data;
    const completedData = getAllCOP[1].data;

    const totalScheduledCOP = scheduleData?.length || 0;
    const totalCompletedCOP = completedData?.length || 0;

    // console.log('scheduled', getAllCOP)

    setCOPData([
      { name: "Scheduled", value: totalScheduledCOP, fill: "#C74B50", id: 1 },
      { name: "Completed", value: totalCompletedCOP, fill: "#03C988", id: 2 },
    ]);

    setCOP({
      totalScheduledCOP: scheduleData.length,
      totalCompletedCOP: completedData.length,
    });

    setTimeout(() => {
      setIsReady(true);
    }, 500);
    setIsCOPReady(true);
  };

  const fetchFeedbacks = async () => {
    const { datetype, date } = pickerwithtype;
    const PARAMS = ["id"];

    //console.log(`/api/feedback/pending/${plant}/${datetype}/${date}`);
    const getPendingFeedback = instance.get(
      `/api/feedback/pending/${plant}/${datetype}/${date}?expand=${PARAMS.join(',')}`
    );
    const getOustandingFeedback = instance.get(
      `/api/feedback/outstanding/${plant}/${datetype}/${date}?expand=${PARAMS.join(',')}`
    );
    const getCompletedFeedback = instance.get(
      `/api/feedback/completed/${plant}/${datetype}/${date}?expand=${PARAMS.join(',')}`
    );

    const getAllFeedback = await Promise.all([
      getPendingFeedback,
      getOustandingFeedback,
      getCompletedFeedback,
    ]);
    // console.log(getAllFeedback);

    const pendingFeedback = getAllFeedback[0].data?.rows;
    const outstandingFeedback = getAllFeedback[1].data?.rows;
    const completedFeedback = getAllFeedback[2].data?.rows;

    //console.log(getAllFeedback);

    setFeedbackData([
      {
        name: "Pending",
        value: pendingFeedback?.length || 0,
        fill: "#C74B50",
        id: 1,
      },
      {
        name: "Outstanding",
        value: outstandingFeedback?.length || 0,
        fill: "#810CA8",
        id: 2,
      },
      {
        name: "Completed",
        value: completedFeedback?.length || 0,
        fill: "#03C988",
        id: 3,
      },
    ]);

    setFeedback({
      totalPendingFeedback: pendingFeedback?.length || 0,
      totalOutstandingFeedback: outstandingFeedback?.length || 0,
      totalCompletedFeedback: completedFeedback?.length || 0,
    });

    // console.log(feedbackData)

    setTimeout(() => {
      setIsReady(true);
    }, 500);
    setIsFeedbackReady(true);
  };

  const fetchLicenses = async () => {
    const { datetype, date } = pickerwithtype;
    const PARAMS = ["id"];

    const getDraftLicense = instance.get(
      `/api/license/draft/${plant}/${datetype}/${date}?expand=${PARAMS.join(
        ","
      )}`
    );
    const getAcquiredLicense = instance.get(
      `/api/license/acquired/${plant}/${datetype}/${date}?expand=${PARAMS.join(
        ","
      )}`
    );
    const getLicenseExpiredIn30 = instance.get(
      `/api/license/expired/${plant}/${datetype}/${date}/30?expand=${PARAMS.join(
        ","
      )}`
    );
    const getLicenseExpiredIn60 = instance.get(
      `/api/license/expired/${plant}/${datetype}/${date}/60?expand=${PARAMS.join(
        ","
      )}`
    );
    const getLicenseExpiredIn90 = instance.get(
      `/api/license/expired/${plant}/${datetype}/${date}/90?expand=${PARAMS.join(
        ","
      )}`
    );

    const getAllLicense = await Promise.all([
      getDraftLicense,
      getAcquiredLicense,
      getLicenseExpiredIn30,
      getLicenseExpiredIn60,
      getLicenseExpiredIn90,
    ]);

    const draftLicense = getAllLicense[0].data?.rows;
    const acquiredLicense = getAllLicense[1].data?.rows;
    const licenseExpiredIn30 = getAllLicense[2].data?.rows;
    const licenseExpiredIn60 = getAllLicense[3].data?.rows;
    const licenseExpiredIn90 = getAllLicense[4].data?.rows;
    // console.log(getAllLicense);

    if (expiredLicenseInDays == "expiry") {
      setLicenseData([
        {
          name: "Expired in 30 days",
          value: licenseExpiredIn30?.length || 0,
          fill: "#C74B50",
          id: 1,
        },
        {
          name: "Expired in 60 days",
          value: licenseExpiredIn60?.length || 0,
          fill: "#810CA8",
          id: 2,
        },
        {
          name: "Expired in 90 days",
          value: licenseExpiredIn90?.length || 0,
          fill: "#03C988",
          id: 3,
        },
      ]);
    } else {
      setLicenseData([
        {
          name: "Draft",
          value: draftLicense?.length || 0,
          fill: "#C74B50",
          id: 1,
        },
        {
          name: "Acquired",
          value: acquiredLicense?.length || 0,
          fill: "#810CA8",
          id: 2,
        },
      ]);
    }
    // console.log(licenseData);
    setLicense({
      totalDraftLicense: draftLicense?.length || 0,
      totalAcquiredLicense: acquiredLicense?.length || 0,
      totalLicenseExpiredIn30: licenseExpiredIn30?.length || 0,
      totalLicenseExpiredIn60: licenseExpiredIn60?.length || 0,
      totalLicenseExpiredIn90: licenseExpiredIn90?.length || 0,
    });

    setTimeout(() => {
      setIsReady(true);
    }, 500);
    setIsLicenseReady(true);
  };

  useEffect(() => {
      requestAccess ? fetchRequests() : null;
      checklistAccess ? fetchChecklists() : null;
      changeOfPartsAccess ? fetchCOPs() : null;
      feedbackAccess ? fetchFeedbacks() : null;
      licenseAccess ? fetchLicenses() : null;
  }, [field, plant, pickerwithtype]);

  useEffect(() => {
    const RequestAccess = data ? userPermission(PermissionsRoles.CanViewDashboardRequestTicket) : permissions.includes(PermissionsRoles.CanViewDashboardRequestTicket);
    const ChecklistAccess = data ? userPermission(PermissionsRoles.CanViewDashboardChecklist) : permissions.includes(PermissionsRoles.CanViewDashboardChecklist);
    const ChangeOfPartsAccess = data ? userPermission(PermissionsRoles.CanViewDashboardChangeOfParts) : permissions.includes(PermissionsRoles.CanViewDashboardChangeOfParts);
    const FeedbackAccess = data ? userPermission(PermissionsRoles.CanViewDashboardFeedback) : permissions.includes(PermissionsRoles.CanViewDashboardFeedback);
    const LicenseAccess = data ? userPermission(PermissionsRoles.CanViewDashboardLicense) : permissions.includes(PermissionsRoles.CanViewDashboardLicense);
    const AllPlantAccess = data ? userPermission(PermissionsRoles.CanAccessAllPlants) : permissions.includes(PermissionsRoles.CanAccessAllPlants);
    const ManageRequestAccess = data ? userPermission(PermissionsRoles.CanManageRequestTicket) : permissions.includes(PermissionsRoles.CanManageRequestTicket);
    const ManageChecklistAccess = data ? userPermission(PermissionsRoles.CanManageChecklist) : permissions.includes(PermissionsRoles.CanManageChecklist);

    setRequestAccess(RequestAccess);
    setChecklistAccess(ChecklistAccess);
    setChangeOfPartsAccess(ChangeOfPartsAccess);
    setFeedbackAccess(FeedbackAccess);
    setLicenseAccess(LicenseAccess);
    setAllPlantAccess(AllPlantAccess);
    setManageRequestAccess(ManageRequestAccess);
    setManageChecklistAccess(ManageChecklistAccess);

  }, [data])

  useEffect(() => {
    const { datetype, date } = pickerwithtype;
    const DashboardTotalAccess = data ? userPermission(PermissionsRoles.CanViewDashboardTotal) : permissions.includes(PermissionsRoles.CanViewDashboardTotal);
    if (!allPlantAccess) {
      // engineer, specialist
      getPlants("/api/getUserPlants").then((result) => {
        if (result) {
          setPlant(result[0].plant_id);
        }
      });

    } else {
      getPlants("/api/getPlants").then((result) => {
        if (result) {
          if(result.length < 4){
            setPlant(result[0].plant_id);
          }
          else{
            setPlant(0);
          }
        }
      });
      requestAccess ? fetchRequests() : null;
      checklistAccess ? fetchChecklists() : null;
      changeOfPartsAccess ? fetchCOPs() : null;
      feedbackAccess ? fetchFeedbacks() : null;
      licenseAccess ? fetchLicenses() : null;
    }
    // Permission for dashboard access:
    if (DashboardTotalAccess) {
      setShowTotalContainer(true);
    }
    
  }, [requestAccess, checklistAccess, changeOfPartsAccess, feedbackAccess, licenseAccess, allPlantAccess, 
    active, expiredLicenseInDays]);

  // useEffect(() => {
  //   console.log(licenseData);
  // }, [licenseData]);

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
  const totalLicense = licenseData?.reduce((accumulator, currentValue) => {
    // console.log(accumulator);
    return +accumulator + +currentValue.value;
  }, 0);

  if (!isReady) {
    return (
      <div
        style={{
          position: "absolute",
          top: "calc((100% - 8rem) / 2)",
          left: "50%",
          transform: "translate(-50%,-50%)",
        }}
      >
        <LoadingHourglass />
      </div>
    );
  }

  const { date, datetype } = pickerwithtype;

  const { totalPendingRequest, totalOutstandingRequest, totalClosedRequest, totalOverdueRequest } =
    request;
  const {
    totalPendingChecklist,
    totalOutstandingChecklist,
    totalClosedChecklist,
    totalOverdueChecklist,
  } = checklist;
  const { totalScheduledCOP, totalCompletedCOP } = cop;
  const {
    totalPendingFeedback,
    totalOutstandingFeedback,
    totalCompletedFeedback,
  } = feedback;
  const { 
    totalDraftLicense, 
    totalAcquiredLicense, 
    totalLicenseExpiredIn30, 
    totalLicenseExpiredIn60, 
    totalLicenseExpiredIn90 
  } = license;


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
        <PickerWithType
          type={pickerwithtype.datetype}
          onChange={handleDateChange}
        />

        {!allPlantAccess ? (
          <PlantSelect
            onChange={(e) => setPlant(parseInt(e.target.value))}
            accessControl
            default
          />
        ) : (
          <PlantSelect
            onChange={(e) => setPlant(parseInt(e.target.value))}
            allPlants
          />
        )}
      </ModuleHeader>
      <ModuleContent>
        <div className={styles.dashboardMain}>
          {requestAccess && manageRequestAccess && (<DashboardBox
            id="pending-requests-box"
            title="Pending Requests"
            style={{ gridArea: "a" }}
            onClick={handleDashboardClick}
            className={active === "pending-requests-box" ? styles.active : ""}
          >
            <p className={styles.dashboardPendingdNumber}>
              {totalPendingRequest}
            </p>
          </DashboardBox>)}
          {requestAccess && (<DashboardBox
            id="outstanding-requests-box"
            title="Outstanding Requests"
            style={{ gridArea: "b" }}
            onClick={handleDashboardClick}
            className={
              active === "outstanding-requests-box" ? styles.active : ""
            }
          >
            <p className={styles.dashboardOutstandingNumber}>
              {totalOutstandingRequest}
            </p>
          </DashboardBox>)}
          {requestAccess && (<DashboardBox
            id="closed-requests-box"
            title="Completed Requests"
            style={{ gridArea: "c" }}
            onClick={handleDashboardClick}
            className={active === "closed-requests-box" ? styles.active : ""}
          >
            <p className={styles.dashboardCompletedNumber}>
              {totalClosedRequest}
            </p>
          </DashboardBox>)}
          {requestAccess && (<DashboardBox
            id="overdue-requests-box"
            title="Overdue Requests"
            style={{ gridArea: "u" }}
            onClick={handleDashboardClick}
            className={active === "overdue-requests-box" ? styles.active : ""}
          >
            <p className={styles.dashboardOverdueNumber}>
              {totalOverdueRequest}
            </p>
          </DashboardBox>)}

          {showTotalContainer && requestAccess && (
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
              style={{ gridArea: "d" }}
            >
              {requestData && requestData.length > 0 ? (
                <PChart data={requestData} />
              ) : (
                <p className={styles.dashboardNoChart}>No requests</p>
              )}
            </DashboardBox>
          )}
          {checklistAccess && manageChecklistAccess && (<DashboardBox
            id="pending-checklists-box"
            title="Pending Checklists"
            style={{ gridArea: "e" }}
            onClick={handleDashboardClick}
            className={active === "pending-checklists-box" ? styles.active : ""}
          >
            <p className={styles.dashboardPendingdNumber}>
              {totalPendingChecklist}
            </p>
          </DashboardBox>)}
          {checklistAccess && (<DashboardBox
            id="outstanding-checklists-box"
            title="Outstanding Checklists"
            style={{ gridArea: "f" }}
            onClick={handleDashboardClick}
            className={
              active === "outstanding-checklists-box" ? styles.active : ""
            }
          >
            <p className={styles.dashboardOutstandingNumber}>
              {totalOutstandingChecklist}
            </p>
          </DashboardBox>)}
          {checklistAccess && (<DashboardBox
            id="completed-checklists-box"
            title="Completed Checklists"
            style={{ gridArea: "g" }}
            onClick={handleDashboardClick}
            className={
              active === "completed-checklists-box" ? styles.active : ""
            }
          >
            <p className={styles.dashboardCompletedNumber}>
              {totalClosedChecklist}
            </p>
          </DashboardBox>)}
          {checklistAccess && (<DashboardBox
            id="overdue-checklists-box"
            title="Overdue Checklists"
            style={{ gridArea: "v" }}
            onClick={handleDashboardClick}
            className={
              active === "overdue-checklists-box" ? styles.active : ""
            }
          >
            <p className={styles.dashboardOverdueNumber}>
              {totalOverdueChecklist}
            </p>
          </DashboardBox>)}
          {showTotalContainer && checklistAccess && (
            <DashboardBox
              title={"Total Checklists: " + totalChecklist}
              style={{ gridArea: "h" }}
            >
              {checklistData && checklistData.length > 0 ? (
                <PChart data={checklistData} />
              ) : (
                <p className={styles.dashboardNoChart}>No Checklists</p>
              )}
            </DashboardBox>
          )}
          {changeOfPartsAccess && (
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
          </DashboardBox>)}
          {changeOfPartsAccess && (
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
          </DashboardBox>)}
          {changeOfPartsAccess && (<DashboardBox
            id=""
            title=""
            style={{ gridArea: "k" }}
            onClick={handleDashboardClick}
          ></DashboardBox>)}
          {showTotalContainer && changeOfPartsAccess && (
            <DashboardBox
              title={"Total Change of Parts: " + totalCOP}
              style={{ gridArea: "l" }}
            >
              {copData && copData.length > 0 ? (
                <PChart data={copData} />
              ) : (
                <p className={styles.dashboardNoChart}>No change of parts</p>
              )}
            </DashboardBox>
          )}
          {feedbackAccess && (<DashboardBox
            id="pending-feedback-box"
            title="Pending Public Feedbacks"
            style={{ gridArea: "m" }}
            onClick={handleDashboardClick}
            className={active === "pending-feedback-box" ? styles.active : ""}
          >
            <p className={styles.dashboardPendingdNumber}>
              {totalPendingFeedback}
            </p>
          </DashboardBox>)
          }
          {feedbackAccess && (<DashboardBox
            id="outstanding-feedback-box"
            title="Outstanding Public Feedbacks"
            style={{ gridArea: "n" }}
            onClick={handleDashboardClick}
            className={
              active === "outstanding-feedback-box" ? styles.active : ""
            }
          >
            <p className={styles.dashboardOutstandingNumber}>
              {totalOutstandingFeedback}
            </p>
          </DashboardBox>
          )}
          {feedbackAccess && (<DashboardBox
            id="completed-feedback-box"
            title="Completed Public Feedbacks"
            style={{ gridArea: "o" }}
            onClick={handleDashboardClick}
            className={active === "completed-feedback-box" ? styles.active : ""}
          >
            <p className={styles.dashboardCompletedNumber}>
              {totalCompletedFeedback}
            </p>
          </DashboardBox>
          )}
          {showTotalContainer && feedbackAccess && (
            <DashboardBox
              title={"Total Public Feedbacks: " + totalFeedback}
              style={{ gridArea: "p" }}
            >
              {feedbackData && feedbackData.length > 0 ? (
                <PChart data={feedbackData} />
              ) : (
                // <PChart data={feedbackData!} />
                <p className={styles.dashboardNoChart}>No feedbacks</p>
              )}
            </DashboardBox>
          )}

          {licenseAccess && <DashboardBox
            id="30-expiry-license-box"
            title="Licenses Expiring in 30 Days"
            style={{ gridArea: "q" }}
            onClick={handleDashboardClick}
            className={active === "30-expiry-license-box" ? styles.active : ""}
          >
            <p className={styles.dashboardPendingdNumber}>
              {totalLicenseExpiredIn30}
            </p>
          </DashboardBox>
          }
          {licenseAccess && <DashboardBox
            id="60-expiry-license-box"
            title="Licenses Expiring in 60 Days"
            style={{ gridArea: "r" }}
            onClick={handleDashboardClick}
            className={active === "60-expiry-license-box" ? styles.active : ""}
          >
            <p className={styles.dashboardOutstandingNumber}>
              {totalLicenseExpiredIn60}
            </p>
          </DashboardBox>
          }
          {licenseAccess && <DashboardBox
            id="90-expiry-license-box"
            title="Licenses Expiring in 90 Days"
            style={{ gridArea: "s" }}
            onClick={handleDashboardClick}
            className={active === "90-expiry-license-box" ? styles.active : ""}
          >
            <p className={styles.dashboardCompletedNumber}>
              {totalLicenseExpiredIn90}
            </p>
          </DashboardBox>
          }
          {licenseAccess && showTotalContainer && (
            <DashboardBox
              title={"Total Licenses: " + totalLicense}
              style={{ gridArea: "t" }}
              filter={
                <select
                  className={`form-select ${styles.dashboardRequestButton}`}
                  onChange={(event) => {
                    setExpiredLicencesInDays(event.target.value);
                    // console.log(event.target.value);
                  }}
                >
                  {/* <option value="status">Status</option> */}
                  <option value="expiry">Expiry</option>
                </select>
              }
            >
              {/* <PChart data={licenseData ? licenseData! : []} /> */}

              {licenseData && licenseData.length > 0 ? (
                <PChart data={licenseData} />
              ) : (
                <p className={styles.dashboardNoChart}>No licenses</p>
              )}
            </DashboardBox>
          )}
          {changeOfPartsAccess && (<DashboardBox
            id=""
            title=""
            style={{ gridArea: "w" }}
            onClick={handleDashboardClick}
          ></DashboardBox>)}

          {feedbackAccess && (<DashboardBox
            id=""
            title=""
            style={{ gridArea: "x" }}
            onClick={handleDashboardClick}
          ></DashboardBox>)}

          {licenseAccess && (<DashboardBox
            id=""
            title=""
            style={{ gridArea: "y" }}
            onClick={handleDashboardClick}
          ></DashboardBox>)}
        </div>
        <ModuleModal 
          isOpen={displayModal} 
          closeModal={() => setDisplayModal(false)}  
          large
        >
          {showDiv === "pending-requests-box" && (
            <Request
              isReady={isRequestReady}
              filter={true}
              status={1}
              date={date}
              datetype={datetype}
              plant={plant as number}
              viewType="pending"
            />
          )}
          {showDiv === "outstanding-requests-box" && (
            <Request
              isReady={isRequestReady}
              filter={true}
              status={"2"}
              date={date}
              datetype={datetype}
              plant={plant as number}
              viewType="outstanding"
            />
          )}
          {showDiv === "closed-requests-box" && (
            <Request
              isReady={isRequestReady}
              filter={true}
              status={"3,4,5,6"}
              date={date}
              datetype={datetype}
              plant={plant as number}
              viewType="completed"
            />
          )}
          {showDiv === "overdue-requests-box" && (
            <Request
              isReady={isRequestReady}
              filter={true}
              date={date}
              datetype={datetype}
              plant={plant as number}
              viewType="overdue"
            />
          )}
          {showDiv === "pending-checklists-box" && (
            <Checklist
              isReady={isChecklistReady}
              filter={true}
              status={1}
              date={date}
              datetype={datetype}
              plant={plant as number}
              viewType="pending"
            />
          )}
          {showDiv === "outstanding-checklists-box" && (
            <Checklist
              isReady={isChecklistReady}
              filter={true}
              status={2}
              date={date}
              datetype={datetype}
              plant={plant as number}
              viewType="outstanding"
            />
          )}
          {showDiv === "completed-checklists-box" && (
            <Checklist
              isReady={isChecklistReady}
              filter={true}
              status={"3,4,5,6"}
              date={date}
              datetype={datetype}
              plant={plant as number}
              viewType="completed"
            />
          )}
          {showDiv === "overdue-checklists-box" && (
            <Checklist
              isReady={isChecklistReady}
              filter={true}
              date={date}
              datetype={datetype}
              plant={plant as number}
              viewType="overdue"
            />
          )}
          {showDiv === "scheduled-cop-box" && (
            <ChangeOfPartsPage
              changeOfParts={[]}
              activeCOPType={0}
              filter={true}
            />
          )}
          {showDiv === "completed-cop-box" && (
            <ChangeOfPartsPage
              changeOfParts={[]}
              activeCOPType={1}
              filter={true}
            />
          )}
          {showDiv === "pending-feedback-box" && (
            <Feedback filter={true} activeTabIndex={0} />
          )}
          {showDiv === "outstanding-feedback-box" && (
            <Feedback filter={true} activeTabIndex={1} />
          )}
          {showDiv === "completed-feedback-box" && (
            <Feedback filter={true} activeTabIndex={2} />
          )}
        </ModuleModal>
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
