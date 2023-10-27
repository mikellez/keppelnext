import {
  Body,
  Cell,
  Header,
  HeaderCell,
  HeaderRow,
  Row,
  Table,
} from "@table-library/react-table-library";
import { getTheme } from "@table-library/react-table-library/baseline";
import { useTheme } from "@table-library/react-table-library/theme";
import moment from "moment";
import { GetServerSidePropsContext } from "next";
import React, { FormEvent, useEffect, useState } from "react";
import { FiChevronsLeft, FiChevronsRight } from "react-icons/fi";
import { SlLock, SlLockOpen } from "react-icons/sl";
import instance from "../axios.config.js";
import {
  ModuleContent,
  ModuleHeader,
  ModuleMain
} from "../components";
import LoadingHourglass from "../components/LoadingHourglass";
import ModuleSimplePopup, {
  SimpleIcon,
} from "../components/ModuleLayout/ModuleSimplePopup";
import PageButton from "../components/PageButton";
import { useCurrentUser } from "../components/SWR";
import AssignToSelect from "../components/Schedule/AssignToSelect";
import styles from "../styles/Logbook.module.css";
import styles2 from "../styles/Request.module.scss";
import { CMMSPlant } from "../types/common/interfaces";
import LabelSelect from "../components/Logbook/LabelSelect";
import CellTooltip from "../components/CellTooltip";

export interface logbookData {
  [key: string]: string | number;
  id: string | number;
}

