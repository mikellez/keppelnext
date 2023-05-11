import { CompactTable } from "@table-library/react-table-library/compact";

import { useTheme } from "@table-library/react-table-library/theme";
import { getTheme } from "@table-library/react-table-library/baseline";
import Link from "next/link";
import React, { MouseEvent, useEffect, useState } from "react";
import { ModuleMain, ModuleHeader, ModuleContent } from "../../components";
import { Nullish } from "@table-library/react-table-library/types/common";
import useSWR from "swr";
import instance from '../../axios.config.js';
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

import { BsTrashFill, BsPencilSquare, BsFileEarmarkPlus } from "react-icons/bs";
import ModuleSimplePopup from "../../components/ModuleLayout/ModuleSimplePopup";
import LoadingIcon from "../../components/LoadingIcon";
import TooltipBtn from "../../components/TooltipBtn";
import { FiRefreshCw } from "react-icons/fi";
import info from "../../public/master.json";
console.log(info);

/*
	CMMSMaster: {
		idName: "plant_id"
		data: CMMSMasterData[] [
			{
				"plant_id": "1"
				"plant_name": "Changi DHCS"
				"plant_description": "Description"
			},
			{
				"plant_id": "2"
				"plant_name": "Woodlands DHCS"
				"plant_description": "Description"
			}
		]
	}
*/

interface CMMSMaster {
  idName: string;
  data: CMMSMasterData[];
}

interface CMMSMasterData {
  id: string;
  [column_name: string]: string;
}

const indexedColumn: string[] = Object.keys(info)

function useMaster(type: string) {
  interface CMMSMasterInfo {
    rows: CMMSMasterData[];
    fields: any[];
  }

  const requestFetcher = async(url: string, type:string) => {
      return await instance
      .get<CMMSMasterInfo>(url + type)
      .then((response) => {
        let info: CMMSMaster = {
          idName: response.data.fields[0].name,
          data: response.data.rows,
        };

        return info;
      })
      .catch((e) => {
        console.log("error getting requests");
        console.log(e);
        throw new Error(e);
      });
  };

  return useSWR<CMMSMaster, Error>(["/api/master/", type], requestFetcher, {
    revalidateOnFocus: false,
  });
}

function MasterActions({
  id,
  onClickDelete,
  onClickEdit,
  editHref,
}: {
  id: number | string;
  onClickDelete?: React.MouseEventHandler<HTMLButtonElement>;
  onClickEdit?: React.MouseEventHandler<HTMLButtonElement>;
  editHref: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexFlow: "row wrap",
        justifyContent: "space-around",
        marginRight: "10%",
        marginLeft: "10%",
      }}
    >
      <button
        onClick={onClickDelete}
        name={"" + id}
        style={{ all: "unset", cursor: "pointer" }}
      >
        <BsTrashFill />
      </button>
      {/* <button onClick={onClickEdit} name={"" + id} style={{all: "unset", cursor: "pointer"}}><BsPencilSquare /></button> */}
      <Link href={editHref} style={{ all: "unset", cursor: "pointer" }}>
        <BsPencilSquare />
      </Link>
    </div>
  );
}

