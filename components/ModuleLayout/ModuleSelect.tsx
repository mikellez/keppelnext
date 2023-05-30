import React, { useEffect, useState } from 'react';
import instance from '../../types/common/axios.config';

export interface ModuleSelectOption {
    id: number;
    option: string;
}

interface ModuleSelectProps {
    placeholder: string;
    optionData: ModuleSelectOption[];
    onChange?: React.ChangeEventHandler<HTMLSelectElement>
}

export default function ModuleSelect(props: ModuleSelectProps) {

    const optionElements = props.optionData?.map(item => {
        return <option key={item.id} value={item.id}>{item.option}</option>
    })

    return (
        <select className='form-select' onChange={props.onChange}>
            <option hidden>{props.placeholder}</option>
            {props.optionData && optionElements}
        </select>
    );
}
