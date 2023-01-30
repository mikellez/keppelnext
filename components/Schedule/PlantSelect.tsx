import React, { useState, useEffect } from 'react';
import { PlantInfo } from './ScheduleTemplate';
import axios from 'axios';
import { ChangeEventHandler } from 'preact/compat';

interface PlantSelectProps {
    onChange: React.ChangeEventHandler;
    accessControl?: boolean;
}

// No access control for managers and engineers
async function getPlants() {
	return await axios.get<PlantInfo[]>("/api/getPlants")
	.then(res => {
		return res.data
	})
	.catch(err => console.log(err.message))
};

export default function PlantSelect(props: PlantSelectProps) {
    // Store the list of plants in a state for dropdown
	const [plantList, setPlantList] = useState<PlantInfo[]>([]);

    // Calls an api on load to get the list of plants
	useEffect(() => {
        if (!props.accessControl) updatePlants();
	}, []);

    // Get the plants for the dropdown
	function updatePlants() {
		getPlants().then(plants => {
			if (plants == null) {
				return console.log("no plants");
			}
			setPlantList(plants);
		});
	};

    // Plant dropdown options
	const plantOptions = plantList.map(plant => <option key={plant.plant_id} value={plant.plant_id}>{plant.plant_name}</option>)

    return (
        <select className="form-control" onChange={props.onChange}>
            <option hidden>Select plant</option>
            {plantOptions}
        </select>
    );
};