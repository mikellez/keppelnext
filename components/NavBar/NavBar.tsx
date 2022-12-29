import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import styles from '../../styles/Nav.module.scss'
import { GrClose } from "react-icons/gr";
import { BsList } from 'react-icons/bs'
import NavDropdown from './NavDropdown';
import NavLink from './NavLink';

const NavBar= () => {
    const router = useRouter();
    // Storing whether user has clicked on the nav button as a state
    const [navDisplay, setNavDisplay] = useState(false);

    // Display and hide nav by toggling the state
    function displayNav() {
        setNavDisplay(prev => !prev);
    };

    // Dropdown list for user management
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

    // Dropdown list for activity log
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
                position: "fixed",
                display: navDisplay ? "block" : "none",
                zIndex: navDisplay ? 5 : -1
                }}>
            <div className={styles.navMain} style={{display: navDisplay ? "block" : "none"}}>
                <div className={styles.navItems}>
                    <div className={styles.navHead}>
                        <h3 className={styles.navItemText}>Menu</h3>
                        <GrClose onClick={displayNav} size={25} style={{color:"#4D4D4D", marginLeft: "auto"}} />
                    </div>

                    <NavLink name="Dashboard" path="/Dashboard" />
                    <NavLink name="Request" path="/Request" />
                    <NavLink name="Asset" path="/Asset" />
                    <NavLink name="Schedule" path="/Schedule" />
                    <NavLink name="Checklist" path="/Checklist" />
                    <NavLink name="E-Logbook" path="/Logbook" />
                    <NavLink name="Generate QR Codes" path="/QRCode" />
                    <NavLink name="Workflow" path="/Workflow" />
                    <NavLink name="Master" path="/Master" />

                    <NavDropdown name="User Management" list={userManagementList} />
                    <NavDropdown name="Activity Log" list={activityLogList} />
                </div>
            </div>
            </div>
        </div>
    );
};

export default NavBar;