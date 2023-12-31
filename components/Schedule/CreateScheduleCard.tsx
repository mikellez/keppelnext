import React, { useState } from "react";
import Link from "next/link";
import CreateScheduleModal from "./CreateScheduleModal";
import styles from "../../styles/Schedule.module.scss";
import { ScheduleCreateOptions } from "../../pages/Schedule/Create";

export interface CreateScheduleCardProps {
    title: ScheduleCreateOptions | string;
    text: string;
    icon: React.ReactNode;
    color: string;
}

export default function CreateScheduleCard(props: CreateScheduleCardProps) {
    const [displayModal, setDisplayModal] = useState<boolean>(false);

    return (
        <>
            <div className={styles.createCard}>
                <div> {props.icon} </div>
                <h5> {props.title} </h5>
                <p className={styles.createCardText}> {props.text} </p>
                <button
                    style={{ backgroundColor: props.color }}
                    className={styles.createCardBtn}
                    onClick={() => setDisplayModal(true)}
                >
                    {" "}
                    Select{" "}
                </button>
                <span
                    className={styles.createCardBar}
                    style={{ backgroundColor: props.color }}
                ></span>
            </div>
            <CreateScheduleModal
                isOpen={displayModal}
                closeModal={() => setDisplayModal(false)}
                option={props.title as ScheduleCreateOptions}
                title={"Create from " + props.title.toLocaleLowerCase()}
            />
        </>
    );
}
