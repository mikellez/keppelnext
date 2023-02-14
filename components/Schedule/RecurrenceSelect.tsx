import React, { useState, useEffect } from "react";

interface RecurrenceSelectProps {
    startDate?: Date;
    endDate?: Date;
    name?: string;
    onChange: React.ChangeEventHandler
}

interface recurrencePeriod {
    label: string;
    value: number;
}

const recurrencePeriodList: recurrencePeriod[] = [{label: "Daily", value: 1}, 
    {label: "Weekly", value: 7},
    {label: "Fortnightly", value: 14},
    {label: "Monthly", value: 30},
    {label: "Quarterly", value: 90},
    {label: "Semi-Annually", value: 180},
    {label: "Yearly", value: 360},
];

export default function RecurrenceSelect(props: RecurrenceSelectProps) {
    const [validPeriods, setValidPeriods] = useState<recurrencePeriod[]>([]);

    useEffect(() => {
        if ((!props.startDate || !props.endDate) || (props.startDate > props.endDate)) setValidPeriods([]);
        else {
            setValidPeriods([]);
            // Calculate the difference in dats
            const days = (Date.UTC(props.endDate.getFullYear(), props.endDate.getMonth(), props.endDate.getDate())
             - Date.UTC(props.startDate.getFullYear(), props.startDate.getMonth(), props.startDate.getDate())) 
             / (24*60*60*1000) + 1;
            
            // Add the relevant recurrence period to the state  
            recurrencePeriodList.forEach(period => {
                if (days > period.value) setValidPeriods(prev => [...prev, period])
            })
        }
    }, [props.startDate, props.endDate])

    const options = validPeriods.map(period => {
        return <option key={period.value} value={period.value} >{period.label}</option>
    })

    return (
        <select className="form-select" onChange={props.onChange} name={props.name} >
            <option hidden>Select a Recurrence Period</option>
            {options}
        </select>
    )
};