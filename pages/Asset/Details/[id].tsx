import React, { useEffect, useState } from "react";
import { ModuleMain, ModuleHeader, ModuleContent } from "../../../components";
import { useRouter } from "next/router";
import axios from "axios";
import { CMMSAsset } from "../../../types/common/interfaces";
import styles from "../../../styles/Asset.module.scss";

interface CMMSAssetDetails extends CMMSAsset {
    plant_name: string;
    system_name: string;
    system_asset: string;
    parent_asset: string;
    asset_type: string;
    asset_description?: string;
    asset_location?: string;
    brand?: string;
    model_number?: string;
    technical_specs?: string;
    manufacture_country?: string;
    warranty?: string;
    remarks?: string;
    uploaded_image?: string;
    uploaded_files?: string;
    plant_id: number;
    system_id: number;
    system_asset_id: number;
    system_asset_lvl5?: string;
    system_asset_lvl6?: string;
    system_asset_lvl7?: string;
}

// Get asset detail by psa id
const getAsset = async (id: number) => {
    return await axios
        .get("/api/assetDetails/" + id)
        .then((res) => {
            return res.data;
        })
        .catch((err) => {
            console.log(err.response);
            return err.response.status;
        });
};

export default function AssetDetails() {
    const [assetDetail, setAssetDetail] = useState<CMMSAssetDetails>({} as CMMSAssetDetails);
    const [imgIsErr, setImgIsErr] = useState<boolean>(false);

    const router = useRouter();
    const psa_id = router.query.id;
    useEffect(() => {
        if (psa_id)
            getAsset(parseInt(psa_id as string)).then((result) => {
                if (!result || result.length == 0) router.replace("/404");
                setAssetDetail(result[0]);
                setImgIsErr(result[0].uploaded_image);
            });
    }, [psa_id, router]);
    console.log(assetDetail);
    return (
        <ModuleMain>
            <ModuleHeader header="Asset Detail"></ModuleHeader>
            <ModuleContent>
                <div className={styles.assetDetails}>
                    <table className={styles.assetTable}>
                        <tbody>
                            <tr>
                                <th>Asset Name</th>
                                <td>{assetDetail.asset_name ? assetDetail.asset_name : "-"}</td>
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
                        {imgIsErr && (
                            <img
                                className={styles.assetImage}
                                src={assetDetail.uploaded_image}
                                alt="Asset Image"
                                onError={() => setImgIsErr(false)}
                            />
                        )}
                    </div>
                </div>
            </ModuleContent>
        </ModuleMain>
    );
}
