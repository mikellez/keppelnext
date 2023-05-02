import React, { useEffect, useState } from 'react';
import ModuleSelect, { ModuleSelectOption } from '../ModuleLayout/ModuleSelect';
import instance from '../../axios.config.js';

async function getSystems() : Promise<ModuleSelectOption[]> {
    return await instance.get("/api/master/system_asset_lvl5")
        .then(res => {
            const uniqueValues = new Set();
            return res.data.rows.reduce((acc: ModuleSelectOption[], plant_system_assets: any) => {
                if (!uniqueValues.has(plant_system_assets.system_asset_lvl5)) {
                    uniqueValues.add(plant_system_assets.system_asset_lvl5);
                    acc.push({id: plant_system_assets.system_asset_lvl5, option: plant_system_assets.system_asset_lvl5});
                }
                return acc;
            }, []);
        })
}

export default function SystemSelect() {
    const [systemOptions, setSystemOptions] = useState<ModuleSelectOption[]>([]);

    useEffect(() => {
        getSystems().then(result => {
            setSystemOptions(result);
        });
    })

    return (
        <ModuleSelect optionData={systemOptions} placeholder="Select system Asset" />
    )
}