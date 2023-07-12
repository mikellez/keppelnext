import React, { useEffect, useState } from "react";
import { CMMSAssetHistory } from "../../../types/common/interfaces";
import styles from "../../styles/Asset.module.scss";
import { CompactTable } from "@table-library/react-table-library/compact";
import { Column } from "@table-library/react-table-library/types";
import { useTheme } from "@table-library/react-table-library/theme";
import { getTheme } from "@table-library/react-table-library/baseline";
import instance from "../../../types/common/axios.config";
import Pagination from "../../Pagination";

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

export default function AssetHistory({id}: {id: number}) {
  const [data, setData] = useState<HistoryItem[]>();
  const [page, setPage] = useState<number>(1);
  const [isReady, setReady] = useState<boolean>(false);
  const [totalPages, setTotalPages] = useState<number>(1);

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
    instance.get(`/api/asset/history/${id}`)
      .then(res => {
        setData(res.data.rows.map((row: CMMSAssetHistory) => {
          return {
            id: row.history_id + row.date.toString() + row.action,
            action: row.action,
            history_id: row.history_id,
            date: new Date(row.date).toLocaleDateString(),
            name: row.name,
            fields: row.fields,
          };
        
        }));
        setTotalPages(res.data.total);
        setReady(true);

    })
    
  }, [page, isReady])

  return (
    <div>
      {/* <h4 className={styles.assetDetailsHeader}>Checklist History</h4> */}
      {isReady && data && data!.length > 0 ? (
      <div>

        <CompactTable
          columns={COLUMNS}
          data={{ nodes: data }}
          theme={theme}
          layout={{ fixedHeader: true }}
          />
        <Pagination
          setPage={setPage}
          setReady={setReady}
          totalPages={totalPages}
          page={page} 
          />
        </div>
      ) : (
        <div>No Asset History</div>
      )}
    </div>
  );
}
