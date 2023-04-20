import React, { useState, useEffect } from "react";
import {
  Table,
  Header,
  HeaderRow,
  Body,
  Row,
  HeaderCell,
  Cell,
} from "@table-library/react-table-library/table";
import { useTheme } from "@table-library/react-table-library/theme";
import { getTheme } from "@table-library/react-table-library/baseline";
import { CMMSEmployee } from "../../types/common/interfaces";
import axios from "axios";
import { ModuleHeader, ModuleMain } from "../../components";
import TooltipBtn from "../../components/TooltipBtn";
import Link from "next/link";
import { BsFileEarmarkPlus, BsTrashFill } from "react-icons/bs";
import { AiOutlineUserAdd } from "react-icons/ai";
import { HiOutlineDownload } from "react-icons/hi";
import ModuleSimplePopup from "../../components/ModuleLayout/ModuleSimplePopup";
import { useRouter } from "next/router";

const downloadCSV = async () => {
    try {
        const response = await axios({
            url: `/api/user/getUsersCSV`,
            method: "get",
            responseType: "arraybuffer",
        });
        const blob = new Blob([response.data]);
        const url = window.URL.createObjectURL(blob);
        const temp_link = document.createElement("a");
        temp_link.download = `Users.csv`;
        temp_link.href = url;
        temp_link.click();
        temp_link.remove();
    } catch (e) {
        console.log(e);
    }
};


const getUser = async () => {
  const url = "/api/user/getUsers";
  return await axios
    .get(url)
    .then((res) => {
      console.log(res.data);
      return res.data;
    })
    .catch((err) => {
      console.log(err.response);
      return err.response.status;
    });
};

export default function User() {
  useEffect(() => {
    getUser().then((res) => {
      setData(res);
    });
  }, []);
  const router = useRouter();
  const [data, setData] = useState<CMMSEmployee[]>([]);
  const [columnSizes, setColumnSizes] = useState<string>(
    "6em 20% calc(80% - 12em) 6em;"
  );
  const [deleteModalID, setDeleteModalID] = useState<number>(0);
  const [isModalOpen, setModalOpen] = useState<boolean>(false);
  const [isDeleteSuccess, setDeleteSuccess] = useState<boolean>(false);


  const theme = useTheme([
    getTheme(),
    {
        Table: `
            --data-table-library_grid-template-columns: 5% 15% 35% 15% 15% 15%;
        `,

        Row: `
            &:nth-of-type(n) {
            cursor: pointer
            }; 
        `,

        Cell: `
            & > div {
                overflow: visible;
                white-space: unset !important;
            }
        `,

        HeaderCell: `
            z-index: 20 !important;
            &:nth-of-type(1) {
                z-index: 30 !important;
            }
        `,
    },
  ]);
  const onDeleteClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    setDeleteModalID(parseInt(e.currentTarget.name));
    setModalOpen(true);
  };
  async function deleteMaster() {
    try {
      let res = await axios.delete(`/api/user/deleteUser/${deleteModalID}`);
      console.log(res);
      setDeleteSuccess(true);}
    catch (e) { console.log(e); }}

  
  


  return (
    <ModuleMain>
      <ModuleHeader title="User Management" header="User Tables">
        <TooltipBtn
            onClick={() => downloadCSV()}
                    text="Export CSV">
            <HiOutlineDownload size={20} />
        </TooltipBtn>
        <Link href="./Add">
          <TooltipBtn text="Add User">
            <AiOutlineUserAdd href="./Add" size={20} />
          </TooltipBtn>
        </Link>
      </ModuleHeader>
    <Table data={{ nodes: data }} theme={theme} >
    {(tableList: CMMSEmployee[]) => (
      <>
        <Header>
          <HeaderRow>
            <HeaderCell>Employee ID</HeaderCell>
            <HeaderCell>Name</HeaderCell>
            <HeaderCell>Role</HeaderCell>
            <HeaderCell>Actions</HeaderCell>

          </HeaderRow>
        </Header>

        <Body>
          {tableList.map((item) => (
            <Row key={item.id} item={item} name={item.user_id}>
              <Cell>{item.employee_id}</Cell>
              <Cell>{item.full_name}</Cell>
              <Cell>{item.role_name}</Cell>
              <Cell>
              <button
        onClick={onDeleteClick}
        name={"" + item.user_id}
        style={{ all: "unset", cursor: "pointer" }}
      >
        <BsTrashFill />
      </button>
      </Cell>
            </Row>
          ))}
        </Body>
      </>
    )}
  </Table>
  <ModuleSimplePopup
        modalOpenState={isModalOpen}
        setModalOpenState={setModalOpen}
        title="Confirm Deletion"
        text={
          "Are you sure you want to delete this User?" + deleteModalID
        }
        icon={2}
        buttons={[
          <button
            key="deleteConfirm"
            onClick={deleteMaster}
            className="btn btn-primary"
          >
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
        text={
          // "ID " + deleteModalID + 
          "User has been deleted"}
        icon={1}
        buttons={
          <button
            onClick={() => {
              setDeleteSuccess(false);
              setModalOpen(false);
              router.reload();
            }}
            className="btn btn-primary"
          >
            Ok
          </button>
        }
      />
  </ModuleMain>
  );
}