import React from "react";
import Link from "next/link";
import { ModuleContent, ModuleHeader, ModuleMain } from "../../components";
import TooltipBtn from "../../components/TooltipBtn";
import { BsFileEarmarkPlus } from "react-icons/bs";

import { CompactTable, Column } from '@table-library/react-table-library/compact';
import { useTheme } from '@table-library/react-table-library/theme';
import { getTheme } from '@table-library/react-table-library/baseline';

import { GetServerSideProps, GetServerSidePropsContext } from "next";

interface WorkflowItem {
  sn: string;
  id: string;
  statement: string;
  created_at: Date;
  times_ran: boolean;
}

const Workflow = () => {

  const nodes = [
    {
      sn: '1',
      id: '1',
      statement: 'When fault type at Woodlands DHCS is of type Cooling Tower then send email to xxx@email.com',
      created_at: new Date(2020, 1, 15),
      times_ran: 3,
    },
  ];

  const key = 'Compact Table';

  const data = { nodes };

  const theme = useTheme([
    getTheme(),
    {
      Table: `
        --data-table-library_grid-template-columns:  5em 5em calc(100% - 30em) 10em 10em;
        overflow-x: hidden
      `
    }
  ]);

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
      label: 'Times Ran',
      renderCell: (item) => item.times_ran.toString(),
    }
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
        <CompactTable columns={COLUMNS} data={data} theme={theme} layout={{ custom: true }}/>
      </ModuleContent>
    </ModuleMain>
  )
};

export default Workflow;
