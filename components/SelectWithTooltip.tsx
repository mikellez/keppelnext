import { useState } from "react";
import Select, { ActionMeta, MultiValue, StylesConfig } from "react-select";
import { Tooltip as ReactTooltip } from "react-tooltip";

interface SelectedOptionProps {
  label: string;
  value: string;
  selected: boolean;
}

const SelectWithTooltip = ({
  props,
  defaultValue,
  onChange,
  options,
  className,
  id,
  isDisabled,
}: {
  props?: any;
  defaultValue?: any;
  onChange: (selectedOption: any) => void;
  options: any;
  className?: string;
  id?: string;
  isDisabled?: boolean;

}) => {
  const [selectedOption, setSelectedOption] = useState<SelectedOptionProps>();

  const handleSelectChange = (selectedOption: SelectedOptionProps) => {
    console.log(selectedOption)
    onChange(selectedOption);
    setSelectedOption(selectedOption);
  };

  return ( 
    <div>
      <Select
        id={id}
        className={className}
        {...props}
        isDisabled={isDisabled}
        onChange={handleSelectChange}
        defaultValue={defaultValue}
        options={options}
      />
      {selectedOption &&
        <ReactTooltip
          anchorId={id}
          place="bottom"
          content={selectedOption?.label}
        />
      }
    </div>

   );
}

export default SelectWithTooltip;