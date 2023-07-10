import React, { ReactNode, useCallback, useEffect, useState } from "react";
import {
  ModuleMain,
  ModuleHeader,
  ModuleContent,
  ModuleFooter,
  ModuleModal,
} from "../../../components";
import { useRouter } from "next/router";
import instance from "../../../types/common/axios.config";
import {
  CMMSAssetDetails,
  CMMSAssetRequestHistory,
  CMMSAssetChecklistHistory,
  CMMSAssetHistory,
  CMMSChangeOfParts,
} from "../../../types/common/interfaces";
import styles from "../../../styles/Asset.module.scss";
import { ThreeDots } from "react-loading-icons";
import Image from "next/image";
import AssetRequestHistory from "../../../components/Asset/AssetHistory/AssetRequestHistory";
import AssetChecklistHistory from "../../../components/Asset/AssetHistory/AssetChecklistHistory";
import AssetHierachy from "../../../components/Asset/AssetHierachy";
import Link from "next/link";
import TooltipBtn from "../../../components/TooltipBtn";
import { AiOutlineHistory } from "react-icons/ai";
import { GetServerSideProps, GetServerSidePropsContext } from "next";
import { HiOutlinePencilAlt } from "react-icons/hi";
import { TbExchange } from "react-icons/tb";
import COPTable from "../../../components/ChangeOfParts/COPTable";
import AssetHistoryModalContainer from "../../../components/Asset/AssetHistory/AssetHistoryModalContainer";

// Get asset detail by psa id
const getAsset = async (id: number) => {
  const url = "/api/assetDetails/";
  return await instance
    .get(url + id)
    .then((res) => {
      return res.data;
    })
    .catch((err) => {
      console.log(err.response);
      return err.response.status;
    });
};

// Fetch asset history
const getAssetHistory = async (id: number, type: string = "request") => {
  const url = "/api/asset/history/" + type + "/";
  const history = await instance
    .get(url + id)
    .then((res) => {
      return res.data;
    })
    .catch((err) => {
      console.log(err.response);
      return err.response.status;
    });

  if (history && history != "no history") {
    return history;
  }
};

const checkBase64 = (s: string): boolean => {
  const base64 = new RegExp("data:image");
  return base64.test(s);
};

