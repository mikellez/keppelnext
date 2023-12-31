import React from "react";
import { CMMSPlantLocation } from "../../types/common/interfaces";
import RequiredIcon from "../RequiredIcon";

interface PlantLocSelectProps {
  optionsData: CMMSPlantLocation[];
  onChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  value: string;
  plant_id: number;
  disabled?: boolean;
}

const PlantLocSelect = (props: PlantLocSelectProps) => {
  const sortedOptionsData = props.optionsData.sort((a, b) => 
    a.plant_name.localeCompare(b.plant_name)
  );
  return (
    <div className="mb-3">
      <label className="form-label">
        <RequiredIcon /> Plant Name
      </label>
      {/* -1--1 is the default input */}
      <select
        className="form-select"
        aria-label=".form-select-sm example"
        disabled={props.disabled}
        value={props.plant_id !== -1 ? props.value : -1}
        onChange={props.onChange}
      >
        <option value={-1} disabled>
          -- Select Plant --{" "}
        </option>
        {sortedOptionsData.map((loc, index) => (
          <option key={index} value={`${loc.plant_id}`}>
            {`${loc.plant_name}`}
          </option>
        ))}
      </select>
    </div>
  );
};

export default PlantLocSelect;
