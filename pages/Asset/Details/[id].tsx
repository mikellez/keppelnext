import React from "react";
import { ModuleMain, ModuleHeader, ModuleContent } from '../../../components';
import { useRouter } from "next/router";
import axios from "axios";

const validateAsset = (id: number) => {
    return axios.get("")
}

export default function AssetDetails() {
    const router = useRouter();
    const { id } = router.query

    return (
        <ModuleMain>
            <ModuleHeader header="Asset Detail">
                
            </ModuleHeader>
            <ModuleContent>

            </ModuleContent>
        </ModuleMain>
    )
}