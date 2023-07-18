import React from "react";
import RequiredIcon from "../RequiredIcon";
import { CMMSPlantLocation } from "../../pages/License/Form";

interface PlantLocSelectProps {
    optionsData: CMMSPlantLocation[];
    onChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
}

const PlantLocSelect = (props: PlantLocSelectProps) => {
    return <div className='mb-3'>
        <label className="form-label"><RequiredIcon /> Plant Location</label>
        <select className="form-select" aria-label=".form-select-sm example" defaultValue={-1} onChange={props.onChange}>
            <option value={-1} disabled>-- Select License Type -- </option>
            {props.optionsData.map((loc, index) => <option key={index} value={`${loc.plant_id}-${loc.loc_id}`}>
                {`${loc.plant_name} | ${loc.loc_floor}-${loc.loc_room}`}
            </option>)}
        </select>
    </div> 
}

export default PlantLocSelect;