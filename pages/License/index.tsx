/** 
  EXPLANATION OF LICENSE MODULE

  This module serves to track the status of licenses which are tagged to a single asset.
  We track the status by allowing users to update the acquisition and expiry dates of a license.
  Email reminders are sent every 90/60/30 days before the expiry date to request for
  the renewal of a license.

  Major Components to take note of in this index page

  - License Table is made using the react-table-library found within this file itself
  - LicenseHistory which is a modal that displays the previous actions 
  that were executed on a given license. This component can be found on
  /components/License/LicenseHistory
  - LicenseCalendar is the alternative view that will show up (replacing the License Table)
  when toggled (beside the header). The calendar displays the expiry date of the licenses.
  The LicenseCalendar is made using the @fullcalendar/react library and can be found on 
  /components/License/LicenseCalendar
 */

import {
  Body,
  Cell,
  Header,
  HeaderCell,
  HeaderRow,
  Row,
  Table
} from "@table-library/react-table-library";
import { getTheme } from "@table-library/react-table-library/baseline";
import { useTheme } from "@table-library/react-table-library/theme";
import moment from "moment";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import {
  AiOutlineEdit,
  AiOutlineFileDone,
  AiOutlineFolderView,
  AiOutlineHistory,
} from "react-icons/ai";
import { BsCalendar4Week, BsListUl } from "react-icons/bs";
import { MdPostAdd } from "react-icons/md";
import {
  ModuleContent,
  ModuleHeader,
  ModuleMain,
  ModuleModal,
} from "../../components";
import { useCurrentUser, useLicense, useLicenseFilter } from "../../components/SWR";
import TooltipBtn from "../../components/TooltipBtn";
import { CMMSLicense } from "../../types/common/interfaces";
import { getColor } from "../Request";

import LicenseCalendar from "../../components/License/LicenseCalendar";
import LicenseHistory from "../../components/License/LicenseHistory";
import LoadingHourglass from "../../components/LoadingHourglass";
import Pagination from "../../components/Pagination";
import PlantSelect from "../../components/PlantSelect";
import scheduleStyles from "../../styles/Schedule.module.scss";
import { Role } from "../../types/common/enums";

import { BiRefresh } from "react-icons/bi";
import CellTooltip from "../../components/CellTooltip";

export interface LicenseProps {
  filter?: boolean;
  viewType?: string;
  plant: number;
  date: string;
  datetype: string;
  isReady?: boolean;
}

const indexedColumn: ("draft" | "acquired" | "expired" | "archived")[] = [
  "draft",
  "acquired",
  "expired",
  "archived",
];

