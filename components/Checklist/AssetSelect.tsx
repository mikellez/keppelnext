import React, { forwardRef, useCallback, useEffect, useState } from "react";
import Select, {
  ActionMeta,
  MultiValue,
  SingleValue
} from "react-select";
import { CMMSAsset } from "../../types/common/interfaces";
import { useAsset } from "../SWR";

export interface AssetOption {
  value: number | null;
  label: string;
}

interface AssetSelectProps {
  onChange: (
    value: MultiValue<AssetOption> | SingleValue<AssetOption>,
    action: ActionMeta<AssetOption>
  ) => void;
  plantId: number;
  style?: React.CSSProperties;
  name?: string;
  isSingle?: boolean;
  defaultIds?: number[];
  disabled?: boolean;
  ref?: any;
}

const AssetSelect = forwardRef((props: AssetSelectProps, ref: any) => {
  const [options, setOptions] = useState<AssetOption[]>();
  const [defaultOptions, setDefaultOptions] = useState<AssetOption[]>();

  const { data } = useAsset(props.plantId);

  const updateDefault = useCallback(
    async (assets: CMMSAsset[]) => {
      return assets
        .filter((asset) => props.defaultIds?.includes(asset.psa_id))
        .map((asset) => {
          return { value: asset.psa_id, label: asset.asset_name };
        });
    },
    [props.defaultIds]
  );

  const sortedData  = (data || []).sort((a, b) => 
    a.asset_name.localeCompare(b.asset_name)
  );

  useEffect(() => {
    if (data) {
      setOptions(
        sortedData.map((asset) => {
          return {
            value: asset.psa_id,
            label: asset.asset_name,
          };
        })
      );

      if (props.defaultIds) {
        updateDefault(data).then((result) => {
          return setDefaultOptions(result);
        });
      }
    }
  }, [data, props.defaultIds, updateDefault]);

  return (
    <div>
      {((props.defaultIds && defaultOptions) || !props.defaultIds) && (
        <Select
          isMulti={props.isSingle ? false : true}
          onChange={props.onChange}
          options={options}
          defaultValue={
            props.defaultIds
              ? props.isSingle
                ? defaultOptions![0]
                : defaultOptions
              : { value: null, label: "-- Select Asset --" }
          }
          isDisabled={props.disabled}
          value={props.isSingle ? defaultOptions![0] : defaultOptions}
          // ref={ref}
        />
      )}
    </div>
  );
});

AssetSelect.displayName = "AssetSelect";
export default AssetSelect;
