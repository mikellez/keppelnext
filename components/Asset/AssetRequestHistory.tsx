import React, { useEffect, useState } from "react";
import { CMMSAssetHistory } from "../../types/common/interfaces";
import styles from "../../styles/Asset.module.scss"
import { CompactTable } from "@table-library/react-table-library/compact";
import { TableNode } from "../../pages/Request";
import { useTheme } from "@table-library/react-table-library/theme";
import { getTheme } from "@table-library/react-table-library/baseline";

interface AssetHistoryProps {
    history: CMMSAssetHistory[];
}

const COLUMNS: any[] = [
    { 
        label: 'Status', 
        renderCell: (item: TableNode<CMMSAssetHistory>) => item.prop.status,
        
    },
    { label: 'Action', renderCell: (item: TableNode<CMMSAssetHistory>) => item.prop.action },
    { label: 'Date', renderCell: (item: TableNode<CMMSAssetHistory>) => item.prop.date },
    { label: 'Role', renderCell: (item: TableNode<CMMSAssetHistory>) => item.prop.role },
    { label: 'Name', renderCell: (item: TableNode<CMMSAssetHistory>) => item.prop.name },
    { label: 'Case ID', renderCell: (item: TableNode<CMMSAssetHistory>) => item.prop.caseId },
    { 
        label: 'Fault Type', 
        renderCell: (item: TableNode<CMMSAssetHistory>) => item.prop.faultType,  
    },
];


export default function AssetHistory(props: AssetHistoryProps) {
    const [data, setData] = useState<TableNode<CMMSAssetHistory>[]>();
    
    const theme = useTheme([
        getTheme(),
        {   Table: `
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

            `
            
        }
    ])
    useEffect(() => {
        if (props) {
            setData(props.history.map(row => {
                return {
                    prop: row,
                    id: row.caseId + row.status + row.date + row.action,
                }
            }))
        }  
    }, [props])

    return (
        <div>
            <h4 className={styles.assetDetailsHeader}>Request History</h4>
            {data && 
                <CompactTable 
                    columns={COLUMNS} 
                    data={{nodes: data}} 
                    theme={theme} 
                    layout={{ fixedHeader: true }} 
                />
            }
        </div>
    )
}