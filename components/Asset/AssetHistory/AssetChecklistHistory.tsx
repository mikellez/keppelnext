import React, { useEffect, useState } from "react";
import { CMMSAssetChecklistHistory } from "../../../types/common/interfaces";
import styles from "../../styles/Asset.module.scss";
import { CompactTable } from "@table-library/react-table-library/compact";
import { Column } from "@table-library/react-table-library/types";
import { useTheme } from "@table-library/react-table-library/theme";
import { getTheme } from "@table-library/react-table-library/baseline";
import instance from "../../../types/common/axios.config";
import Pagination from "../../Pagination";
import moment from "moment";

interface HistoryItem {
  activity_type: string;
  activity: string;
  date: string;
  name: string;
  id: string;
}

const COLUMNS: Column<HistoryItem>[] = [
  {
    label: "Checklist Status",
    renderCell: (item) => item.activity_type,
  },
  {
    label: "Action",
    renderCell: (item) => item.activity,
  },
  {
    label: "Date",
    renderCell: (item) =>
      moment(new Date(item.date)).format("MMMM Do YYYY, h:mm:ss a"),
  },
  {
    label: "Action By",
    renderCell: (item) => item.name,
  },
];

export default function AssetChecklistHistory({ id }: { id: number }) {
  const [data, setData] = useState<HistoryItem[]>();
  const [page, setPage] = useState<number>(1);
  const [isReady, setReady] = useState<boolean>(false);
  const [totalPages, setTotalPages] = useState<number>(1);

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
    instance.get(`/api/asset/history/checklist/${id}`).then((res) => {
      setData(res.data.rows);
      setTotalPages(res.data.total);
      setReady(true);
    });
  }, [page, isReady]);

  useEffect(() => {
    const start = page * LIMIT - 1;
    setPageData(data?.slice(start, start + LIMIT));
  }, [page]);

  return (
    <div>
      {/* <h4 className={styles.assetDetailsHeader}>Checklist History</h4> */}
      {isReady && data && data.length > 0 ? (
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
        <div>No Checklist History</div>
      )}
    </div>
  );
}
