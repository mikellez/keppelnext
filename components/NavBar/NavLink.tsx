import React, { MouseEventHandler } from 'react';
import Link from 'next/link';
import styles from '../../styles/Nav.module.scss'
import { useRouter } from 'next/router';

export interface NavLinkInfo {
    name: string;
    path: string;
    onClick?: MouseEventHandler;
    icon?: React.ReactNode;
}

export default function NavLink(props: NavLinkInfo) {
    
    const router = useRouter();

    return (
        <Link
            href={props.path}
            onClick={props.onClick}
        >
            <div className={styles.navItem + (router.pathname.includes(props.path) ? " " + styles.navItemSelected : "")} >
                {props.icon}
                
                <h6 className={styles.navItemText + (router.pathname.includes(props.path) ? " " + styles.navItemTextSelected : "")}>{props.name}</h6>
            </div> 
        </Link>
    )
}