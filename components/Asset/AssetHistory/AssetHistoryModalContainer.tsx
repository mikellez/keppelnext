import React, { useEffect, useState } from "react";
import {
  CMMSAssetChecklistHistory,
  CMMSAssetHistory,
  CMMSAssetRequestHistory,
} from "../../../types/common/interfaces";
import { ModuleContent } from "../../ModuleLayout/ModuleContent";
import {
  Table,
  Header,
  HeaderRow,
  HeaderCell,
  Body,
  Row,
  Cell,
  OnClick,
} from "@table-library/react-table-library";
import AssetChecklistHistory from "./AssetChecklistHistory";
import AssetRequestHistory from "./AssetRequestHistory";
import AssetHistory from "./AssetHistory";
import Pagination from "../../Pagination";

export default function AssetHistoryModalContainer({
  // checklistHistory,
  // requestHistory,
  assetHistory,
  id,
  page
}: //   page,
{
  // checklistHistory: CMMSAssetChecklistHistory[];
  // requestHistory: CMMSAssetRequestHistory[];
  assetHistory: {
    rows: CMMSAssetHistory[],
    total: number
  };
  id: number;
  page: number;
}) {
  const [activeTabIndex, setActiveTabIndex] = useState<number>(0);
  const [isReady, setIsReady] = useState<boolean>(true);
  //   const [shownData, setShownData] = useState([]);
  //   const [currPage, setCurrPage] = useState<number>(1);

  const switchColumns = (index: number) => {
    if (isReady) {
      //   setIsReady(false);
      setActiveTabIndex(index);
      // setPage(1);
    }
  };

  useEffect(() => {
  }, [activeTabIndex]);

  return (
    <ModuleContent>
      {
        <ul className="nav nav-tabs">
          <li
            onClick={() => {
              activeTabIndex !== 0 && setActiveTabIndex(0);
            }}
            className={"nav-link" + (activeTabIndex === 0 ? " active" : "")}
          >
            <span style={{ all: "unset" }}>Asset History</span>
          </li>
          <li
            onClick={() => {
              activeTabIndex !== 1 && setActiveTabIndex(1);
            }}
            className={"nav-link" + (activeTabIndex === 1 ? " active" : "")}
          >
            <span style={{ all: "unset" }}>Request History</span>
          </li>
          <li
            onClick={() => {
              activeTabIndex !== 2 && setActiveTabIndex(2);
            }}
            className={"nav-link" + (activeTabIndex === 2 ? " active" : "")}
          >
            <span style={{ all: "unset" }}>Checklist History</span>
          </li>
        </ul>
      }
      {/* {isReady && shownData.length === 0 && <div></div>} */}
      {/* {isReady} */}
      {activeTabIndex == 0 ? (
        <AssetHistory id={id}/>
      ) : activeTabIndex == 1 ? (
        <AssetRequestHistory id={id} />
      ) : activeTabIndex == 2 ? (
        <AssetChecklistHistory id={id} />
      ) : (
        <div>No History</div>
      )}
    </ModuleContent>
  );
}
