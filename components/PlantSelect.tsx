import React, { useEffect, useState } from "react";
import instance from "../types/common/axios.config";
import { CMMSPlant } from "../types/common/interfaces";

interface PlantSelectProps {
    onChange: React.ChangeEventHandler<HTMLSelectElement>;
    accessControl?: boolean; //plant select restricted to user
    allPlants?: boolean; // true : "view all plants", false: "Select a plant"
    name?: string;
    default?: boolean; // true: able to view all plants but dont have "view all plants" option
    disabled?: boolean; // set to true to disable plantselect
    defaultPlant?: number; // to set a default plant using plant ID
}

// No access control for managers and engineers
export async function getPlants(url: string) {
    return await instance
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

    const sortedPlants = plantList.sort((a, b) => 
        a.plant_name.localeCompare(b.plant_name)
    );

    // Plant dropdown options
    const plantOptions = sortedPlants.map((plant, index) => {
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
        <select
            className="form-select"
            onChange={props.onChange}
            name={props.name}
            disabled={props.disabled}
            value={props.defaultPlant}
        >
            {props.allPlants
                ? plantList.length > 1 && <option value={0}>View all Plants</option>
                : !props.default && <option hidden>Select plant</option>}
            {plantOptions}
        </select>
    );
}