export default function Master() {
  const [activeTabIndex, setActiveTabIndex] = useState<number>(0);
  const [masterItems, setMasterItems] = useState<CMMSMasterData[]>([]);
  const [columnSizes, setColumnSizes] = useState<string>(
    "6em 20% calc(80% - 12em) 6em;"
  );
  const [isReady, setReady] = useState<boolean>(false);

  const [deleteModalID, setDeleteModalID] = useState<number>(0);
  const [isModalOpen, setModalOpen] = useState<boolean>(false);
  const [isDeleting, setDeleting] = useState<boolean>(false);

  const [isDeleteSuccess, setDeleteSuccess] = useState<boolean>(false);
  const [isDeleteFailed, setDeleteFailed] = useState<boolean>(false);

  const [isEditModalOpen, setEditModalOpen] = useState<boolean>(false);
  const [tablelist1, setTableList1] = useState<boolean>(false);

  const { data, error, isValidating, mutate } = useMaster(
    indexedColumn[activeTabIndex]
  );

  const onDeleteClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    setDeleteModalID(parseInt(e.currentTarget.name));
    setModalOpen(true);
  };

  const deleteMaster = () => {
    setDeleting(true);
    instance
      .delete(`/api/master/${indexedColumn[activeTabIndex]}/${deleteModalID}`)
      .then(() => {
        setDeleteSuccess(true);
        setDeleteFailed(false);
      })
      .catch((err) => {
        console.log(err);
        setDeleteSuccess(false);
        setDeleteFailed(true);
      })
      .finally(() => {
        setModalOpen(false);
        setDeleting(false);
      });
  };

  const theme = useTheme([
    getTheme(),
    {
      Table: "--data-table-library_grid-template-columns:  " + columnSizes + "",
      HeaderRow: `
				background-color: #eaf5fd;
			`,
    },
  ]);

  const switchColumns = (index: number) => {
    setReady(false);
    setActiveTabIndex(index);
  };

  const refreshData = () => {
    console.log("asd");
    mutate();
    switchColumns(activeTabIndex);
  };

  const editRow: OnClick<CMMSMasterData> = (item, event) => {
    const checklistRow = item;

    console.log(checklistRow, event);
    setEditModalOpen(true);
  };

  const closeEdit = () => {
    setEditModalOpen(false);
  };

  useEffect(() => {
    if (!isReady && data && !isValidating) {
      let len = Object.keys(data.data[0]).length - 3;
      let sizes = "";
      for (let i = 0; i < len; i++)
        sizes += "calc((100% - 12em) / " + len + ") ";
      setColumnSizes("6em " + sizes + "6em");

      setMasterItems(
        data.data.map((row): CMMSMasterData => {
          const { activity_log, created_date, ...newRow } = row;
          return Object.assign({}, {
            id: row[data.idName],
          }, newRow);
        })
      );
      
      

      setReady(true);
    }
  }, [data, isValidating]);

  return (
    <ModuleMain>
      <ModuleHeader title="Master" header="Master Tables">
        <TooltipBtn onClick={() => refreshData()} text="Refresh">
          <FiRefreshCw size={20} />
        </TooltipBtn>
        <Link href="./Master/New">
          <TooltipBtn text="New Entry">
            <BsFileEarmarkPlus href="./Master/New" size={20} />
          </TooltipBtn>
        </Link>
      </ModuleHeader>

      <ModuleSimplePopup
        modalOpenState={isModalOpen}
        setModalOpenState={setModalOpen}
        title="Confirm Deletion"
        text={
          "Are you sure you want to delete master record of ID " +
          deleteModalID +
          "?"
        }
        icon={2}
        buttons={[
          <button
            key="deleteConfirm"
            onClick={deleteMaster}
            className="btn btn-primary"
          >
            {isDeleting && <LoadingIcon />}
            Delete
          </button>,
          <button
            key="deleteCancel"
            onClick={() => setModalOpen(false)}
            className="btn btn-secondary"
          >
            Cancel
          </button>,
        ]}
      />

      <ModuleSimplePopup
        modalOpenState={isDeleteSuccess}
        setModalOpenState={setDeleteSuccess}
        title="Success"
        text={"ID " + deleteModalID + " has been deleted"}
        icon={1}
        buttons={
          <button
            onClick={() => {
              setDeleteSuccess(false);
              refreshData();
            }}
            className="btn btn-primary"
          >
            Ok
          </button>
        }
      />

      <ModuleSimplePopup
        modalOpenState={isDeleteFailed}
        setModalOpenState={setDeleteFailed}
        title="Deletion Failed"
        text={"Something went wrong!"}
        icon={3}
        buttons={
          <button
            onClick={() => {
              setDeleteFailed(false);
              refreshData();
            }}
            className="btn btn-primary"
          >
            Ok
          </button>
        }
      />

      <ModuleContent>
        <ul className="nav nav-tabs">
          {indexedColumn.map((item, index) => (
            <li
              key={index}
              onClick={() => {
                activeTabIndex !== index && switchColumns(index);
              }}
              className={"nav-link" + (activeTabIndex === index ? " active" : "")}
            > 
              <span style={{ all: "unset" }}>{item}</span>
            </li>
          ))}
          
        </ul>
        {isReady && (
          <Table
          data={{ nodes: masterItems }}
          theme={theme}
          layout={{ custom: true }}
        >
          {(tableList: CMMSMasterData[]) => {
            const newtableList = tableList.map((item) => {
              const {activity_log, created_date, ...newItem } = item;
              return newItem;
            });
            return (
              <>
                <Header>
                  <HeaderRow>
                    {tableList.length > 1 &&
                      Object.keys(tableList[0]).slice(1).map((k) => {
                        return (
                          <HeaderCell resize key={k}>
                            {k}
                          </HeaderCell>
                        );
                      })}
                  <HeaderCell resize>Actions</HeaderCell>
                  </HeaderRow>
                </Header>
                <Body>
                  {tableList.map((item) => (
                    <Row key={item.id} item={item} onClick={editRow}>
                      {tableList.length > 1 &&
                        Object.keys(tableList[0]).slice(1).map((k) => {
                          return <Cell key={item[k]}>{item[k]}</Cell>;
                        })}
                      <Cell>
                        <MasterActions
                          id={item.id}
                          onClickDelete={onDeleteClick}
                          editHref={
                            "/Master/Edit?type=" +
                            indexedColumn[activeTabIndex] +
                            "&id=" +
                            item.id
                          }
                        />
                      </Cell>
                    </Row>
                  ))}
                </Body>
              </>
            );
          }}
        </Table>
        
        
        
        )}
      </ModuleContent>
    </ModuleMain>
  );
}
