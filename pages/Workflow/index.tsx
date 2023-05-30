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

  useEffect(() => {
    if(data && !isValidating) {
      setWorkflow(data.map((item, index) => {
        let statement = '';
        if(item.is_assign_to) {
          statement = `When fault type at ${item.plant_id} is of type ${item.fault_id} then assign to ${item.user_id}`;
        } else if (item.is_send_email) {
          statement = `When fault type at ${item.plant_id} is of type ${item.fault_id} then send email to ${item.user_email}`;
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

  const onChange = (e) => {
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
      renderCell: (item) => item.is_active ? <Tag color="success"> active </Tag> : <Tag color="error"> inactive </Tag>,
    },
    {
      label: 'Action',
      renderCell: (item) => {
        if (
          user.data!.role_id === Role.Admin ||
          user.data!.role_id === Role.Manager ||
          user.data!.role_id === Role.Engineer
        ) {
          return (
            <>
            <Switch defaultChecked onChange={onChange} />
            <Link href={`/Workflow/Delete/${item.id}`}>
              <AiFillDelete size={22} />
            </Link>
            {/*<Link href={`/Workflow/View/${item.id}`}>
              <AiOutlineFolderView size={22} />
            </Link>
            <Link href={`/Workflow/Edit/${item.id}`}>
              <AiOutlineEdit size={22} />
          </Link>*/}
            </>
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
    </ModuleMain>
  )
};

export default Workflow;
