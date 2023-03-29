import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ModuleSelect, { ModuleSelectOption } from '../ModuleLayout/ModuleSelect';


const getAssetTypes = async () : Promise<ModuleSelectOption[]> => {
    return await axios.get("/api/master/asset_type")
        .then(res => {
            return res.data.rows.map((asset: any)=> {
                return {
                    id: asset.asset_id,
                    option: asset.asset_type
                }
            })
        })
        .catch(err => {
            console.log(err);
        });
};

export default function AssetTypeSelect(props: any) {
    const [assetOptions, setAssetOptions] = useState<ModuleSelectOption[]>([]);
    //console.log("I AM A CHILD ", props.systemId)
    useEffect(() => {
        getAssetTypes().then(result => {
            if (result) {
                setAssetOptions(result)
            }    
        })
    })

    return (
        <ModuleSelect optionData={assetOptions} placeholder="Select asset type" />
    );
};