import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import Select, { ActionMeta, MultiValue, SingleValue, StylesConfig } from "react-select";
import makeAnimated from "react-select/animated";
import { CMMSUser } from "../../types/common/interfaces";

interface AssignToSelectProps {
    onChange: (
        value: MultiValue<AssignedUserOption> | SingleValue<AssignedUserOption>,
        action: ActionMeta<AssignedUserOption>
    ) => void;
    plantId?: number;
    style?: React.CSSProperties;
    name?: string;
    defaultIds?: number[]; //user_ids
    isSingle?: boolean;
}

export interface AssignedUserOption {
    value: number;
    label: string;
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
    const [defaultOptions, setDefaultOptions] = useState<AssignedUserOption[]>([]);
    const [options, setOptions] = useState<AssignedUserOption[]>([]);
    const [isReady, setIsReady] = useState<boolean>(false);
    const animatedComponents = makeAnimated();

    const customStyles: StylesConfig<AssignedUserOption, true> = {
        control: (base) => ({ ...base, ...props.style }),
        menu: (base) => ({ ...base, ...props.style }),
    };

    const updateDefault = useCallback(
        async (users: CMMSUser[]) => {
            return users
                .filter((user) => props.defaultIds?.includes(user.id))
                .map((user) => {
                    return { value: user.id, label: user.name + " | " + user.email };
                });
        },
        [props.defaultIds]
    );

    // Calls an api to get the list of assigned users upon change of plant id
    useEffect(() => {
        if (props.plantId) {
            getAssignedUsers(props.plantId).then((users) => {
                if (users == null) {
                    return console.log("no users");
                }
                // setAssignedUsers(users);
                setOptions(
                    users.map((user) => {
                        return { value: user.id, label: user.name + " | " + user.email };
                    })
                );
                if (props.defaultIds && props.defaultIds[0] != null) {
                    updateDefault(users)
                        .then((result) => {
                            return setDefaultOptions(result);
                        })
                        .then(() => {
                            setIsReady(true);
                        });
                } else {
                    setIsReady(true);
                }
            });
        }
    }, [props.plantId, props.defaultIds, updateDefault]);

    return (
        <div>
            {/* {!props.plantId && <select className="form-control" disabled></select>} */}
            {isReady && (
                <Select
                    isMulti={props.isSingle ? false : true}
                    name={props.name}
                    options={options}
                    components={animatedComponents}
                    className="basic-multi-select"
                    classNamePrefix="select"
                    onChange={props.onChange}
                    styles={customStyles}
                    defaultValue={props.isSingle ? defaultOptions[0] : defaultOptions}
                    // isDisabled={!props.plantId}
                />
            )}
        </div>
    );
};

export default AssignToSelect;
