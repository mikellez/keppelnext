import React, { useEffect, useState } from "react";
import { ModuleMain, ModuleHeader, ModuleContent } from "../../../components";
import { useRouter } from "next/router";
import axios from "axios";
import { CMMSAsset } from "../../../types/common/interfaces";

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

    const router = useRouter();
    const psa_id = router.query.id;
    useEffect(() => {
        if (psa_id)
            getAsset(parseInt(psa_id as string)).then((result) => {
                console.log(result);
                if (!result || result.length == 0) router.replace("/404");
                else setAssetDetail(result[0]);
            });
    }, [psa_id, router]);
    return (
        <ModuleMain>
            <ModuleHeader header="Asset Detail"></ModuleHeader>
            <ModuleContent></ModuleContent>
        </ModuleMain>
    );
}
