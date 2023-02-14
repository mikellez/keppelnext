import React, { useState, useEffect } from "react";
import axios from "axios";
import Select from "react-select";
import makeAnimated from "react-select/animated";
import { CMMSUser } from "../../types/common/interfaces";

interface AssignToSelectProps {
    onChange: React.ChangeEventHandler<HTMLSelectElement>;
    plantId: number;
}

// Axios call to get all assigned users based on plant_id
async function getAssignedUsers(plantId: number) {
    return await axios
        .get<CMMSUser[]>("/api/getAssignedUsers/" + plantId)
        .then((res) => {
            return res.data;
        })
        .catch((err) => console.log(err.message));
}

const AssignToSelect = (props: AssignToSelectProps) => {
    // Store assigned users in a state for dropdown
    const [assignedUsers, setAssignedUsers] = useState<CMMSUser[]>([]);

    // Calls an api to get the list of assigned users upon change of plant id
    useEffect(() => {
        getAssignedUsers(props.plantId).then((user) => {
            if (user == null) {
                return console.log("no users");
            }
            setAssignedUsers(user);
        });
    }, [props.plantId]);

    // Assigned users dropdown
    const assignedUserOptions = assignedUsers.map((user) => {
        return { value: user.id, label: user.name };
    });

    return (
        <Select
            isMulti
            name="Assigned Users"
            options={assignedUserOptions}
            className="basic-multi-select"
            classNamePrefix="select"
            onChange={props.onChange}
        />
    );
};

export default AssignToSelect;
