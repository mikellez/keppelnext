import React, { useCallback, useEffect, useState, useMemo } from "react";
import { ModuleMain, ModuleHeader, ModuleContent } from "../../components";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-enterprise";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import TooltipBtn from "../../components/TooltipBtn";
import { RiFileAddLine } from "react-icons/ri";
import Link from "next/link";
import instance from '../../types/common/axios.config';
import { GridApi, ValueGetterParams } from "ag-grid-enterprise";
import { ColDef, IRowNode, GridOptions, RowDoubleClickedEvent } from "ag-grid-community";
import { AiOutlineSearch } from "react-icons/ai";
import styles from "../../styles/Asset.module.scss";
import { useRouter } from "next/router";

/*
  EXPLANATION OF ASSETS MODULE

  Each asset includes many subcomponents that follow a hierarchy as shown below:

  # Asset 1 
    # Plant 1 (Lvl 3)
        # System 1 (Lvl 4)
            # System Asset 1 (Lvl 5)
                # Asset Type 
                # System Asset Name (Lvl 6)
                    # Sub-Component (Lvl 7)
  # Asset 2
    # Plant 2 (Lvl 3)
        # System 2 (Lvl 4)
            # System Asset 2 (Lvl 5)
                # Asset Type 
                # System Asset Name (Lvl 6)
                    # Sub-Component (Lvl 7)
  .
  . 
  .


  The index page shows the asset management page, which displays a list of all assets(records) 
  organised by the hierarchy mentioned above
  This serves as the default landing page for the assets module

  The 'New' page shows the new Asset creation page, which can be navigated to by clicking the "Create New Asset"
  button beside the Search bar on the top right of the index page

*/


// Get request to fetch all the assets from db
const getAssets = async () => {
    return await instance
        .get("/api/asset")
        .then((res) => {
            return res.data;
        })
        .catch((err) => {
            console.log(err);
        });
};

