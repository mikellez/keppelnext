import React, { useState, useEffect } from 'react';
import { PlantInfo } from './ScheduleTemplate';
import axios from 'axios';
import { ChangeEventHandler } from 'preact/compat';

interface PlantSelectProps {
    onChange: React.ChangeEventHandler;
    accessControl?: boolean;
    allPlants?: boolean;
}

// No access control for managers and engineers
async function getPlants(url: string) {
	return await axios.get<PlantInfo[]>(url)
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
        const url = props.accessControl ? "/api/getUserPlants" : "/api/getPlants"
        updatePlants(url);
	}, []);

    // Get the plants for the dropdown
	function updatePlants(url: string) {
		getPlants(url).then(plants => {
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
            {props.allPlants ? (plantList.length > 1 && <option value={0}>View all Plants</option>) : <option hidden>Select plant</option>}
            {plantOptions}
        </select>
    );
};