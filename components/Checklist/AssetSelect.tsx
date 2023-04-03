import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import Select, { ActionMeta, MultiValue, SingleValue, StylesConfig } from "react-select";
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
    const [options, setOPtions] = useState<AssetOption>();

    const {data} = useAsset(props.plantId)

    return (
        <div>
            <Select 
                isMulti
                onChange={props.onChange}
            />
        </div>
    )
}