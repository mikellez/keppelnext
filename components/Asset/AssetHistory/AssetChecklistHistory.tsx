import React, { useEffect, useState } from "react";
import { CMMSAssetChecklistHistory } from "../../../types/common/interfaces";
import styles from "../../styles/Asset.module.scss";
import { CompactTable } from "@table-library/react-table-library/compact";
import { Column } from "@table-library/react-table-library/types";
import { useTheme } from "@table-library/react-table-library/theme";
import { getTheme } from "@table-library/react-table-library/baseline";
import Pagination from "../../Pagination";
import { ModuleContent } from "../../ModuleLayout/ModuleContent";

interface HistoryItem {
  id: string;
  action: string;
  date: string;
  name: string;
  status: string;
  checklistId: string;
  checklistName: string;
}

const COLUMNS: Column<HistoryItem>[] = [
  {
    label: "Status",
    renderCell: (item) => item.status,
  },
  {
    label: "Action",
    renderCell: (item) => item.action,
  },
  {
    label: "Date",
    renderCell: (item) => item.date,
  },
  {
    label: "Role",
    renderCell: (item) => item.name,
  },
  {
    label: "Checklist ID",
    renderCell: (item) => item.checklistId,
  },
  {
    label: "Checklist Name",
    renderCell: (item) => item.checklistName,
  },
];

export default function AssetChecklistHistory({
  history,
}: {
  history: CMMSAssetChecklistHistory[];
}) {
  const [data, setData] = useState<HistoryItem[]>();
  const [pageData, setPageData] = useState<HistoryItem[]>();
  const [page, setPage] = useState<number>(0);
  const [isReady, setIsReady] = useState<boolean>(true);
  const LIMIT = 10;

  const theme = useTheme([
    getTheme(),
    {
      Table: `
                --data-table-library_grid-template-columns: auto 8% 12% 12% 22% auto;
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
    if (history) {
      setData(
        history.map((row) => {
          return {
            id: row.checklistId + row.status + row.date + row.action,
            action: row.action,
            date: row.date,
            name: row.name,
            status: row.status,
            checklistId: row.checklistId,
            checklistName: row.checklistName,
          };
        })
      );
      setPage(1);
    }
  }, [history]);

  useEffect(() => {
    const start = page * LIMIT - 1;
    setPageData(data?.slice(start, start + LIMIT));
  }, [page]);

  return (
    <div>
      {/* <h4 className={styles.assetDetailsHeader}>Checklist History</h4> */}
      {data ? (
        <ModuleContent>
          <CompactTable
            columns={COLUMNS}
            data={{ nodes: pageData }}
            theme={theme}
            layout={{ fixedHeader: true }}
          />
          <Pagination
            page={page}
            setPage={setPage}
            totalPages={history.length / 10}
            setReady={setIsReady}
          />
        </ModuleContent>
      ) : (
        <div>No Checklist History</div>
      )}
    </div>
  );
}
