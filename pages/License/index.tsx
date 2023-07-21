import React, { useEffect, useState } from "react";
import instance from "../../types/common/axios.config";
import { useRouter } from "next/router";
import Link from "next/link";
import TooltipBtn from "../../components/TooltipBtn";
import { BsFileEarmarkPlus } from "react-icons/bs";
import {
  Table,
  Header,
  HeaderRow,
  HeaderCell,
  Body,
  Row,
  Cell,
  OnClick,
} from "@table-library/react-table-library";
import { MdPostAdd } from "react-icons/md";
import {
  ModuleContent,
  ModuleHeader,
  ModuleMain,
  ModuleModal,
} from "../../components";
import { useTheme } from "@table-library/react-table-library/theme";
import { getTheme } from "@table-library/react-table-library/baseline";
import { useCurrentUser } from "../../components/SWR";
import { CMMSFeedback, CMMSLicense } from "../../types/common/interfaces";
import { getColor } from "../Request";
import moment from "moment";
import {
  AiOutlineFileDone,
  AiOutlineFolderView,
  AiOutlineHistory,
  AiOutlineUserAdd,
} from "react-icons/ai";
import { Role } from "../../types/common/enums";
import Pagination from "../../components/Pagination";
import LoadingHourglass from "../../components/LoadingHourglass";
import PlantSelect from "../../components/PlantSelect";
import ChecklistHistory from "../../components/Checklist/ChecklistHistory";
import LicenseHistory from "../../components/License/LicenseHistory";

const indexedColumn: ("draft" | "acquired")[] = ["draft", "acquired"];

const License = () => {
  const [licenseItems, setLicenseItems] = useState<CMMSFeedback[]>([]);
  const [isReady, setReady] = useState(false);
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const user = useCurrentUser();
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedPlant, setSelectedPlant] = useState<number>(0);
  const [history, setHistory] = useState<
    { [key: string]: string }[] | undefined
  >(undefined);

  const theme = useTheme([
    getTheme(),
    {
      Table:
        "--data-table-library_grid-template-columns: 3em 6em 8em 8em 10em 8em 9em 8em 8em 7em 5em;",
    },
  ]);

  const switchColumns = (index: number) => {
    if (isReady) {
      setReady(false);
      setActiveTabIndex(index);
      // setPage(1);
    }
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
    console.log(selectedPlant);
    setReady(false);

    const PARAMS = [
      "id",
      "license_name",
      "status",
      "license_provider",
      "license_type",
      "license_details",
      "expiry_date",
      "linked_asset",
      "plant_loc_id",
      "plant_name",
      "linked_asset_name",
      "acquisition_date",
      "activity_log",
    ];

    instance
      .get(
        `/api/license/${indexedColumn[activeTabIndex]}?page=${page}&expand=${PARAMS}&plantId=${selectedPlant}`
      )
      .then((response) => {
        setLicenseItems(
          response.data.rows.map((row: CMMSLicense) => {
            return {
              ...row,
            };
          })
        );
        setTotalPages(response.data.total);
        setReady(true);
      })
      .catch((e) => {
        setReady(true);
        setLicenseItems([]);
      });
  }, [selectedPlant, activeTabIndex, page]);

  useEffect(() => {
    console.log(licenseItems);
  }, [licenseItems]);

  return (
    <ModuleMain>
      <ModuleHeader title="License" header="License">
        <PlantSelect onChange={changePlant} allPlants={true} />
        <Link href="/License/New">
          <TooltipBtn text="New License">
            <MdPostAdd size={20} />
          </TooltipBtn>
        </Link>
      </ModuleHeader>
      <ModuleContent>
        {
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
          </ul>
        }
        {isReady && licenseItems.length === 0 && <div></div>}
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
                      <HeaderCell resize>Plant Location</HeaderCell>
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
                          <Cell>{item.linked_asset_name}</Cell>
                          <Cell>{item.plant_name}</Cell>
                          <Cell>{item.license_name}</Cell>
                          <Cell>{item.license_provider}</Cell>
                          <Cell>{item.license_type}</Cell>
                          <Cell>
                            {item.acquisition_date
                              ? moment(new Date(item.acquisition_date)).format(
                                  "MMMM Do YYYY, h:mm:ss a"
                                )
                              : null}
                          </Cell>
                          <Cell>
                            {item.expiry_date
                              ? moment(new Date(item.expiry_date)).format(
                                  "MMMM Do YYYY, h:mm:ss a"
                                )
                              : null}
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
                            {item.status_id === 2 || item.status_id === 3 ? (
                              <>
                                <Link href={`/License/Acquire/${item.id}`}>
                                  <AiOutlineFileDone size={22} title={"A"} />
                                </Link>
                              </>
                            ) : (user.data!.role_id === Role.Admin ||
                                user.data!.role_id === Role.Manager ||
                                user.data!.role_id === Role.Engineer) &&
                              item.status_id === 1 ? (
                              <Link href={`/Feedback/Assign/${item.id}`}>
                                <AiOutlineUserAdd size={22} title={"Assign"} />
                              </Link>
                            ) : (
                              <Link href={`/Feedback/View/${item.id}`}>
                                <AiOutlineFolderView size={22} title={"View"} />
                              </Link>
                            )}
                            <AiOutlineHistory
                              color={"#C70F2B"}
                              // onClick={() => setHistory(item.activity_log)}
                              onClick={() => setHistory([{ testing: "value" }])}
                              size={22}
                              title={"View History"}
                            />
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
          >
            <LicenseHistory history={history} />
          </ModuleModal>
        )}
      </ModuleContent>
    </ModuleMain>
  );
};

export default License;
