import React, { useCallback, useEffect, useRef, useState } from "react";
import Select, {
  ActionMeta,
  MultiValue,
  SingleValue,
  StylesConfig
} from "react-select";
import makeAnimated from "react-select/animated";
import instance from '../../types/common/axios.config';
import { CMMSUser } from "../../types/common/interfaces";

interface AssignToSelectProps {
  onChange: (
    value: MultiValue<AssignedUserOption> | SingleValue<AssignedUserOption>,
    action: ActionMeta<AssignedUserOption>
  ) => void;
  plantId?: number | number[];
  style?: React.CSSProperties;
  name?: string;
  defaultIds?: number[]; //user_ids
  isSingle?: boolean;
  className?: string;
  disabled?: boolean;
  value?: any;
  signoff?: boolean;
}

interface ErrorMsg {
  success: boolean;
  msg: string;
}

function isErrorMsg(object: any): object is ErrorMsg {
  return 'success' in object;
}

export interface AssignedUserOption {
  value: number;
  label: string;
}

// Axios call to get all assigned users based on plant_id
async function getAssignedUsers(plantId: number | number[], signoff: boolean) {
  return await instance
    .get<CMMSUser[] | ErrorMsg>("/api/getAssignedUsers/" + plantId + "?signoff=" + signoff)
    .then((res) => {
      if(res.data)
        return res.data;
      return res;
    })
    .catch((err) => console.log(err.message));
}

const AssignToSelect = (props: AssignToSelectProps) => {
  const [defaultOptions, setDefaultOptions] = useState<AssignedUserOption[]>(
    []
  );
  const [options, setOptions] = useState<AssignedUserOption[]>([]);
  const [isReady, setIsReady] = useState<boolean>(false);
  const animatedComponents = makeAnimated();

  const selectRef = useRef<any>(null);


  useEffect(() => {
    if (!props.value && selectRef.current) {
      selectRef.current.setValue("");
    }
  }, [props.value]);

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
    if (props.plantId !== undefined) {  
    getAssignedUsers(props.plantId, props.signoff).then((users) => {
        if (users == null) {
          return console.log("no users");
        }
        // No users
        if(isErrorMsg(users)){
          if(users.success == false){
            // Clear the assigned users list:
            setOptions([]);
            return;
          }
        }
        else{
            // setAssignedUsers(users);
          setOptions(
            users.map((user) => {
              return { value: user.id, label: user.name + " | " + user.email };
            })
          );
          if (props.defaultIds && props.defaultIds[0] != null) {
            updateDefault(users)
              .then((result) => {

                setDefaultOptions(result);
            
                setIsReady(true);
              })
              // .then(() => {
              // });
          } else {
            setIsReady(true);
          }
        }
        
      });
    }
    setIsReady(true);
  }, [props.plantId, props.defaultIds, updateDefault]);

  const handleChange = (
    value: MultiValue<AssignedUserOption> | SingleValue<AssignedUserOption>,
    action: ActionMeta<AssignedUserOption>
  ) => {
    props.onChange(value, action);
    setDefaultOptions(value as AssignedUserOption[]);
  };


  return (
    <div>
      {/* {!props.plantId && <select className="form-control" disabled></select>} */}
      {isReady && (
        <Select
          isMulti={props.isSingle ? false : true}
          name={props.name}
          options={options}
          components={animatedComponents}
          className={`basic-multi-select ${props.className}`}
          classNamePrefix="select"
          onChange={handleChange}
          styles={customStyles}
          defaultValue={props.isSingle ? defaultOptions[0] : defaultOptions}
          isDisabled={props.disabled}
          value={props.isSingle ? defaultOptions[0] : defaultOptions}
          // ref={selectRef}
        />
      )}
    </div>
  );
};

export default AssignToSelect;