const License = (props: LicenseProps) => {
  const [licenseItems, setLicenseItems] = useState<CMMSLicense[]>([]);
  const [isReady, setReady] = useState<boolean>(false);
  const [calendarView, setCalendarView] = useState<boolean>(false);
  const [activeTabIndex, setActiveTabIndex] = useState<number>(0);
  const user = useCurrentUser();
  const { userPermission } = useCurrentUser();
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [selectedPlant, setSelectedPlant] = useState<number>(0);
  const [history, setHistory] = useState<
    { [key: string]: string }[] | undefined
  >(undefined);

  const PARAMS = [
    "id",
    "license_name",
    "status",
    "status_id",
    "license_provider",
    "license_type",
    "license_details",
    "expiry_date",
    "linked_asset",
    "plant_name",
    "linked_asset_name",
    "acquisition_date",
    "activity_log",
  ];

  const filteredLicense = useLicenseFilter(props, page, PARAMS);
  let columnData = useLicense(
    indexedColumn[activeTabIndex],
    page,
    PARAMS,
    selectedPlant
  );

  const { data, error, isValidating, mutate } = props.filter
  ? filteredLicense
  : columnData;

  const theme = useTheme([
    getTheme(),
    {
      Table:
        "--data-table-library_grid-template-columns: 3em 6em 8em 8em 10em 8em 9em 8em 8em 7em 8em;",
    },
  ]);

  const switchColumns = (index: number) => {
      setReady(false);
      setActiveTabIndex(index);
      setLicenseItems([]);
      setPage(1);
  };

  const changePlant = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedPlant(+e.target.value);
  };

  const handleDaysToExpire = (acq: Date, exp: Date) => {
    const diff = exp.getTime() - acq.getTime();

    const totalDays = Math.ceil(diff / (1000 * 3600 * 24));
    return totalDays;
  };

  useEffect(() => {
    if (data && !isValidating) {
      if (data?.rows?.length > 0) {
        setLicenseItems(
          data.rows.map((row: CMMSLicense) => {
            return {
              ...row,
            };
          })
        );
        setReady(true);
        setTotalPages(data.total);
      }
    }
    if (data?.rows.length === 0) {
      setLicenseItems([]);
      setReady(true);
      setTotalPages(1);
    }
  }, [
    data, 
    isValidating, 
    isReady, 
    page,
  ]);


  // useEffect(() => {
  //   console.log(licenseItems);
  // }, [licenseItems]);

  const access = user.data?.role_id == Role.Admin || user.data?.role_id == Role.Engineer || user.data?.role_id == Role.Manager;

  return (
    <ModuleMain>
      <ModuleHeader
        title="License"
        header={calendarView ? "Monitor License Expiry" : "License"}
        leftChildren={ !props.filter &&
          <div className={`${scheduleStyles.eventModalHeader} mt-2`}>
            <label className={scheduleStyles.toggle}>
              <input
                type="checkbox"
                onChange={() => setCalendarView((prev) => !prev)}
              />
              <span
                title={
                  calendarView ? "See License List" : "Monitor License Expiry"
                }
                className={scheduleStyles.slider}
              ></span>
            </label>
            <div id="top-toggle-img" className="ms-3">
              {calendarView ? (
                <BsCalendar4Week size={20} />
              ) : (
                <BsListUl size={20} />
              )}
            </div>
          </div>
        }
      >
        {!props?.filter && <PlantSelect onChange={changePlant} allPlants={true} />}
        { userPermission('canCreateLicense') &&<Link href="/License/New">
          <TooltipBtn text="New License">
            <MdPostAdd size={20} />
          </TooltipBtn>
        </Link>
        }
      </ModuleHeader>
      {calendarView ? (
        <LicenseCalendar selectedPlant={selectedPlant} />
      ) : ( 
        <ModuleContent>
          { !props.filter && (
            <ul className="nav nav-tabs">
              <li
                onClick={() => {
                  activeTabIndex !== 0 && switchColumns(0);
                }}
                className={"nav-link" + (activeTabIndex === 0 ? " active" : "")}
              >
                <span style={{ all: "unset" }}>Drafts</span>
              </li>
              <li
                onClick={() => {
                  activeTabIndex !== 1 && switchColumns(1);
                }}
                className={"nav-link" + (activeTabIndex === 1 ? " active" : "")}
              >
                <span style={{ all: "unset" }}>Acquired</span>
              </li>
              <li
                onClick={() => {
                  activeTabIndex !== 2 && switchColumns(2);
                }}
                className={"nav-link" + (activeTabIndex === 2 ? " active" : "")}
              >
                <span style={{ all: "unset" }}>Expired</span>
              </li>
              <li
                onClick={() => {
                  activeTabIndex !== 3 && switchColumns(3);
                }}
                className={"nav-link" + (activeTabIndex === 3 ? " active" : "")}
              >
                <span style={{ all: "unset" }}>Archived</span>
              </li>
            </ul>
          )}
          {isReady && licenseItems.length === 0 && <div>No Licenses</div>}
          {isReady ? (
            <>
              <Table
                data={{ nodes: licenseItems }}
                theme={theme}
                layout={{ custom: true, horizontalScroll: true }}
              >
                {(tableList: CMMSLicense[]) => (
                  <>
                    <Header>
                      <HeaderRow>
                        <HeaderCell resize>ID</HeaderCell>
                        <HeaderCell resize>Asset</HeaderCell>
                        <HeaderCell resize>Plant Name</HeaderCell>
                        <HeaderCell resize>License</HeaderCell>
                        <HeaderCell resize>License Provider</HeaderCell>
                        <HeaderCell resize>License Type</HeaderCell>
                        <HeaderCell resize>Aquisition Date</HeaderCell>
                        <HeaderCell resize>Expiry Date</HeaderCell>
                        <HeaderCell resize>Days To Expiry</HeaderCell>
                        <HeaderCell resize>Status</HeaderCell>
                        <HeaderCell resize>Actions</HeaderCell>
                      </HeaderRow>
                    </Header>

                    <Body>
                      {tableList.map((item) => {
                        // console.log(item);
                        return (
                          <Row key={item.id} item={item}>
                            <Cell>{item.id}</Cell>
                            <Cell>
                              <CellTooltip CellContents={item.linked_asset_name}/>
                            </Cell>
                            <Cell>
                              <CellTooltip CellContents={item.plant_name}/>
                            </Cell>
                            <Cell>
                              <CellTooltip CellContents={item.license_name}/>
                            </Cell>
                            <Cell>
                              <CellTooltip CellContents={item.license_provider}/>
                            </Cell>
                            <Cell>
                              <CellTooltip CellContents={item.license_type}/>
                            </Cell>
                            <Cell>
                              <CellTooltip CellContents={item.acquisition_date
                                      ? moment(
                                          new Date(item.acquisition_date)
                                        ).format("MMMM Do YYYY, h:mm:ss a")
                                      : null}/>
                            </Cell>
                            <Cell>
                              <CellTooltip CellContents={item.expiry_date
                                      ? moment(
                                          new Date(item.expiry_date)
                                        ).format("MMMM Do YYYY, h:mm:ss a")
                                      : null}/>
                            </Cell>
                            <Cell>
                              {item.acquisition_date && item.expiry_date
                                ? handleDaysToExpire(
                                    new Date(item.acquisition_date),
                                    new Date(item.expiry_date)
                                  ) + " days"
                                : null}{" "}
                            </Cell>
                            <Cell>
                              <span
                                style={{
                                  color: getColor(item.status),
                                  fontWeight: "bold",
                                }}
                              >
                                {item.status}
                              </span>
                            </Cell>
                            <Cell>
                              { userPermission('canAcquireLicense') && item.status_id === 2 && (
                                <>
                                  <Link href={`/License/Acquire/${item.id}`}>
                                    <AiOutlineFileDone
                                      size={22}
                                      title={"Acquire"}
                                    />
                                  </Link>
                                </>
                              )}
                              {/* //  user.data!.role_id === Role.Admin ||
                                //     user.data!.role_id === Role.Manager ||
                                //     user.data!.role_id === Role.Engineer) &&
                                //   item.status_id === 1 ? (
                                //   <Link href={`/Feedback/Assign/${item.id}`}>
                                //     <AiOutlineUserAdd size={22} title={"Assign"} />
                                //   </Link>
                                //  */}
                              { userPermission('canRenewLicense') && item.status_id === 3 && (
                                <Link href={`/License/Renew/${item.id}`}>
                                  <BiRefresh size={22} title={"Renew"} />
                                </Link>
                              )}
                              { userPermission('canEditLicense') &&
                                <Link href={`/License/Edit/${item.id}`}>
                                  <AiOutlineEdit size={22} title={"Edit"} />
                                </Link>
                              }
                              <Link href={`/License/View/${item.id}`}>
                                <AiOutlineFolderView size={22} title={"View"} />
                              </Link>
                              { userPermission('canViewLicenseHistory') && <AiOutlineHistory
                                color={"#C70F2B"}
                                onClick={() => setHistory(item.activity_log)}
                                size={22}
                                title={"View History"}
                              />
                              }
                            </Cell>
                          </Row>
                        );
                      })}
                    </Body>
                  </>
                )}
              </Table>

              <Pagination
                setPage={setPage}
                setReady={setReady}
                totalPages={totalPages}
                page={page}
              />
            </>
          ) : (
            <div
              style={{
                position: "absolute",
                top: "100%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                textAlign: "center",
              }}
            >
              <LoadingHourglass />
            </div>
          )}
          {history && (
            <ModuleModal
              isOpen={!!history}
              closeModal={() => setHistory(undefined)}
              closeOnOverlayClick={true}
              large
            >
              <LicenseHistory history={history} />
            </ModuleModal>
          )}
        </ModuleContent>
      )}
    </ModuleMain>
  );
};

export default License;
