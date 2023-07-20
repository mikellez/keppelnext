import React from "react";
import RequiredIcon from "../RequiredIcon";
import { CMMSLicenseType } from "../../pages/License/New";

interface LicenseTypeSelectProps {
    optionsData: CMMSLicenseType[];
    onChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
    value: number;
}

const LicenseTypeSelect = (props: LicenseTypeSelectProps) => {
    return <div className='mb-3'>
        <label className="form-label"><RequiredIcon /> License Type</label>
        <select className="form-select" aria-label=".form-select-sm example" name="license_type_id" 
            onChange={props.onChange} value={props.value}>
            <option value={-1} disabled>-- Select License Type -- </option>
            {props.optionsData.map((type, index) => <option key={index} value={type.type_id}>{type.type}</option>)}

        </select>
    </div> 
}

export default LicenseTypeSelect;