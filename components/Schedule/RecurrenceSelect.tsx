import React, { useState, useEffect } from "react";

interface RecurrenceSelectProps {
    startDate: Date;
    endDate: Date;
    name?: string;
    onChange: React.ChangeEventHandler
}


const recurrencePeriodList = ["Daily", "Weekly", "Fortnightly", "Monthly", "Quarterly", "Semi-Annually", "Yearly"];

export default function RecurrenceSelect(props: RecurrenceSelectProps) {
    const [validPeriods, setValidPeriods] = useState([]);

    useEffect(() => {
        if (!props.startDate || !props.endDate) setValidPeriods([]);
        else {

        }

    }, [props.startDate, props.endDate])

    return (
        <select>

        </select>
    )
};