const Asset = () => {
    const [rowData, setRowData] = useState(); // Set rowData to Array of Objects, one Object per Row
    // Store gridApi as a state, this is very useful
    const [gridApi, setGridApi] = useState<GridApi>();
    // Store selected row in a state
    const [selectedRow, setSelectedRow] = useState<IRowNode>();

    // React router
    const router = useRouter();

    // Each Column Definition results in one Column.
    const [columnDefs, setColumnDefs] = useState<ColDef[]>([
        {
            field: "plant_name",
            hide: true,
            rowGroup: true,
        },
        {
            field: "system_name",
            hide: true,
            rowGroup: true,
        },
        {
            field: "system_asset",
            hide: true,
            rowGroup: true,
            valueGetter: function (params: ValueGetterParams) {
                // if select up to system asset name with an asset tag
                if (params.data.system_asset_name != '') {
                    return params.data.system_asset_name;
                }
                else{
                    return null;
                }
            },
        },
        //if parent asset same as system asset add the tagname else show parent
        {
            field: "system_asset_name",
            hide: true,
            rowGroup: true,
            valueGetter: function (params: ValueGetterParams) {
                // if select up to system asset name with an asset tag
                if (params.data.system_asset_name_2 != '') {
                    return params.data.system_asset_name_2;
                }
                else{
                    return null;
                }
            },
        },

        {
            // 2nd last option
            field: "psa.system_asset_lvl5",
            hide: true,
            rowGroup: true,
            valueGetter: function (params: ValueGetterParams) {
                if (params.data.system_asset_lvl5 != "") {
                    return params.data.system_asset_lvl5;
                }
                else{
                    return null;
                }
            },
        },
        {
            // last option
            field: "psa.system_asset_lvl6",
            hide: true,
            rowGroup: true,
            valueGetter: function (params: ValueGetterParams) {
                if (params.data.system_asset_lvl6 != "") {
                    return params.data.system_asset_lvl6;
                }
                else{
                    return null;
                }
            },
        },
        {
            // last option
            field: "psa.system_asset_lvl7",
            hide: true,
            rowGroup: true,
            valueGetter: function (params: ValueGetterParams) {
                if (params.data.system_asset_lvl7 != "") {
                    return params.data.system_asset_lvl7;
                }
                else{
                    return null;
                }
            },
        },
        {
            field: "asset_type",
            hide: true,
            rowGroup: true,
            valueGetter: function (params: ValueGetterParams) {
                // if select up to system asset name with an asset tag
                if ( params.data.asset_type == params.data.parent_asset) {
                    return null;
                }
                else if (params.data.asset_type != 'NA') {
                    return params.data.asset_type;
                }
            },
        },



        {
            headerName: "Tag Name",
            field: "plant_asset_instrument",
            rowGroup: false,
        },
        {
            headerName: "Description",
            field: "asset_description",
        },
        {
            headerName: "Location",
            field: "asset_location",
        },
        {
            headerName: "Brand",
            field: "brand",
        },
        {
            headerName: "Model Number",
            field: "model_number",
        },
        {
            headerName: "Capacity",
            field: "technical_specs",
        },
        {
            headerName: "Country of Manafacture",
            field: "manufacture_country",
        },
        {
            headerName: "Warranty",
            field: "warranty",
        },
        {
            headerName: "Remarks",
            field: "remarks",
        },
    ]);

    // const onRowSelected = useCallback((event: RowSelectedEvent) => {
    // 	if (event.node.isSelected() && event.node.data) setSelectedRow(event.node);
    // }, []);

    const handleDoubleClicked = useCallback((event: RowDoubleClickedEvent) => {
        if (event.node.data) {
            // Implementation for open in a new tab
            // window.open(window.location.pathname + "/Details/" + event.node.data.psa_id, "_blank");
            // Implementation for open in the same tab
            router.push("/Asset/Details/" + event.node.data.psa_id);
        }
    }, [router]);

    // Grid customisations
    const gridOptions = useMemo<GridOptions>(() => {
        return {
            animateRows: true,
            autoGroupColumnDef: {
                cellRendererParams: {
                    suppressCount: true,
                },
            },
            rowSelection: "single",
            groupDisplayType: "singleColumn",
            groupAllowUnbalanced: true,
            cacheQuickFilter: true,
            editType: "fullRow",
        };
    }, []);

    // Grid customisations
    const defaultColDef = useMemo<ColDef>(() => {
        return {
            minWidth: 300,
            suppressMenu: true,
            resizable: true,
            filter: true,
            suppressMovable: true,
        };
    }, []);

    useEffect(() => {
        getAssets().then((data) => {
            setRowData(data);
        });
    }, []);

    return (
        <ModuleMain>
            <ModuleHeader header="Asset Management">
                <div className={styles.gridSearch}>
                    <input
                        type="text"
                        placeholder="Seach..."
                        onChange={(e) => {
                            if (gridApi) gridApi.setQuickFilter(e.target.value);
                        }}
                    />
                    <AiOutlineSearch size={20} color="#3C4048" />
                </div>
                <Link href="/Asset/New">
                    <TooltipBtn text="Create new asset">
                        <RiFileAddLine size={20} />
                    </TooltipBtn>
                </Link>
            </ModuleHeader>
            <ModuleContent>
                <div className="ag-theme-alpine" style={{ height: 500, width: "100%" }}>
                    <AgGridReact
                        rowData={rowData}
                        gridOptions={gridOptions}
                        // onRowSelected={onRowSelected}
                        defaultColDef={defaultColDef}
                        columnDefs={columnDefs}
                        onGridReady={(params) => {
                            setGridApi(params.api);
                        }}
                        onRowDoubleClicked={handleDoubleClicked}
                    ></AgGridReact>
                </div>
            </ModuleContent>
        </ModuleMain>
    );
};

export default Asset;
