import React from "react";
import { CMMSAssetDetails } from "../../types/common/interfaces";
import { BsArrowReturnRight } from "react-icons/bs";
import styles from "../../styles/Asset.module.scss";

interface AssetHierachyProps {
    asset: CMMSAssetDetails;
};

export default function AssetHierachy(props: AssetHierachyProps) {

    return (
        <div className={styles.assetHierachy}>
            <p>{props.asset.plant_name}</p>
            <p><BsArrowReturnRight />{props.asset.system_name}</p>
            {props.asset.system_asset_lvl5 != "" && <p><BsArrowReturnRight />{props.asset.system_asset_lvl5}</p>}
            {props.asset.system_asset_lvl6 != "" && <p><BsArrowReturnRight />{props.asset.system_asset_lvl6}</p>}
            {props.asset.system_asset_lvl7 != "" && <p><BsArrowReturnRight />{props.asset.system_asset_lvl7}</p>}
            {props.asset.asset_type != props.asset.parent_asset && <p><BsArrowReturnRight />{props.asset.asset_type}</p>}
            <p><BsArrowReturnRight />{props.asset.asset_name}</p>
        </div>
    );
};