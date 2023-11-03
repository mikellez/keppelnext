import { CSSProperties } from "react";

import type { DatePickerProps, TimePickerProps } from 'antd';
import { DatePicker, Select } from 'antd';

const { Option } = Select;

type PickerType = 'time' | 'date';

const PickerWithType = ({
    type,
    onChange,
    style
}: {
    type: PickerType;
    onChange: TimePickerProps['onChange'] | DatePickerProps['onChange'];
    style?: CSSProperties;
}) => {
    if (type === 'date') return <DatePicker onChange={onChange} popupStyle={style}/>
    return <DatePicker picker={type} onChange={onChange} popupStyle={style} />
};



export default PickerWithType;