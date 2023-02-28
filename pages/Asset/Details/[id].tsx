import React, { ReactNode, useCallback, useEffect, useState } from "react";
import { ModuleMain, ModuleHeader, ModuleContent } from "../../../components";
import { useRouter } from "next/router";
import axios from "axios";
import { CMMSAssetDetails } from "../../../types/common/interfaces";
import styles from "../../../styles/Asset.module.scss";
import { ThreeDots } from 'react-loading-icons';
import Image from "next/image";
import AssetHistory from "../../../components/Asset/AssetHistory";


// Get asset detail by psa id
const getAsset = async (id: number, use: string = "general") => {
    const url = use === "general" ? "/api/assetDetails/" : use === "history" ? "/api/asset/history/" : ""
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

const checkBase64 = (s: string): boolean => {
    const base64 = new RegExp("data:image")
    return base64.test(s);
}

// interface State {
//     hasError: boolean;
// }

// class ImgErrorBoundary extends React.Component<{children?: ReactNode}, State> {
//     public state: State = {
//         hasError: false
//     }

//     public static getDerivedStateFromError(_: Error): State {
//         return { hasError: true };
//     }

//     public componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
//         console.error(error, errorInfo);
//     }

//     public render() {
//         if(this.state.hasError)
//             return <h1>could not display image</h1>

//         return this.props.children;
//     }
// }

export default function AssetDetails() {
    const [assetDetail, setAssetDetail] = useState<CMMSAssetDetails>({} as CMMSAssetDetails);
    const [assetHistory, setAssetHistory] = useState<{history: string}[]>();
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
                getAsset(id, "history").then(history => {
                    setAssetDetail(result[0]);
                    setImgIsErr(!result[0].uploaded_image);
                    setAssetHistory(history);
                })
            });
        }
        setTimeout(() => {
            setIsLoading(false);
        }, 1000)  
    }, [psa_id, router]);

    return (
        <ModuleMain>
            <ModuleHeader header="Asset Detail"></ModuleHeader>
            <ModuleContent>
                {isLoading ? 
                    <div style={{ width: "100%", textAlign: "center" }}>
                        <ThreeDots fill="black" />
                    </div> 
                : 
                <>
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
                                // <ImgErrorBoundary>
                                <Image
                                    src={checkBase64(assetDetail.uploaded_image as string) ? assetDetail.uploaded_image as string : ""} 
                                    width={400} 
                                    height={400} 
                                    alt="" 
                                    onError={() => setImgIsErr(true)}
                                    className={styles.assetImage}
                                />
                                // </ImgErrorBoundary>
                            )}
                        </div>
                    </div>
                    {assetHistory?.length != 0 && <AssetHistory history={assetHistory} />}
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