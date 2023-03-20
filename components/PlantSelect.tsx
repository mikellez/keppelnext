import React, { useState, useEffect } from "react";
import { CMMSPlant } from "../types/common/interfaces";
import axios from "axios";

interface PlantSelectProps {
    onChange: React.ChangeEventHandler<HTMLSelectElement>;
    accessControl?: boolean; //plant select restricted to user
    allPlants?: boolean; // true : "view all plants", false: "Select a plant"
    name?: string;
    default?: boolean; // true:
}

// No access control for managers and engineers
export async function getPlants(url: string) {
    return await axios
        .get<CMMSPlant[]>(url)
        .then((res) => {
            return res.data.sort((a, b) => a.plant_id - b.plant_id);
        })
        .catch((err) => console.log(err.message));
}

export default function PlantSelect(props: PlantSelectProps) {
    // Store the list of plants in a state for dropdown
    const [plantList, setPlantList] = useState<CMMSPlant[]>([]);

    // Calls an api on load to get the list of plants
    useEffect(() => {
        const url = props.accessControl ? "/api/getUserPlants" : "/api/getPlants";
        updatePlants(url);
    }, [props.accessControl]);

    // Get the plants for the dropdown
    function updatePlants(url: string) {
        getPlants(url).then((plants) => {
            if (plants == null) {
                return console.log("no plants");
            }
            setPlantList(plants);
        });
    }

    // Plant dropdown options
    const plantOptions = plantList.map((plant, index) => {
        // if (props.default) {
        //     return (
        //         <option key={plant.plant_id} value={plant.plant_id} selected={index == 0}>
        //             {plant.plant_name}
        //         </option>
        //     );
        // }
        return (
            <option key={plant.plant_id} value={plant.plant_id}>
                {plant.plant_name}
            </option>
        );
    });

    return (
        <select className="form-select" onChange={props.onChange} name={props.name}>
            {props.allPlants
                ? plantList.length > 1 && <option value={0}>View all Plants</option>
                : !props.default && <option hidden>Select plant</option>}
            {plantOptions}
        </select>
    );
}
