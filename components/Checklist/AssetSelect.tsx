import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import Select, { ActionMeta, MultiValue, StylesConfig } from "react-select";
import { CMMSAsset } from "../../types/common/interfaces";
import { useAsset } from "../SWR";

interface AssetOption {
    value: number;
    label: string;
};

interface AssetSelectProps {
    onChange: (
        value: MultiValue<AssetOption>,
        action: ActionMeta<AssetOption>
    ) => void;
    plantId: number;
    style?: React.CSSProperties;
    name?: string;
};



export default function AssetSelect(props: AssetSelectProps) {
    const [options, setOptions] = useState<AssetOption[]>();

    const { data } = useAsset(props.plantId);

    useEffect(() => {
        setOptions(data?.map(asset => {
            return {
                value: asset.psa_id,
                label: asset.asset_name,
            }
        }));
    }, [data])

    return (
        <div>
            <Select 
                isMulti
                onChange={props.onChange}
                options={options}
            />
        </div>
    )
}