const Logbook = ({
  data,
  totalPages,
  plants,
}: {
  data: logbookData[];
  totalPages: number;
  plants: CMMSPlant[];
}) => {
  const [logbookData, setLogbookData] = useState(data);
  const [lock, setLock] = useState(false);
  const [label, setLabel] = useState<string>("");
  const [labelid, setLabelId] = useState<number>(0);
  const [customLabelDesc, setCustomLabelDesc] = useState<string>("");
  const [isCustomDesc, setIsCustomDesc] = useState<boolean>(false);
  const [entry, setEntry] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState<number>(plants[0].plant_id);
  const [isReady, setIsReady] = useState<boolean>(true);

  const [staff, setStaff] = useState<{
    first: null | number;
    second: null | number;
  }>({ first: null, second: null });

  const user = useCurrentUser();
  const { userPermission } = useCurrentUser();

  const theme = useTheme([
    getTheme(),
    {
      Table:
        "--data-table-library_grid-template-columns:  15em 10em calc(70% - 36em) calc(90% - 36em) 11em 11em;",
    },
  ]);

  const submitHandler = async (event: FormEvent) => {
    event.preventDefault();
    const entryValue = entry.trim();

    if (
      !entryValue ||
      !staff.first ||
      !staff.second ||
      staff.first === staff.second
    ) {
      return;
    }

    // console.log(labelValue, entryValue, staff);

    try {
      const result = await instance.post("/api/logbook", {
        label: label,
        entry: entryValue,
        staff,
        plant_id: activeTab,
        label_id: labelid,
        custom_description: customLabelDesc,
      });

      if (!lock) {
        setStaff({ first: null, second: null });
      }

      setLabel("");
      setEntry("");
      setCustomLabelDesc("");
      const getLogbook = async (pageNumber: number) => {
        const response = await instance.get(
          `/api/logbook/${activeTab}?page=${pageNumber}`
        );

        setLogbookData(response.data.rows);
      };

      getLogbook(page).then((res) => setIsReady(true));
    } catch (error) {
      setModal(true);
    }
  };

  useEffect(() => {
    if (localStorage.getItem("staff")) {
      const storedStaff = JSON.parse(localStorage.getItem("staff") as string);
      setStaff(storedStaff);
      setLock(true);
    } else {
      setLoading(false);
    }
    // console.log(plants);
  }, []);

  useEffect(() => {
    if (staff.first && staff.second) {
      setLoading(false);
    }
  }, [staff]);

  useEffect(() => {
    if (!isReady) {
      const getLogbook = async (pageNumber: number) => {
        const response = await instance.get(
          `/api/logbook/${activeTab}?page=${pageNumber}`
        );

        setLogbookData(response.data.rows);
      };

      getLogbook(page).then((res) => setIsReady(true));
    }
  }, [page, activeTab]);

  const switchTab = (tab: number) => {
    if (isReady) {
      setIsReady(false);
      setActiveTab(tab);
      setPage(1);
    }
  };

  const onLockHandler = () => {
    localStorage.setItem("staff", JSON.stringify(staff));
    setLock(true);
  };

  const onUnlockHandler = () => {
    localStorage.removeItem("staff");
    setLock(false);
  };

  if (loading) {
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

  return (
    <ModuleMain>
      <ModuleHeader title="E-Logbook" header="E-Logbook"></ModuleHeader>
      <ModuleContent>
        <ul className="nav nav-tabs">
          {plants.map((plant) => {
            return (
              <li
                key={plant.plant_id}
                className={`nav-link ${
                  activeTab == plant.plant_id ? "active" : ""
                }`}
                onClick={() =>
                  activeTab != plant.plant_id && switchTab(plant.plant_id)
                }
              >
                {plant.plant_name}
              </li>
            );
          })}
        </ul>
        <div className="p-5" style={{ border: "solid #e9ecef 1px" }}>
          <form className={styles.logbookForm} onSubmit={submitHandler}>
            <div className={styles.addEntryInputs}>
              {/* <input type="text" value={formatDate(new Date().toString())} disabled name="date" /> */}
              <LabelSelect
                onChange={(option: any) => {
                  setLabelId(option.value.label_id);
                  setLabel(option.value.label_name);
                  setIsCustomDesc(option.value.allow_custom);
                }}
                style={{
                  width: "20rem",
                  zIndex: 10,
                  marginRight: "0.5rem",
                  marginLeft: "0",
                }}
                disabled={lock}
              />
              <AssignToSelect
                onChange={(option: any) => {
                  setStaff((prevState) => {
                    return { ...prevState, first: option!.value };
                  });
                }}
                plantId={user.data?.allocated_plants}
                isSingle
                style={{
                  width: "20rem",
                  zIndex: 10,
                  marginRight: "0.5rem",
                  marginLeft: "0.5rem",
                }}
                defaultIds={staff.first ? [staff.first] : undefined}
                disabled={lock}
                value={staff.first}
              />
              <AssignToSelect
                onChange={(option: any) => {
                  setStaff((prevState) => {
                    return { ...prevState, second: option!.value };
                  });
                }}
                plantId={user.data?.allocated_plants}
                isSingle
                style={{
                  width: "20rem",
                  zIndex: 10,
                  marginRight: "1rem",
                  marginLeft: "0.5rem",
                }}
                defaultIds={staff.second ? [staff.second] : undefined}
                disabled={lock}
                value={staff.second}
              />

              {!lock && (
                <SlLockOpen
                  size={25}
                  style={{ cursor: "pointer", marginBottom: "0.1rem" }}
                  onClick={
                    staff.first && staff.second && staff.first !== staff.second
                      ? onLockHandler
                      : () => setModal(true)
                  }
                />
              )}
              {lock && (
                <SlLock
                  size={25}
                  style={{ cursor: "pointer", marginBottom: "0.1rem" }}
                  onClick={onUnlockHandler}
                  color="#c21010"
                />
              )}
            </div>
            <div className={styles.entryDiv}>
              {isCustomDesc && (<textarea
                cols={10}
                rows={2}
                placeholder="Label Description"
                name="customLabelDesc"
                value={customLabelDesc}
                onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setCustomLabelDesc(event.target.value)
                }
                className="form-control"
                style={{ resize: "none", overflow: "auto", width: "100%" }}
              />)}
              <textarea
                cols={20}
                rows={5}
                placeholder="Entry Details"
                name="entry"
                value={entry}
                onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setEntry(event.target.value)
                }
                className="form-control"
                style={{ resize: "none", overflow: "auto", width: "100%" }}
              />
            </div>
            { userPermission('canCreateLogbookEntry') && <div className="d-flex justify-content-end">
              <button type="submit" className="ms-auto btn btn-primary">
                Log Entry
              </button>
            </div> }
          </form>

          <ModuleSimplePopup
            modalOpenState={modal}
            setModalOpenState={setModal}
            text="Both staff must be selected and must be different from each other in
            order to lock!"
            title="Lock Error"
            icon={SimpleIcon.Exclaim}
            shouldCloseOnOverlayClick={true}
          ></ModuleSimplePopup>
          {!loading && (
            <Table
              data={{ nodes: logbookData }}
              theme={theme}
              layout={{ custom: true }}
            >
              {(logbookData: logbookData[]) => (
                <>
                  <Header>
                    <HeaderRow>
                      <HeaderCell resize>Time</HeaderCell>
                      <HeaderCell resize>Label</HeaderCell>
                      <HeaderCell resize>Label Description</HeaderCell>
                      <HeaderCell resize>Entry</HeaderCell>
                      <HeaderCell resize>Duty Staff 1</HeaderCell>
                      <HeaderCell resize>Duty Staff 2</HeaderCell>
                    </HeaderRow>
                  </Header>

                  <Body>
                    {logbookData.map((row, index) => {
                      return (
                        <Row key={index} item={{ id: row.logbook_id }}>
                          <Cell>
                            {moment(new Date(row.date)).format(
                              "MMMM Do YYYY, h:mm:ss a"
                            )}
                          </Cell>
                          <Cell>
                            <CellTooltip CellContents={row.name}/>
                            </Cell>
                          <Cell>
                            <CellTooltip CellContents={row.custom_description? row.custom_description : row.description}/>
                            </Cell>
                          <Cell>
                            <CellTooltip CellContents={row.entry}/>
                          </Cell>
                          <Cell>
                            <CellTooltip CellContents={row.staff1}/>
                            </Cell>
                          <Cell>
                            <CellTooltip CellContents={row.staff2}/>
                            </Cell>
                        </Row>
                      );
                    })}
                  </Body>
                </>
              )}
            </Table>
          )}
          <div className={styles2.requestPagination}>
            <FiChevronsLeft
              size={25}
              className={`${styles2.paginationChevron} ${
                page - 1 > 0 ? styles2.active : styles2.disabled
              }`}
              onClick={() => setPage(1)}
            />
            <span>
              {page - 1 > 0 && (
                <PageButton setPage={setPage}>{page - 1}</PageButton>
              )}
              <PageButton active setPage={setPage}>
                {page}
              </PageButton>
              {page + 1 <= totalPages && (
                <PageButton setPage={setPage}>{page + 1}</PageButton>
              )}
            </span>
            <FiChevronsRight
              size={25}
              className={`${styles2.paginationChevron} ${
                page < totalPages ? styles2.active : styles2.disabled
              }`}
              onClick={() => setPage(totalPages)}
            />
          </div>
        </div>
      </ModuleContent>
    </ModuleMain>
  );
};

export default Logbook;

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const headers = {
    withCredentials: true,
    headers: {
      Cookie: context.req.headers.cookie,
    },
  };

  const plants = await instance.get(`api/getPlants`, headers);
  const response = await instance.get(
    `/api/logbook/${plants.data[0].plant_id}?page=1`,
    headers
  );

  return {
    props: {
      data: response.data.rows,
      totalPages: response.data.total,
      plants: plants.data,
    },
  };
};
