import React, { useState, useEffect } from "react";

import type { DatePickerProps, TimePickerProps } from 'antd';
import { DatePicker, Select, Space, TimePicker } from 'antd';
import dayjs, { Dayjs } from "dayjs";

const { Option } = Select;

type PickerType = 'time' | 'date';

const PickerWithType = ({
    type,
    onChange
}: {
    type: PickerType;
    onChange: TimePickerProps['onChange'] | DatePickerProps['onChange'];
}) => {
    if (type === 'date') return <DatePicker onChange={onChange} />
    return <DatePicker picker={type} onChange={onChange} />
};



export default PickerWithType;