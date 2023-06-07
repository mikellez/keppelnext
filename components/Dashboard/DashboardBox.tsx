import React, { PropsWithChildren } from "react";
import styles from "../../styles/Dashboard.module.scss";

interface DashboardBoxProps extends PropsWithChildren {
  id?: string;
  title: string;
  filter?: React.ReactElement;
  style?: React.CSSProperties;
  className?: string;
  onClick?: any;
}

export default function DashboardBox({ id, title, style, onClick, filter, className, children} : DashboardBoxProps) {
  const combinedClassName = `${styles.dashboardSection} ${className}`;

  return (
    <div 
      id={id}
      className={combinedClassName} 
      style={{ ...style, ...(onClick ? { cursor: 'pointer' } : {}) }}
      onClick={onClick}
      // {...props}
      >
      <header className={styles.dashboardHeader}>
        <h5>{title}</h5>
        <>{filter}</>
      </header>
      <div>{children}</div>
    </div>
  );
}
