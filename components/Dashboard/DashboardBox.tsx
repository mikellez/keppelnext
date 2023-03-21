import React, { PropsWithChildren } from "react";
import styles from "../../styles/Dashboard.module.scss";

interface DashboardBoxProps extends PropsWithChildren {
  title: string;
  filter?: React.ReactElement;
  style?: React.CSSProperties;
}

export default function DashboardBox(props: DashboardBoxProps) {
  return (
    <div className={styles.dashboardSection} style={props.style}>
      <header className={styles.dashboardHeader}>
        <h5>{props.title}</h5>
        <>{props.filter}</>
      </header>
      <div>{props.children}</div>
    </div>
  );
}
