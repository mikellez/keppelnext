import React, { MouseEventHandler } from "react";
import styles from '../styles/components.module.scss';

interface ButtonInfo {
    text: string;
    onClick?: MouseEventHandler;
};

export default function AZButton(props: ButtonInfo) {
    return (
        <button className={styles.customButton} onClick={props.onClick}>{props.text}</button>
    )
}