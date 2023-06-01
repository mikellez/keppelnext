import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ModuleContent, ModuleHeader, ModuleMain } from "../../components";
import TooltipBtn from "../../components/TooltipBtn";
import { BsFileEarmarkPlus } from "react-icons/bs";

import { CompactTable, Column } from '@table-library/react-table-library/compact';
import { useTheme } from '@table-library/react-table-library/theme';
import { getTheme } from '@table-library/react-table-library/baseline';

import { GetServerSideProps, GetServerSidePropsContext } from "next";
import { Switch, Tag } from "antd";
import { useCurrentUser, useWorkflow } from "../../components/SWR";
import { Role } from "../../types/common/enums";
import { AiOutlineEdit, AiOutlineFolderView, AiFillDelete } from "react-icons/ai";
import instance from "../../axios.config";
import ModuleSimplePopup from "../../components/ModuleLayout/ModuleSimplePopup";
import LoadingIcon from "../../components/LoadingIcon";
import { set } from "nprogress";
import router from "next/router";

interface WorkflowItem {
  sn: string;
  id: string;
  statement: string;
  created_at: Date;
  is_active: number;
  action: number;
}

const Workflow = () => {
  const { data, error, isValidating, mutate } = useWorkflow();
  const [workflow, setWorkflow] = useState<WorkflowItem[]>([]);
  const [isReady, setIsReady] = useState<boolean>(false);
  const user = useCurrentUser();
  const [isUpdateModalOpen, setUpdateModalOpen] = useState<boolean>(false);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState<boolean>(false);
  const [isDeleteSuccess, setDeleteSuccess] = useState<boolean>(false);
  const [isDeleting, setDeleting] = useState<boolean>(false);
  const [deleteModalID, setDeleteModalID] = useState<string>('');

  useEffect(() => {
    if(data && !isValidating) {
      setWorkflow(data.map((item, index) => {
        let statement = '';
        if(item.is_assign_to) {
          statement = `When fault type at ${item.plant_name} is of type ${item.fault_type} then assign to ${item.user_name}`;
        } else if (item.is_send_email) {
          statement = `When fault type at ${item.plant_name} is of type ${item.fault_type} then send email to ${item.user_email}`;
        }

        return {
          sn: (index + 1).toString(),
          id: item.id.toString(),
          statement: statement,
          created_at: new Date(item.created_at),
          is_active: item.is_active,
          action: 1
        }
      }));

      setIsReady(true);
    }
  }, [data]);
  


  const key = 'Compact Table';

  /*const nodes = [
    {
      sn: '1',
      id: '1',
      statement: 'When fault type at Woodlands DHCS is of type Cooling Tower then send email to xxx@email.com',
      created_at: new Date(2020, 1, 15),
      times_ran: 3,
    },
  ];
  const data = { nodes };*/

  const theme = useTheme([
    getTheme(),
    {
      Table: `
        --data-table-library_grid-template-columns:  5em 5em calc(100% - 30em) 7em 5em 8em;
        overflow-x: hidden
      `
    }
  ]);

  const onHandleToggle = async (id: string, checked: boolean) => {
    await instance
    .put(`/api/workflow/${id}`, {is_active: checked})
    .then((res) => {
      setUpdateModalOpen(true);
    })
    .catch((err) => {
      alert('Updated failed!');
      console.log(err.response);
      console.log('Unable to update workflow!');
    })
  }

  const handleDelete = (id: string) => {
    setDeleteModalID(id);
    setDeleteModalOpen(true);
  }

  const deleteWorkflow = async () => {
    await instance
    .delete(`/api/workflow/${deleteModalID}`)
    .then((res) => {
      setDeleteModalOpen(false);
      setDeleteSuccess(true);
      mutate();
    })
    .catch((err) => {
      alert('Delete failed!');
      console.log(err.response);
      console.log('Unable to delete workflow!');
    });
  }


  const COLUMNS: Column<WorkflowItem>[] = [
    { label: 'S/N', renderCell: (item) => item.sn },
    { label: 'ID', renderCell: (item) => item.id },
    { label: 'Workflow Statement', renderCell: (item) => item.statement },
    {
      label: 'Created At',
      renderCell: (item) =>
        item.created_at.toLocaleDateString('en-US', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        }),
    },
    {
      label: 'Active',
      renderCell: (item) => <Switch defaultChecked={!!item.is_active} onChange={(checked)=>onHandleToggle(item.id, checked)} size={'small'}/>
    },
    /*{
      label: 'Active',
      renderCell: (item) => item.is_active ? <Tag color="success"> active </Tag> : <Tag color="error"> inactive </Tag>,
    },*/
    {
      label: 'Action',
      renderCell: (item) => {
        if (
          user.data!.role_id === Role.Admin ||
          user.data!.role_id === Role.Manager ||
          user.data!.role_id === Role.Engineer
        ) {
          return (
            <Link href="" onClick={(e) => handleDelete(item.id)}>
              <AiFillDelete size={22} />
            </Link>
          )
        } else {
          <></>
        }
      },
    },

  ];


  return (
    <ModuleMain>
      <ModuleHeader header="Workflow">
        <Link href="./Workflow/New">
          <TooltipBtn text="New Workflow">
            <BsFileEarmarkPlus href="./Workflow/New" size={20} />
          </TooltipBtn>
        </Link>
      </ModuleHeader>
      <ModuleContent>
        {isReady && workflow && <CompactTable columns={COLUMNS} data={{nodes: workflow}} theme={theme} layout={{ custom: true }}/>}
      </ModuleContent>
      <ModuleSimplePopup
          modalOpenState={isUpdateModalOpen}
          setModalOpenState={setUpdateModalOpen}
          title="Success"
          text={
          // "ID " + deleteModalID + 
          "Workflow updated successfully!"}
          icon={1}
          buttons={
          <button
              onClick={() => {
                  setUpdateModalOpen(false);
              }}
              className="btn btn-primary"
          >
              Ok
          </button>
          }
      />
      <ModuleSimplePopup
        modalOpenState={isDeleteModalOpen}
        setModalOpenState={setDeleteModalOpen}
        title="Confirm Deletion"
        text={
          "Are you sure you want to delete workflow record of ID " +
          deleteModalID +
          "?"
        }
        icon={2}
        buttons={[
          <button
            key="deleteConfirm"
            onClick={deleteWorkflow}
            className="btn btn-primary"
          >
            {isDeleting && <LoadingIcon />}
            Delete
          </button>,
          <button
            key="deleteCancel"
            onClick={() => setDeleteModalOpen(false)}
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
          "Workflow delete successfully!"}
          icon={1}
          buttons={
          <button
              onClick={() => {
                  setDeleteSuccess(false);
              }}
              className="btn btn-primary"
          >
              Ok
          </button>
          }
      />
    </ModuleMain>
  )
};

export default Workflow;
