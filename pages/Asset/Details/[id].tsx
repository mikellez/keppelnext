import React, { ReactNode, useCallback, useEffect, useState } from "react";
import { ModuleMain, ModuleHeader, ModuleContent } from "../../../components";
import { useRouter } from "next/router";
import axios from "axios";
import { CMMSAssetDetails, CMMSAssetRequestHistory, CMMSAssetChecklistHistory } from "../../../types/common/interfaces";
import styles from "../../../styles/Asset.module.scss";
import { ThreeDots } from 'react-loading-icons';
import Image from "next/image";
import AssetRequestHistory from "../../../components/Asset/AssetRequestHistory";
import AssetChecklistHistory from "../../../components/Asset/AssetChecklistHistory";
import AssetHierachy from "../../../components/Asset/AssetHierachy";

// Get asset detail by psa id
const getAsset = async (id: number) => {
    const url =  "/api/assetDetails/" 
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
    const url =  "/api/asset/history/" + type + "/"
    const history =  await axios
        .get(url + id)
        .then((res) => {
            return res.data;
        })
        .catch((err) => {
            console.log(err.response);
            return err.response.status;
        });

    if (history && history != "no history") {
        return history
    }
}

const checkBase64 = (s: string): boolean => {
    const base64 = new RegExp("data:image")
    return base64.test(s);
}

export default function AssetDetails() {
    const [assetDetail, setAssetDetail] = useState<CMMSAssetDetails>({} as CMMSAssetDetails);
    const [assetRequestHistory, setAssetRequestHistory] = useState<CMMSAssetRequestHistory[]>();
    const [assetChecklistHistory, setAssetChecklistHistory] = useState<CMMSAssetChecklistHistory[]>();
    const [imgIsErr, setImgIsErr] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const router = useRouter();
    const psa_id = router.query.id;

    useEffect(() => {
        setIsLoading(true);
        if (psa_id) {
            const id = parseInt(psa_id as string);
            getAsset(id).then((result) => {
                if (!result || result.length == 0) router.replace("/404");
                getAssetHistory(id).then(rhistory => {
                    getAssetHistory(id, "checklist").then(chistory => {
                        setAssetDetail(result[0]);
                        setImgIsErr(!result[0].uploaded_image);
                        if (rhistory) setAssetRequestHistory(rhistory);
                        if (chistory) setAssetChecklistHistory(chistory);
                    })
                })
            });
        }
        setTimeout(() => {
            setIsLoading(false);
        }, 1000)  
    }, [psa_id, router]);

    return (
        <ModuleMain>
            <ModuleHeader header="Asset Details"></ModuleHeader>
            <ModuleContent>
                {isLoading ? 
                    <div style={{ width: "100%", textAlign: "center" }}>
                        <ThreeDots fill="black" />
                    </div> 
                : 
                <>
                    <h4 className={styles.assetDetailsHeader}>Overview</h4>
                    <div className={styles.assetDetails}>
                        <table className={styles.assetTable}>
                            <tbody>
                                <tr>
                                    <th>Asset Name</th>
                                    <td>{assetDetail.asset_name ? assetDetail.asset_name : "-"}</td>
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
                                    <td>{assetDetail.model_number ? assetDetail.model_number : "-"}</td>
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
                                        {assetDetail.asset_location ? assetDetail.asset_location : "-"}
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
                            </tbody>
                        </table>
                        <div>
                            {!imgIsErr && (
                                <Image
                                    src={checkBase64(assetDetail.uploaded_image as string) ? assetDetail.uploaded_image as string : ""} 
                                    width={400} 
                                    height={400} 
                                    alt="" 
                                    onError={() => setImgIsErr(true)}
                                    className={styles.assetImage}
                                />
                            )}
                        </div>
                    </div>
                    {assetRequestHistory && <AssetRequestHistory history={assetRequestHistory as CMMSAssetRequestHistory[]} />}
                    {assetChecklistHistory && <AssetChecklistHistory history={assetChecklistHistory as CMMSAssetChecklistHistory[]} />}
                </>
                }
            </ModuleContent>
        </ModuleMain>
    );
}

/* 
___.Biopolis
 |___.Customer Station
   |___.Customer
*/