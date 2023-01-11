import React, { useState } from 'react';
import { UserInfo } from './ScheduleTemplate';
import styles from "../../styles/Schedule.module.scss"
import { SlArrowDown } from 'react-icons/sl';
import { SlArrowUp} from 'react-icons/sl';

interface UserProps extends UserInfo {
    serial: number;
};

export default function EventModalUser(props: UserProps) {
    const [displayTooltip, setDisplayTooltip] = useState<boolean>(false);

    function handleClick() {
        setDisplayTooltip(prev => !prev)
    };

    return (
        <div>
            <div
                className={styles.eventModalAssignedUser}
                style={displayTooltip ? {
                    borderTopLeftRadius: "5px",
                    borderTopRightRadius: "5px"
                } : {
                    borderRadius: "5px"
                }}
            >
                {props.serial}. {props.name}
                <div className={styles.modalUserArrow}>
                    {displayTooltip ? <SlArrowUp onClick={handleClick} /> : <SlArrowDown onClick={handleClick} />}
                </div>
            </div>
            {displayTooltip && <div className={styles.modalUserTooltip}>
                <p>Role: {props.role}</p>
                <p>Email: {props.email}</p>
            </div>}
        </div>
    )
}