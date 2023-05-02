import React, { useEffect, useState } from 'react';
import ModuleSelect, { ModuleSelectOption } from '../ModuleLayout/ModuleSelect';
import instance from '../../axios.config.js';

async function getSystems() : Promise<ModuleSelectOption[]> {
    return await instance.get("/api/master/system")
        .then(res => {
            return res.data.rows.map((item: any) => {
                return {id: item.system_id, option: item.system_name}
            })
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
        <ModuleSelect optionData={systemOptions} placeholder="Select system" />
    )
}