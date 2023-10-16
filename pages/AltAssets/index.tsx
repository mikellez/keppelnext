import React, { useEffect, useState, useRef} from "react";
import { ModuleMain, ModuleHeader, ModuleContent } from "../../components";
import TooltipBtn from "../../components/TooltipBtn";
import { RiFileAddLine } from "react-icons/ri";
import Link from "next/link";
import instance from '../../types/common/axios.config';
import { AiOutlineSearch } from "react-icons/ai";
import styles from "../../styles/Asset.module.scss";
import { useRouter } from "next/router";
import { useCurrentUser } from "../../components/SWR";

import assetService from '../../services/assets';

import 'react-tabulator/lib/styles.css';
import { ReactTabulator } from 'react-tabulator'
import 'react-tabulator/lib/css/tabulator_semanticui.min.css'; // theme - can be changed with other default themes https://tabulator.info/examples/5.5?#theming 


// Using tabulator table library:

// Installation:
// https://tabulator.info/docs/5.5/frameworks#react

// Example using react component:
// https://github.com/ngduc/react-tabulator/blob/master/src/ReactTabulatorExample.tsx#L87


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

const Asset = () => {
    const { userPermission } = useCurrentUser();
    const [rowData, setRowData] = useState(); // Set rowData to Array of Objects, one Object per Row

    // React router
    const router = useRouter();

    let ref = useRef<any>();
    const columns = [
        {
        title:"Group",
        columns:[
            { title: "Plant Name", field: "plant_name", visible:false, resizable:false },
            { title: "System Name", field: "system_name", visible:false , resizable:false},
            { title: "System Asset", field: "system_asset", visible:false, resizable:false },
            { title: "System Asset Name", field: "system_asset_lvl5", visible:false, resizable:false},
            { title: "System Asset Name 2", field: "system_asset_lvl6", visible:false, resizable:false},
            { title: "Sub Component 1", field: "system_asset_lvl7", visible:false, resizable:false},
            { title: "Asset Type", field: "asset_type", visible:false, resizable:false},
            ],
        resizable:false,
        },
        { title: "Tag Name", field: "plant_asset_instrument", resizable:true},
        { title: "Description", field: "asset_description" , resizable:true},
        { title: "Location", field: "asset_location", resizable:true },
        { title: "Brand", field: "brand" , resizable:true},
        { title: "Model Number", field: "model_number", resizable:true},
        { title: "Capacity", field: "technical_specs" , resizable:true},
        { title: "Country of Manufacture", field: "manufacture_country", resizable:true },
        { title: "Warranty", field: "warranty", resizable:true},
        { title: "Remarks", field: "remarks" , resizable:true},
    ];
    const rowClick = (e: any, row: any) => {
        if (row.getData().psa_id) {
            // Implementation for open in a new tab
            // window.open(window.location.pathname + "/Details/" + row.getData().psa_id, "_blank");
            // Implementation for open in the same tab
            router.push("/Asset/Details/" + row.getData().psa_id);
        }
    };

    const tableEvents = {
        // Click on row brings you to particular asset page
        rowClick: rowClick
    }

    const groupHeaderFunc = (value, count : number, data, group) => {
            //value - the value all members of this group share
            //count - the number of rows in this group
            //data - an array of all the row data objects in this group
            //group - the group component for the group
            // group._group.field - Gets the field that the group is reading from:
            console.log(group._group); // Gets the field that the group is reading from:
            
            // For all preceding groups before asset_type:
            if(group._group.field == "plant_name" || 
            group._group.field == "system_name"
            ){
                return value;
            }
            /*Pending logic for how the different fields relate to each other*/

            // system_asset_lvl_5
            if(group._group.field == "system_asset" || group._group.level == 2){
                if(group._group.key == group._group.parent.key || group._group.key == ""){
                    return "<span style='color:rgb(0, 0, 255); margin-left:10px;'>(" + group._group.getSubGroups().length + " System Assets)</span>";
                }
                else{
                    return value;
                }
            }

            // For asset_type:
            if(group._group.field == "asset_type" || group._group.level == 6){
                // If asset_type same as parent:
                if(group._group.key == group._group.parent.key){
                    /*
                    console.log(group._group.getRows()); // Can get the rows
                    console.log(group._group.parent.getSubGroups()); // Can get the subgroups
                    console.log('ref table: ', ref.current); // this is the Tabulator table instance
                    */
                    return "<span style='color:rgb(0, 0, 255); margin-left:10px;'>(" + count + " tag assets)</span>";
                }
                else if(group._group.key != 'NA'){
                    return value + "<span style='color:#d00; margin-left:10px;'>(" + count + " tag assets)</span>";
                }
            }

            // system_asset_lvl_5
            if(group._group.level == 3){
                if(group._group.key == group._group.parent.key || group._group.key == ""){
                    return "<span style='color:rgb(0, 0, 255); margin-left:10px;'>(" + group._group.getSubGroups().length + " System Asset Names)</span>";
                }
                else{
                    return value;
                }
            }

            // system_asset_lvl_6
            if(group._group.level == 4){
                if(group._group.key == group._group.parent.key || group._group.key == ""){
                    return "<span style='color:rgb(0, 0, 255); margin-left:10px;'>(" + group._group.getSubGroups().length + " System Asset Names)</span>";
                }
                else{
                    return value;
                }
            }

            // system_asset_lvl_7
            if(group._group.level == 5){
                if(group._group.key == group._group.parent.key || group._group.key == ""){
                    return "<span style='color:rgb(0, 0, 255); margin-left:10px;'>(" + group._group.getSubGroups().length + " Sub Components)</span>";
                }
                else{
                    return value;
                }
            }

            return value + "<span style='color:#d00; margin-left:10px;'>(" + count + " items)</span>";
    }

    const groupByArr = [
        "plant_name", 
        "system_name",
        // For some reason these functions make the field for the group object false 
        function(data){
            //data - the data object for the row being grouped
            if(data.system_asset && data.system_asset != "")
                return data.system_asset; //groups by system_asset
            return ""; // represents base layer of current asset lvl
        },
        function(data){
            //data - the data object for the row being grouped
            if(data.system_asset_lvl5 && data.system_asset_lvl5 != "")
                return data.system_asset_lvl5; //groups by system_asset_lvl5
            return ""; // represents base layer of current asset lvl
        },
        function(data){
            //data - the data object for the row being grouped
            if(data.system_asset_lvl6 && data.system_asset_lvl6 != "")
                return data.system_asset_lvl6; //groups by system_asset_lvl6
            return ""; // represents base layer of current asset lvl
        },
        function(data){
            //data - the data object for the row being grouped
            if(data.system_asset_lvl7 && data.system_asset_lvl7 != "")
                return data.system_asset_lvl7; //groups by system_asset_lvl7
            return ""; // represents base layer of current asset lvl
        },
        function(data){
            //data - the data object for the row being grouped
            if(!(data.asset_type == data.parent_asset)){
                if(data.asset_type != 'NA'){
                    return data.asset_type; // represents base layer of current asset lvl
                }
                return "";
            }
            else{
                return "";
            }
        },
    ]

    const options = {
        // Group By these columns:
        groupBy:groupByArr, 
        groupStartOpen:false,
        groupHeader:groupHeaderFunc,
        placeholder:"No Data Available",
        placeholderHeaderFilter:"No Matching Data", //display message to user on empty table due to header filters
        columnDefaults:{
            minWidth:120, //set the minWidth on all columns to 120px
        },
        //height:"500px", // set fixed max height for table
        // note: setting fixed max height will have a scroll bar, but the scrollbar currently
        // has a bug (https://github.com/olifolkerd/tabulator/issues/4219) so temporarily will just leave the table as unlimited height
        }

    // Get request to fetch all the assets from db on 1st page render
    useEffect(() => {
        assetService.getAssets().then((data) => {
            setRowData(data);
        });
    }, []);

    return (
        <ModuleMain>
            <ModuleHeader header="Asset Management">
                <div className={styles.gridSearch}>
                    <input
                        type="text"
                        placeholder="Search..."
                        onChange={(e) => {
                            // Clear any existing filters and search all fields for all occurances of the search term
                            if (ref.current){
                                ref.current.clearFilter();
                                ref.current.addFilter([
                                    [
                                        {field:"plant_name", type:"like", value:e.target.value},
                                        {field:"system_name", type:"like", value:e.target.value},
                                        {field:"system_asset", type:"like", value:e.target.value},
                                        {field:"parent_asset", type:"like", value:e.target.value},
                                        {field:"asset_type", type:"like", value:e.target.value},
                                        {field:"plant_asset_instrument", type:"like", value:e.target.value},
                                        {field:"asset_location", type:"like", value:e.target.value},
                                        {field:"brand", type:"like", value:e.target.value},
                                        {field:"model_number", type:"like", value:e.target.value},
                                        {field:"technical_specs", type:"like", value:e.target.value},
                                        {field:"manufacture_country", type:"like", value:e.target.value},
                                        {field:"warranty", type:"like", value:e.target.value},
                                        {field:"remarks", type:"like", value:e.target.value},
                                    ]
                                ])
                            } 
                        }}
                    />
                    <AiOutlineSearch size={20} color="#3C4048" />
                </div>
                {userPermission('canCreateAsset') &&
                    <Link href="/Asset/New">
                        <TooltipBtn text="Create new asset">
                            <RiFileAddLine size={20} />
                        </TooltipBtn>
                    </Link>
                }
            </ModuleHeader>
            <ModuleContent>
                <ReactTabulator
                    onRef={(r) => (ref = r)}
                    events={tableEvents}
                    data={rowData}
                    options={options}
                    columns={columns}
                    layout={"fitColumns"}
                    />
            </ModuleContent>
        </ModuleMain>
    );
};

export default Asset;
