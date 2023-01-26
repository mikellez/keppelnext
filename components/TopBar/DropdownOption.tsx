import Link from "next/link";

interface DropdownOptionInfo {
    href: string;
    onClick?: React.MouseEventHandler<HTMLButtonElement>;
    children?: React.ReactNode;
} 

export default function DropdownOption(props: DropdownOptionInfo) {
    return <div style={{
        padding: "0.3em 0.5em 0.5em 0.3em",
        margin: "0 5em 0 0.3em"
    }}><button onClick={props.onClick}>{props.children}</button></div>
}