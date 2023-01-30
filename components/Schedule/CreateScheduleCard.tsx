import React from 'react';
import Link from 'next/link';
import styles from "../../styles/Schedule.module.scss";

export interface CreateScheduleCardProps {
    title: string;
    text: string;
    icon: React.ReactNode; 
    color: string;
    path: string; 
};

export default function CreateScheduleCard(props: CreateScheduleCardProps) {
    return (
        <div className={styles.createCard}>
            <div> {props.icon} </div>
            <h5> {props.title} </h5>
            <p className={styles.createCardText}> {props.text} </p>
            {props.path === "./Create/New" ?
            <Link href={props.path} style={{
                position: "absolute",
                bottom: "2rem",
            }}>
                <button style={{
                    backgroundColor: props.color,
                    color: "#121212",
                    borderRadius: "5px",
                    border: "none",
                    padding: "0.3rem 1rem",
                    }}> Select </button>
            </Link> 
            :
            <button style={{backgroundColor: props.color}} className={styles.createCardBtn}> Select </button>
            }
            <span className={styles.createCardBar} style={{backgroundColor: props.color}}></span>
        </div>
    );
};