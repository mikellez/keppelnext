import React, { useEffect, useState } from "react";
import { CMMSAssetRequestHistory } from "../../../types/common/interfaces";
import styles from "../../styles/Asset.module.scss";
import { CompactTable } from "@table-library/react-table-library/compact";
import { TableNode } from "../../../pages/Request";
import { useTheme } from "@table-library/react-table-library/theme";
import { getTheme } from "@table-library/react-table-library/baseline";
import { ModuleContent } from "../../ModuleLayout/ModuleContent";
import Pagination from "../../Pagination";

interface AssetHistoryProps {
  history: CMMSAssetRequestHistory[];
}

const COLUMNS: any[] = [
  {
    label: "Status",
    renderCell: (item: TableNode<CMMSAssetRequestHistory>) => item.prop.status,
  },
  {
    label: "Action",
    renderCell: (item: TableNode<CMMSAssetRequestHistory>) => item.prop.action,
  },
  {
    label: "Date",
    renderCell: (item: TableNode<CMMSAssetRequestHistory>) => item.prop.date,
  },
  {
    label: "Role",
    renderCell: (item: TableNode<CMMSAssetRequestHistory>) => item.prop.role,
  },
  {
    label: "Name",
    renderCell: (item: TableNode<CMMSAssetRequestHistory>) => item.prop.name,
  },
  {
    label: "Case ID",
    renderCell: (item: TableNode<CMMSAssetRequestHistory>) => item.prop.caseId,
  },
  {
    label: "Fault Type",
    renderCell: (item: TableNode<CMMSAssetRequestHistory>) =>
      item.prop.faultType,
  },
];

export default function AssetRequestHistory(props: AssetHistoryProps) {
  const [data, setData] = useState<TableNode<CMMSAssetRequestHistory>[]>();
  const [pageData, setPageData] = useState<CMMSAssetRequestHistory[]>();
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
    if (props.history) {
      setData(
        props.history.map((row) => {
          return {
            prop: row,
            id: row.caseId + row.status + row.date + row.action,
          };
        })
      );
    }
  }, [props]);

  return (
    <div>
      {/* <h4 className={styles.assetDetailsHeader}>Request History</h4> */}
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
        <div>No Request History</div>
      )}
    </div>
  );
}
