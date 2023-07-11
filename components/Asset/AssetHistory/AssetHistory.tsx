import React, { useEffect, useState } from "react";
import { CMMSAssetHistory } from "../../../types/common/interfaces";
import styles from "../../styles/Asset.module.scss";
import { CompactTable } from "@table-library/react-table-library/compact";
import { Column } from "@table-library/react-table-library/types";
import { useTheme } from "@table-library/react-table-library/theme";
import { getTheme } from "@table-library/react-table-library/baseline";

interface HistoryItem {
  //   id: string;
  //   action: string;
  //   date: string;
  //   name: string;
  //   status: string;
  //   checklistId: string;
  //   checklistName: string;
  id: string;
  history_id: number;
  action: string;
  fields: string;
  date: string;
  name: string;
}

const COLUMNS: Column<HistoryItem>[] = [
  //   {
  //     label: "Status",
  //     renderCell: (item) => item.status,
  //   },
  {
    label: "Action",
    renderCell: (item) => item.action,
  },
  {
    label: "User",
    renderCell: (item) => item.name,
  },
  {
    label: "Date",
    renderCell: (item) => item.date,
  },
  {
    label: "Fields changed",
    renderCell: (item) => item.fields,
  },
];

export default function AssetHistory({
  history,
}: {
  history: CMMSAssetHistory[];
}) {
  const [data, setData] = useState<HistoryItem[]>();

  const theme = useTheme([
    getTheme(),
    {
      Table: `
                --data-table-library_grid-template-columns: auto 8% 8% 8% 8% auto;
                height: auto;
                max-height: 300px;
            `,
      HeaderCell: `
                background-color: white !important;
                z-index: 20 !important;
                &:nth-of-type(1) {
                    z-index: 30 !important;
                }
            `,
      BaseCell: `
                font-size: 12px;
                & > div {
                    white-space: unset !important;
                }

            `,
    },
  ]);
  useEffect(() => {
    if (history.length > 0) {
      setData(
        history.map((row) => {
          return {
            id: row.history_id + row.date.toString() + row.action,
            action: row.action,
            history_id: row.history_id,
            date: new Date(row.date).toLocaleDateString(),
            name: row.name,
            fields: row.fields,
          };
        })
      );
    }
    // console.log(data);
  }, [history]);

  return (
    <div>
      {/* <h4 className={styles.assetDetailsHeader}>Checklist History</h4> */}
      {data && data!.length > 0 ? (
        <CompactTable
          columns={COLUMNS}
          data={{ nodes: data }}
          theme={theme}
          layout={{ fixedHeader: true }}
        />
      ) : (
        <div>No Asset History</div>
      )}
    </div>
  );
}