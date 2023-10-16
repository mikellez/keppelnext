import React, { useState, useEffect, useCallback, useRef } from "react";
import Select, {
  ActionMeta,
  GroupBase,
  MultiValue,
  SingleValue,
  StylesConfig,
} from "react-select";
import makeAnimated from "react-select/animated";
import logbookService from "../../services/logbook";
import {CMMSLogbookLabel} from "../../types/common/interfaces"; 

interface LabelSelectProps {
    onChange: (
        value: SingleValue<LabelOption>,
        action: ActionMeta<LabelOption>
      ) => void;
  style?: React.CSSProperties;
  name?: string;
  isSingle?: boolean;
  className?: string;
  disabled?: boolean;
  value?: any;
}

interface ErrorMsg {
  msg: string;
}

function isErrorMsg(object: any): object is ErrorMsg {
  return 'msg' in object;
}

export interface LabelValue {
  label_id: number;
  label_name: string;
  allow_custom: boolean;
}

export interface LabelOption {
  value: LabelValue;
  name: string;
}

const LabelSelect = (props: LabelSelectProps) => {
  const [options, setOptions] = useState<LabelOption[]>([]);
  const [isReady, setIsReady] = useState<boolean>(false);
  const animatedComponents = makeAnimated();

  const selectRef = useRef<any>(null);


  useEffect(() => {
    if (!props.value && selectRef.current) {
      selectRef.current.setValue("");
    }
  }, [props.value]);

  const customStyles: StylesConfig<LabelOption, true> = {
    control: (base) => ({ ...base, ...props.style }),
    menu: (base) => ({ ...base, ...props.style }),
  };

  // Calls an api to get the list of labels upon page render:
  useEffect(() => {
    logbookService.getLogbookLabels().then((labels) => {
    if (labels == null) {
        return console.log("no labels");
    }
    // No users
    if(isErrorMsg(labels)){
        setOptions([]);
    }
    else{
        // setAssignedUsers(users);
        setOptions(
            labels.map((logbook_label : CMMSLogbookLabel) => {
                let labelvalue : LabelValue = 
                {label_id: logbook_label.label_id,
                  label_name: logbook_label.name,
                  allow_custom: logbook_label.allow_custom}
                return { value: labelvalue, label: logbook_label.name + (logbook_label.description? " | " + logbook_label.description : "") };
            })
            .sort((a,b) => Number(a.value.allow_custom) - Number(b.value.allow_custom))
        );
    }
    
    });
    setIsReady(true);
  }, []);

  return (
    <div>
      {/* {!props.plantId && <select className="form-control" disabled></select>} */}
      {isReady && (
        <Select
          name={props.name}
          options={options}
          onChange={props.onChange}
          components={animatedComponents}
          className={`basic-multi-select ${props.className}`}
          classNamePrefix="select"
          styles={customStyles}
          isDisabled={props.disabled}
          // ref={selectRef}
        />
      )}
    </div>
  );
};

export default LabelSelect;