export default function AssetDetails(props: {
  assetHistory: [CMMSAssetHistory];
  COPHistory: [CMMSChangeOfParts];
}) {
  const [assetDetail, setAssetDetail] = useState<CMMSAssetDetails>(
    {} as CMMSAssetDetails
  );

  const [assetRequestHistory, setAssetRequestHistory] =
    useState<CMMSAssetRequestHistory[]>();
  const [assetChecklistHistory, setAssetChecklistHistory] =
    useState<CMMSAssetChecklistHistory[]>();

  const [imgIsErr, setImgIsErr] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [assetHistoryModal, setAssetHistoryModal] = useState<boolean>(false);
  const [COPHistoryModal, setCOPHistoryModal] = useState<boolean>(false);
  const [COPData, setCOPData] = useState<CMMSChangeOfParts[]>(props.COPHistory);

  const [fileIsErr, setFileIsErr] = useState<boolean>(false);
  type UploadedFile = [string, string];
  const [fileraw, setfileraw] = useState<UploadedFile[]>([]);

  const router = useRouter();
  const psa_id = router.query.id;
  useEffect(() => {
    setIsLoading(true);
    if (psa_id) {
      const id = parseInt(psa_id as string);
      getAsset(id).then((result) => {
        if (!result || result.length == 0) router.replace("/404");
        getAssetHistory(id).then((rhistory) => {
          getAssetHistory(id, "checklist").then((chistory) => {
            setAssetDetail(result[0]);
            setImgIsErr(!result[0].uploaded_image);
            setfileraw(result[0].uploaded_files);
            if (rhistory) setAssetRequestHistory(rhistory);
            if (chistory) setAssetChecklistHistory(chistory);
          });
        });
      });
    }
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  }, [psa_id, router]);
  var filename = [""];
  var filevalue = [""];
  if (fileraw !== undefined && fileraw !== null && fileraw.length > 0) {
    filename = fileraw.map((file) => file[0]);
    filevalue = fileraw.map((file) => file[1]);
  }

  const filesToDownload = filevalue.map((file, index) => {
    return (
      <tr key={index}>
        <Link href={file} download={filename[index]}>
          {filename[index]}
        </Link>
      </tr>
    );
  });

  useEffect(() => {
    props.assetHistory.map((history) => {
      console.log("model data" + history);
    });
  }, [props.assetHistory]);

  const formatDate = (oldDate: string) => {
    let strArray = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    const date = new Date(oldDate);
    let y = date.getFullYear();
    let d = date.getDate();
    let m = strArray[date.getMonth()];

    let hr = date.getHours();
    let min: number | string = date.getMinutes();
    if (min < 10) {
      min = "0" + min.toString();
    }
    let ampm = "AM";
    if (hr > 12) {
      hr -= 12;
      ampm = "PM";
    }
    return `${d} ${m} ${y} at ${hr}:${min} ${ampm}`;
  };

  return (
    <ModuleMain>
      <ModuleHeader header="Asset Details">
        <Link href={`/Asset/Edit/${psa_id}`}>
          <TooltipBtn text="Edit Asset">
            <HiOutlinePencilAlt size={20} />
          </TooltipBtn>
        </Link>
        <TooltipBtn
          text="View Change of Parts Details"
          onClick={() => setCOPHistoryModal(true)}
        >
          <TbExchange size={20} />
        </TooltipBtn>
        <TooltipBtn
          text="View Asset History"
          onClick={() => setAssetHistoryModal(true)}
        >
          <AiOutlineHistory size={20} />
        </TooltipBtn>
        <button className="btn btn-secondary" onClick={() => router.back()}>
          Back
        </button>
      </ModuleHeader>
      <ModuleContent>
        {isLoading ? (
          <div style={{ width: "100%", textAlign: "center" }}>
            <ThreeDots fill="black" />
          </div>
        ) : (
          <>
            <h4 className={styles.assetDetailsHeader}>Overview</h4>
            <div className={styles.assetDetails}>
              <table className={styles.assetTable}>
                <tbody>
                  <tr>
                    <th>Asset Name</th>
                    <td>
                      {assetDetail.asset_name ? assetDetail.asset_name : "-"}
                    </td>
                  </tr>
                  <tr>
                    <th>Asset Hierarchy</th>
                    <td>
                      {/* {assetDetail.plant_name} 
                                        {assetDetail.system_name} 
                                        {assetDetail.system_asset}  */}
                      {assetDetail && <AssetHierachy asset={assetDetail} />}
                    </td>
                  </tr>
                  <tr>
                    <th>Description</th>
                    <td>
                      {assetDetail.asset_description
                        ? assetDetail.asset_description
                        : "-"}
                    </td>
                  </tr>
                  <tr>
                    <th>Brand</th>
                    <td>{assetDetail.brand ? assetDetail.brand : "-"}</td>
                  </tr>
                  <tr>
                    <th>Model Number</th>
                    <td>
                      {assetDetail.model_number
                        ? assetDetail.model_number
                        : "-"}
                    </td>
                  </tr>
                  <tr>
                    <th>Technical Spec</th>
                    <td>
                      {assetDetail.technical_specs
                        ? assetDetail.technical_specs
                        : "-"}
                    </td>
                  </tr>
                  <tr>
                    <th>Location</th>
                    <td>
                      {assetDetail.asset_location
                        ? assetDetail.asset_location
                        : "-"}
                    </td>
                  </tr>
                  <tr>
                    <th>Country of Manufacture</th>
                    <td>
                      {assetDetail.manufacture_country
                        ? assetDetail.manufacture_country
                        : "-"}
                    </td>
                  </tr>
                  <tr>
                    <th>Warranty Expiry Date</th>
                    <td>{assetDetail.warranty ? assetDetail.warranty : "-"}</td>
                  </tr>
                  <tr>
                    <th>Remarks</th>
                    <td>{assetDetail.remarks ? assetDetail.remarks : "-"}</td>
                  </tr>
                  <tr>
                    <th>Files</th>
                    <td>{fileraw ? filesToDownload : "-"}</td>
                    {/* <td>{fileraw[0]}</td> */}
                  </tr>
                </tbody>
              </table>
              <div>
                {!imgIsErr && (
                  <Image
                    src={
                      checkBase64(assetDetail.uploaded_image as string)
                        ? (assetDetail.uploaded_image as string)
                        : ""
                    }
                    width={400}
                    height={400}
                    alt=""
                    onError={() => setImgIsErr(true)}
                    className={styles.assetImage}
                  />
                )}
              </div>
            </div>
            {/* {assetRequestHistory && (
              <AssetRequestHistory
                history={assetRequestHistory as CMMSAssetRequestHistory[]}
              />
            )}
            {assetChecklistHistory && (
              <AssetChecklistHistory
                history={assetChecklistHistory as CMMSAssetChecklistHistory[]}
              />
            )} */}
          </>
        )}
      </ModuleContent>
      <ModuleModal
        isOpen={assetHistoryModal}
        closeModal={() => setAssetHistoryModal(false)}
        closeOnOverlayClick={true}
      >
        <AssetHistoryModalContainer
          checklistHistory={assetChecklistHistory!}
          requestHistory={assetRequestHistory!}
          assetHistory={props.assetHistory}
          // page={page}
        />
        {/* <table className="assetHistoryTable table">
          <thead>
            <tr>
              <th>Action</th>
              <th>User</th>
              <th style={{ width: "12rem" }}>Date</th>
              <th>Fields Changed</th>
            </tr>
          </thead>
          <tbody>
            {props.assetHistory.map((history: CMMSAssetHistory) => {
              return (
                <tr key={history.history_id}>
                  <td>{history.action}</td>
                  <td>{history.name}</td>
                  <td>{formatDate(history.date.toString())}</td>
                  <td>{history.fields}</td>
                </tr>
              );
            })}
          </tbody>
        </table> */}
      </ModuleModal>
      <ModuleModal
        isOpen={COPHistoryModal}
        closeModal={() => setCOPHistoryModal(false)}
        closeOnOverlayClick={true}
      >
        <COPTable changeOfParts={COPData} isDisabledSelect={true} />

        <Link href={`/ChangeOfParts/New?assetId=${psa_id}`}>
          <TooltipBtn toolTip={false}>Create New Change of Parts</TooltipBtn>
        </Link>
      </ModuleModal>
    </ModuleMain>
  );
}

export const getServerSideProps: GetServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const headers = {
    withCredentials: true,
    headers: {
      Cookie: context.req.headers.cookie,
    },
  };

  const psaId = context.query.id;
  const assetHistory = await instance.get(
    `/api/asset/history/` + psaId,
    headers
  );
  const COPHistory = await instance.get(
    `/api/changeOfParts/?psa_id=` + psaId,
    headers
  );

  return {
    props: { assetHistory: assetHistory.data, COPHistory: COPHistory.data },
  };
};
