import React, { PropsWithChildren } from "react";
import styles from "../../styles/Dashboard.module.scss";

interface DashboardBoxProps extends PropsWithChildren {
    title: string;
    style?: React.CSSProperties;
};

export default function DashboardBox(props: DashboardBoxProps) {
    return (
        <div className={styles.dashboardSection} style={props.style}>
            <h5>{props.title}</h5>
            {props.children}
        </div>
    );
};