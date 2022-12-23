import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import styles from '../styles/Nav.module.css'
import { GrClose } from "react-icons/gr";
import { BsList } from 'react-icons/bs'
import NavDropdown from './NavDropdown';

const NavBar= () => {
    const [navDisplay, setNavDisplay] = useState(false);

    const navArr = [
        {
            name: "Dashboard",
            path: "",
            selected: false
        },
        {
            name: "Request",
            path: "/request",
            selected: false
        },
        {
            name: "Asset",
            path: "/asset",
            selected: false
        },
        {
            name: "Schedule",
            path: "/schedule",
            selected: false
        },
        {
            name: "Checklist",
            path: "/checklist",
            selected: false
        },
        {
            name: "E-Logbook",
            path: "/logbook",
            selected: false
        },
        {
            name: "Generate QR Codes",
            path: "/QRCode",
            selected: false
        }
    ];

    const navElement = navArr.map(item => {
        return <Link href={item.path} key={item.name} className={styles.navItem}>
                <h6>{item.name}</h6>
            </Link>
    });

    function displayNav() {
        setNavDisplay(prev => !prev);
    };

    return (
        <div>
            <BsList onClick={displayNav} size={42} style={{color:"#707070", marginRight:"1em"}}/>
            <div className={styles.overlay} style={{
                display: navDisplay ? "block" : "none",
                zIndex: navDisplay ? 5 : -1
                }}>
            <div className={styles.navMain} style={{display: navDisplay ? "block" : "none"}}>
                <div className={styles.navItems}>
                    <div className={styles.navHead}>
                        <h3>Menu</h3>
                        <GrClose onClick={displayNav} size={25} style={{color:"#4D4D4D", marginLeft: "auto"}} />
                    </div>
                    {navElement}
                    <NavDropdown />
                </div>
            </div>
            </div>
        </div>
    )
};

export default NavBar;