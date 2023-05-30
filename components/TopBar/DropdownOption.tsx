import Link from "next/link";
import styles from "../../styles/Dropdown.module.css"

interface DropdownOptionInfo {
  // href: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  children?: React.ReactNode;
}

export default function DropdownOption(props: DropdownOptionInfo) {
  return (
    <div
      style={{
        margin: 0,
        padding: 4,
        paddingLeft: 10,
        paddingRight: 10,
      }}
    >
      <button
        onClick={props.onClick}
        style={{ border: "none", backgroundColor: "white", opacity: 0.8 }}
        className={styles.button}
      >
        {props.children}
      </button>
    </div>
  );
}
