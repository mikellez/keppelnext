import React, { useState, useEffect } from 'react';
import { CMMSTimeline } from '../../types/common/interfaces';
import axios from 'axios';

interface TimelineSelectProps {
    onChange: React.ChangeEventHandler<HTMLSelectElement>;
    allStatus?: false;
    status: number;
};

async function getTimeline(id: number) {
    return await axios.get<CMMSTimeline[]>("")
	.then(res => {
		return res.data
	})
	.catch(err => console.log(err.message))
};

export default function TimelineSelect(props: TimelineSelectProps) {
    return (
        <select className="form-control">

        </select>
    );
};