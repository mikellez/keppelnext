import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import styles from '../../styles/Nav.module.css'
import { GrClose } from "react-icons/gr";
import { BsList } from 'react-icons/bs'
import NavDropdown from './NavDropdown';

const NavBar= () => {
    // Storing whether user has clicked on the nav button as a state
    const [navDisplay, setNavDisplay] = useState(false);
    // List of nav elements and paths
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
        },
        {
            name: "Workflow",
            path: "/workflow",
            selected: false
        },
        {
            name: "Master",
            path: "/master",
            selected: false
        }
    ];

    // Mapping the nav array elements into jsx elements
    const navElement = navArr.map(item => {
        return <Link href={item.path} key={item.name} className={styles.navItem}>
                <h6>{item.name}</h6>
            </Link>
    });

    // Display and hide nav by toggling the state
    function displayNav() {
        setNavDisplay(prev => !prev);
    };

    const userManagementList = [
        {
            name: "User Management",
            path: ""
        },
        {
            name: "Access Control",
            path: ""
        },
        {
            name: "Add New User",
            path: ""
        },
        {
            name: "Password Policy",
            path: ""
        }
    ];
    const activityLogList = [
        {
            name: "Account Activity Log",
            path: ""
        }
    ];

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
                    <NavDropdown name="User Management" list={userManagementList} />
                    <NavDropdown name="Activity Log" list={activityLogList} />
                </div>
            </div>
            </div>
        </div>
    );
};

export default NavBar;