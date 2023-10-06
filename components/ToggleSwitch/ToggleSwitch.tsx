import styles from "./ToggleSwitch.module.css";

interface ToggleSwitchProps {
  isSelected: boolean;
  onChange: Function;
}

const ToggleSwitch = (props: ToggleSwitchProps) => {

  return (
    <div 
      className={`${styles.switchBackground} ${props.isSelected === true ? styles.selected : ''}`} 
      onClick={ () => {
        if (props.onChange) {
          props.onChange();
        }
      }}
      >
      <span className={`${styles.switchButton} ${props.isSelected === true ? styles.buttonPosition : ''}`}/>

    </div>
  );
};

export default ToggleSwitch;