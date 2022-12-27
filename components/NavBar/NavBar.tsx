import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import styles from '../../styles/Nav.module.css'
import { GrClose } from "react-icons/gr";
import { BsList } from 'react-icons/bs'
import NavDropdown from './NavDropdown';

const NavBar= () => {
    const router = useRouter();
    // Storing whether user has clicked on the nav button as a state
    const [navDisplay, setNavDisplay] = useState(false);
    // List of nav elements and paths
    const [navState, setNavState] = useState([
        {
            name: "Dashboard",
            path: "/Dashboard",
            selected: false
        },
        {
            name: "Request",
            path: "/Request",
            selected: false
        },
        {
            name: "Asset",
            path: "/Asset",
            selected: false
        },
        {
            name: "Schedule",
            path: "/Schedule",
            selected: false
        },
        {
            name: "Checklist",
            path: "/Checklist",
            selected: false
        },
        {
            name: "E-Logbook",
            path: "/Logbook",
            selected: false
        },
        {
            name: "Generate QR Codes",
            path: "/QRCode",
            selected: false
        },
        {
            name: "Workflow",
            path: "/Workflow",
            selected: false
        },
        {
            name: "Master",
            path: "/Master",
            selected: false
        }
    ]);

    useEffect(() => {
        // Hide nav on page change
        setNavDisplay(false);

        // Current path 
        const currentPath = router.pathname;

        // Change the state of the nav according to the current path
        setNavState(prevNav => {
            const newNav = prevNav.map(item => {
                if (currentPath.includes(item.path)) {
                    item.selected = true;
                } else {
                    item.selected = false;
                }
                return item;
            })
            return newNav;
        })
    }, [router.pathname]);

    // Mapping the nav array elements into jsx elements
    const navElement = navState.map(item => {
        return <Link href={item.path} 
        key={item.name} 
        className={styles.navItem} 
        style={{backgroundColor: item.selected ? "#E38B29" : "#f7f7f7"}}>
                <h6 className={styles.navItemText}>{item.name}</h6>
            </Link>
    });

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
                display: navDisplay ? "block" : "none",
                zIndex: navDisplay ? 5 : -1
                }}>
            <div className={styles.navMain} style={{display: navDisplay ? "block" : "none"}}>
                <div className={styles.navItems}>
                    <div className={styles.navHead}>
                        <h3 className={styles.navItemText}>Menu</h3>
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