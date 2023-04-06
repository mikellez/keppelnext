import React, { ReactNode, useCallback, useEffect, useState } from "react";
import {
  ModuleMain,
  ModuleHeader,
  ModuleContent,
  ModuleFooter,
  ModuleModal,
} from "../../../components";
import { useRouter } from "next/router";
import axios from "axios";
import {
  CMMSAssetDetails,
  CMMSAssetRequestHistory,
  CMMSAssetChecklistHistory,
  CMMSAssetHistory,
} from "../../../types/common/interfaces";
import styles from "../../../styles/Asset.module.scss";
import { ThreeDots } from "react-loading-icons";
import Image from "next/image";
import AssetRequestHistory from "../../../components/Asset/AssetRequestHistory";
import AssetChecklistHistory from "../../../components/Asset/AssetChecklistHistory";
import AssetHierachy from "../../../components/Asset/AssetHierachy";
import Link from "next/link";
import TooltipBtn from "../../../components/TooltipBtn";
import { AiOutlineHistory } from "react-icons/ai";
import { GetServerSideProps, GetServerSidePropsContext } from "next";
import { HiOutlinePencilAlt } from "react-icons/hi";

// Get asset detail by psa id
const getAsset = async (id: number) => {
  const url = "/api/assetDetails/";
  return await axios
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
  const history = await axios
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

export default function AssetDetails(props: { history: [CMMSAssetHistory] }) {
  const [assetDetail, setAssetDetail] = useState<CMMSAssetDetails>(
    {} as CMMSAssetDetails
  );

  const [assetRequestHistory, setAssetRequestHistory] =
    useState<CMMSAssetRequestHistory[]>();
  const [assetChecklistHistory, setAssetChecklistHistory] =
    useState<CMMSAssetChecklistHistory[]>();

  const [imgIsErr, setImgIsErr] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [historyModal, setHistoryModal] = useState<boolean>(false);

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
          text="View Asset History"
          onClick={() => setHistoryModal(true)}
        >
          <AiOutlineHistory size={20} />
        </TooltipBtn>
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
                  <span>
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
                      <td>
                        {assetDetail.warranty ? assetDetail.warranty : "-"}
                      </td>
                    </tr>
                    <tr>
                      <th>Remarks</th>
                      <td>{assetDetail.remarks ? assetDetail.remarks : "-"}</td>
                    </tr>
                  </span>
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
            {assetRequestHistory && (
              <AssetRequestHistory
                history={assetRequestHistory as CMMSAssetRequestHistory[]}
              />
            )}
            {assetChecklistHistory && (
              <AssetChecklistHistory
                history={assetChecklistHistory as CMMSAssetChecklistHistory[]}
              />
            )}
          </>
        )}
      </ModuleContent>
      <ModuleModal
        isOpen={historyModal}
        closeModal={() => setHistoryModal(false)}
        closeOnOverlayClick={true}
      >
        <table className="assetHistoryTable table">
          <thead>
            <tr>
              <th>Action</th>
              <th>User</th>
              <th style={{ width: "12rem" }}>Date</th>
              <th>Fields Changed</th>
            </tr>
          </thead>
          <tbody>
            {props.history.map((history: CMMSAssetHistory) => {
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
        </table>
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
  const history = await axios.get(
    "http://localhost:3001/api/asset/history/" + psaId,
    headers
  );
  return { props: { history: history.data } };
};
