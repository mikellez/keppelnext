import React from "react";
import RequiredIcon from "../RequiredIcon";
import { CMMSPlantLocation } from "../../types/common/interfaces";

interface PlantLocSelectProps {
    optionsData: CMMSPlantLocation[];
    onChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
    value: string;
    plant_loc_id: number;
    disabled?: boolean
}

const PlantLocSelect = (props: PlantLocSelectProps) => {
    return <div className='mb-3'>
        <label className="form-label"><RequiredIcon /> Plant Location</label>
        {/* -1--1 is the default input */}
        <select className="form-select" aria-label=".form-select-sm example" disabled={props.disabled}
            value={props.plant_loc_id !== -1 ? props.value : -1} onChange={props.onChange}>
            <option value={-1} disabled>-- Select Plant Location -- </option>
            {props.optionsData.map((loc, index) => <option key={index} value={`${loc.plant_id}-${loc.loc_id}`}>
                {`${loc.plant_name} | ${loc.loc_floor}-${loc.loc_room}`}
            </option>)}
        </select>
    </div> 
}

export default PlantLocSelect;