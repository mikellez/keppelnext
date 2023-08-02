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
import instance from "../../types/common/axios.config";
import { ModuleHeader, ModuleMain } from "../../components";
import TooltipBtn from "../../components/TooltipBtn";
import Link from "next/link";
import { BsFileEarmarkPlus, BsPencilSquare, BsTrashFill, BsPersonBadge } from "react-icons/bs";
import { AiOutlineUserAdd } from "react-icons/ai";
import { HiOutlineDownload } from "react-icons/hi";
import ModuleSimplePopup from "../../components/ModuleLayout/ModuleSimplePopup";
import { useRouter } from "next/router";
import { useAdminContext } from "../../components/Context/AdminContext";
import { selectImpersonationState, setImpersonationState } from "../../redux/impersonationSlice";
import { useDispatch, useSelector } from "react-redux";

const downloadCSV = async () => {
  try {
    const response = await instance({
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

const getUsers = async () => {
  const url = "/api/user/getUsers";
  return await instance
    .get(url)
    .then((res) => {
      // console.log(res.data);
      return res.data;
    })
    .catch((err) => {
      console.log(err.response);
      return err.response.status;
    });
};

const checkAdmin = async () => {
  const url = "/api/user";
  return await instance
    .get(url)
    .then((res) => {
      // console.log(res.data);
      return res.data;
    })
    .catch((err) => {
      console.log(err.response);
      return err.response.status;
    });
}

export default function User() {

  const { isAdmin, setIsAdminHandler } = useAdminContext();

  useEffect(() => {
    getUsers().then((res) => {
      setData(res);
    });
  }, []);

  // If current logged in user is admin, show the impersonate button. Else hide it
  useEffect(() => {
    checkAdmin().then((res) => {
      if(res.role_id == 1)
        setIsAdminHandler(true);
    });
  }, []);

  const router = useRouter();
  const [data, setData] = useState<CMMSEmployee[]>([]);
  const [columnSizes, setColumnSizes] = useState<string>(
    "6em 20% calc(80% - 12em) 6em;"
  );
  const [deleteModalID, setDeleteModalID] = useState<number>(0);
  const [impersonateUserID , setImpersonateUserID] = useState<number>(0);
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
  const dispatch = useDispatch();

  const onImpersonateClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    impersonateUser(parseInt(e.currentTarget.name));
  };
  async function impersonateUser(impersonateUserID:number) {
    try {
      let res = await instance.post(`/api/admin/impersonate/${impersonateUserID}`);
      // console.log(res);

      if(res.status == 200){      
        // Re-direct back to home page under impersonated user   
        window.location.href = '/Dashboard';

        // Dispatch to notify the store that impersonation state has changed
        dispatch(setImpersonationState(true));
      }
    } catch (e) {
      console.log(e);
    }
  }
  async function deleteMaster() {
    try {
      let res = await instance.delete(`/api/user/deleteUser/${deleteModalID}`);
      // console.log(res);
      setDeleteSuccess(true);
    } catch (e) {
      console.log(e);
    }
  }

  return (
    <ModuleMain>
      <ModuleHeader title="User Management" header="User Tables">
        <TooltipBtn onClick={() => downloadCSV()} text="Export CSV">
          <HiOutlineDownload size={20} />
        </TooltipBtn>
        <Link href="./Add">
          <TooltipBtn text="Add User">
            <AiOutlineUserAdd href="./Add" size={20} />
          </TooltipBtn>
        </Link>
      </ModuleHeader>
      <Table data={{ nodes: data }} theme={theme}>
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
                  <Cell
                    style={{
                      display: "flex",
                      flexFlow: "row wrap",
                      justifyContent: "space-around",
                      // marginRight: "10%",
                      // marginLeft: "10%",
                    }}
                  >
                    <button
                      onClick={onDeleteClick}
                      name={"" + item.user_id}
                      style={{
                        all: "unset",
                        cursor: "pointer",
                        marginRight: "10px",
                      }}
                    >
                      <BsTrashFill />
                    </button>
                    <Link
                      href={`/User/Edit/${item.user_id}`}
                      style={{ all: "unset", cursor: "pointer" }}
                    >
                      <BsPencilSquare />
                    </Link>
                    {isAdmin && (
                      <button
                        onClick={onImpersonateClick}
                        name={"" + item.user_id}
                        style={{
                          all: "unset",
                          cursor: "pointer",
                          marginLeft: "10px",
                        }}
                      >
                        <BsPersonBadge />
                      </button>)}
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
        text={"Are you sure you want to delete this User?" + deleteModalID}
        icon={2}
        shouldCloseOnOverlayClick={true}
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
          "User has been deleted"
        }
        icon={1}
        shouldCloseOnOverlayClick={true}
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
