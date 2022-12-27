import React from 'react';
import Link from 'next/link';
import styles from '../../styles/Nav.module.scss'
import { useRouter } from 'next/router';

interface NavLinkInfo {
    name: string;
    path: string;
}

export default function NavLink(props: NavLinkInfo) {
    
    const router = useRouter();

    
    return <Link
                href={props.path}
                className={styles.navItem + (router.pathname.includes(props.path) ? " " + styles.navItemSelected : "")}
    >
        <h6 className={styles.navItemText}>{props.name}</h6>
    </Link>
}