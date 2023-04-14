import React, { useState, FormEvent, useEffect } from "react";
import Layout from "../components/Layout";
import {
  ModuleContent,
  ModuleHeader,
  ModuleMain,
  ModuleModal,
} from "../components";
import {
  Body,
  Header,
  HeaderCell,
  HeaderRow,
  Row,
  Table,
  Cell,
} from "@table-library/react-table-library";
import { getTheme } from "@table-library/react-table-library/baseline";
import { useTheme } from "@table-library/react-table-library/theme";
import axios from "axios";
import { GetServerSidePropsContext } from "next";
import styles from "../styles/Logbook.module.css";
import { SlLock, SlLockOpen } from "react-icons/sl";
import AssignToSelect from "../components/Schedule/AssignToSelect";
import LoadingHourglass from "../components/LoadingHourglass";
import ModuleSimplePopup, {
  SimpleIcon,
} from "../components/ModuleLayout/ModuleSimplePopup";
import { usePagination } from "@table-library/react-table-library/pagination";
import PageButton from "../components/PageButton";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import styles2 from "../styles/Request.module.scss";

export interface logbookData {
  [key: string]: string | number;
  id: string | number;
}

const formatDate = (oldDate: string) => {
  let strArray = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const date = new Date(oldDate);
  let y = date.getFullYear();
  let d = date.getDate();
  let m = strArray[date.getMonth()];

  let hr = date.getHours();
  let min: number | string = date.getMinutes();
  if (min < 10) {
    min = "0" + min.toString();
  }

  return `${d} ${m} ${y}, ${hr}:${min}`;
};

const Logbook = ({ data }: { data: logbookData[] }) => {
  const [logbookData, setLogbookData] = useState(data);
  const [lock, setLock] = useState(false);
  const [label, setLabel] = useState<string>("");
  const [entry, setEntry] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);

  const [staff, setStaff] = useState<{
    first: null | number;
    second: null | number;
  }>({ first: null, second: null });

  const pageData = { nodes: logbookData };

  const pagination = usePagination(pageData, {
    state: {
      page: 0,
      size: 10,
    },
  });
  const totalPages = pagination.state.getTotalPages(pageData.nodes);

  const theme = useTheme([
    getTheme(),
    {
      Table:
        "--data-table-library_grid-template-columns:  12em 10em calc(90% - 36em) 11em 11em;",
    },
  ]);

  const submitHandler = async (event: FormEvent) => {
    event.preventDefault();
    const labelValue = label.trim();
    const entryValue = entry.trim();

    if (
      !labelValue ||
      !entryValue ||
      !staff.first ||
      !staff.second ||
      staff.first === staff.second
    ) {
      return;
    }

    console.log(labelValue, entryValue, staff);

    try {
      const result = await axios.post("/api/logbook", {
        label: labelValue,
        entry: entryValue,
        staff,
      });

      if (!lock) {
        setStaff({ first: null, second: null });
      }

      setLabel("");
      setEntry("");
      setLogbookData((prevState) => [result.data, ...prevState]);
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
  }, []);

  useEffect(() => {
    if (staff.first && staff.second) {
      setLoading(false);
    }
  }, [staff]);

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
        <form className={styles.logbookForm} onSubmit={submitHandler}>
          <div className={styles.addEntryInputs}>
            {/* <input type="text" value={formatDate(new Date().toString())} disabled name="date" /> */}
            <input
              type="text"
              placeholder="Label"
              name="label"
              value={label}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                setLabel(event.target.value)
              }
              className="form-control"
              style={{ marginLeft: 0 }}
            />
            <AssignToSelect
              onChange={(option: any) => {
                setStaff((prevState) => {
                  return { ...prevState, first: option!.value };
                });
              }}
              plantId={0}
              isSingle
              style={{
                width: "25rem",
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
              plantId={0}
              isSingle
              style={{
                width: "25rem",
                zIndex: 10,
                marginRight: "0.5rem",
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
            <textarea
              cols={30}
              rows={5}
              placeholder="Entry Details"
              name="entry"
              value={entry}
              onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) =>
                setEntry(event.target.value)
              }
              className="form-control"
            />
          </div>
          <button type="submit" className="btn btn-primary">
            Log Entry
          </button>
        </form>
        <ModuleSimplePopup
          modalOpenState={modal}
          setModalOpenState={setModal}
          text="Both staff must be selected and must be different from each other in
            order to lock!"
          title="Lock Error"
          icon={SimpleIcon.Exclaim}
        ></ModuleSimplePopup>
        {!loading && (
          <Table
            data={{ nodes: logbookData }}
            theme={theme}
            layout={{ custom: true }}
            pagination={pagination}
          >
            {(logbookData: logbookData[]) => (
              <>
                <Header>
                  <HeaderRow>
                    <HeaderCell resize>Time</HeaderCell>
                    <HeaderCell resize>Label</HeaderCell>
                    <HeaderCell resize>Entry</HeaderCell>
                    <HeaderCell resize>Duty Staff 1</HeaderCell>
                    <HeaderCell resize>Duty Staff 2</HeaderCell>
                  </HeaderRow>
                </Header>

                <Body>
                  {logbookData.map((row) => {
                    return (
                      <Row key={row.logbook_id} item={{ id: row.logbook_id }}>
                        <Cell>{formatDate(row.date as string)}</Cell>
                        <Cell>{row.label}</Cell>
                        <Cell>{row.entry}</Cell>
                        <Cell>{row.staff1}</Cell>
                        <Cell>{row.staff2}</Cell>
                      </Row>
                    );
                  })}
                </Body>
              </>
            )}
          </Table>
        )}
        <div className={styles2.requestPagination}>
          <FaChevronLeft
            size={15}
            className={`${styles2.paginationChevron} ${
              pagination.state.page - 1 >= 0 ? styles2.active : styles2.disabled
            }`}
            onClick={() =>
              pagination.state.page - 1 >= 0
                ? pagination.fns.onSetPage(pagination.state.page - 1)
                : ""
            }
          />
          <span>
            {pagination.state.page >= 2 && (
              <span>
                <PageButton pagination={pagination}>1</PageButton>
                {pagination.state.page - 1 >= 2 && <span>...</span>}
              </span>
            )}
            {pagination.state
              .getPages(pageData.nodes)
              .map((data: any, index: number) => {
                if (
                  index === pagination.state.page + 1 ||
                  index === pagination.state.page ||
                  index === Math.abs(pagination.state.page - 1)
                ) {
                  return (
                    <PageButton key={index} pagination={pagination}>
                      {index + 1}
                    </PageButton>
                  );
                }
              })}
            {pagination.state.page <= totalPages - 3 && (
              <span>
                {totalPages - pagination.state.page >= 4 && <span>...</span>}
                <PageButton pagination={pagination}>{totalPages}</PageButton>
              </span>
            )}
          </span>
          <FaChevronRight
            size={15}
            className={`${styles2.paginationChevron} ${
              pagination.state.page + 1 <= totalPages - 1
                ? styles2.active
                : styles2.disabled
            }`}
            onClick={() =>
              pagination.state.page + 1 <= totalPages - 1
                ? pagination.fns.onSetPage(pagination.state.page + 1)
                : ""
            }
          />
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

  const response1 = await axios.get(
    "http://localhost:3001/api/logbook",
    headers
  );

  // const response2 = await axios.get();
  return { props: { data: response1.data } };
};
