import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import styles from '../../styles/Nav.module.scss'
import { GrClose, GrSchedules, GrUserSettings, GrHistory, GrHostMaintenance } from "react-icons/gr";
import { BsList, BsHouseDoor } from 'react-icons/bs'
import { TbChecklist } from "react-icons/tb";
import { AiOutlineQrcode , AiOutlineControl } from "react-icons/ai";
import { MdWorkOutline } from "react-icons/md";
import { VscBook } from "react-icons/vsc";
import NavDropdown from './NavDropdown';
import NavLink, { NavLinkInfo } from './NavLink';
import { MenuItem } from 'react-pro-sidebar';

export default function NavBar() {

    const [navDisplay, setNavDisplay] = useState(false);
    const [isTransitioning, setTransitioning] = useState(false);

    // Display and hide nav by toggling the state
    function displayNav() {
        // check if the navbar is still transitioning to another state
        // ignore if still transitioning to prevent double clicks
        if(isTransitioning)
            return;

        setTransitioning(true);
        setTimeout(() => {
            setTransitioning(false)
        }, 300);

        setNavDisplay(prev => !prev);
    };

    // Dropdown list for user management
    const userManagementList : NavLinkInfo[] = [
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
    const activityLogList : NavLinkInfo[] = [
        {
            name: "Account Activity Log",
            path: ""
        }
    ];

    // Dropdown list for schedule
    const scheduleList : NavLinkInfo[] = [
        {
            name: "View Schedule",
            path: "/Schedule",
        },
        {
            name: "Create Schedule",
            path: "/Schedule/Create",
        },
        {
            name: "Manage Schedule",
            path: "/Schedule/Manage",
        }
    ];

    return (
        <div>
            <BsList onClick={displayNav} size={42} style={{color:"#707070", marginRight:"1em", cursor: "pointer"}}/>
            <div onClick={displayNav} className={styles.overlay} style={
                {
                    position: "fixed",
                    visibility: navDisplay ? "visible"  : "collapse",
                    opacity:    navDisplay ? "100%"     : "0%",
                    zIndex: 5
                }
            }>
            </div>
            <div className={styles.navMain} style={
                {
                    //display: navDisplay ? "block" : "none",
                    transform: navDisplay ? "translateX(0)" : "translateX(-20rem)"
                }
            }>
                <div className={styles.navItems}>
                    <div className={styles.navHead}>
                        <h3 className={styles.navItemText}>Menu</h3>
                        <GrClose onClick={displayNav} size={25} style={{color:"#4D4D4D", marginLeft: "auto", cursor: "pointer"}} />
                    </div>

                    <NavLink     name="Request"           onClick={displayNav} path="/Request" icon={<GrHostMaintenance />} />
                    <NavLink     name="Asset"             onClick={displayNav} path="/Asset" icon={<BsHouseDoor size={21} />} />
                    <NavDropdown name="Schedule"          list={scheduleList.map(item => {
                        return {...item, onClick: displayNav}
                    })} navOpen={navDisplay} icon={<GrSchedules />}/>
                    <NavLink     name="Checklist"         onClick={displayNav} path="/Checklist" icon={<TbChecklist size={21}/>} />
                    <NavLink     name="E-Logbook"         onClick={displayNav} path="/Logbook" icon={<VscBook size={21} />} />
                    <NavLink     name="Generate QR Codes" onClick={displayNav} path="/QRCode" icon={<AiOutlineQrcode size={21}/>} />
                    <NavLink     name="Workflow"          onClick={displayNav} path="/Workflow" icon={<MdWorkOutline size={21} />} />
                    <NavLink     name="Master"            onClick={displayNav} path="/Master" icon={<AiOutlineControl size={21} />} />
                    <NavDropdown name="User Management"   list={userManagementList.map(item => {
                        return {...item, onClick: displayNav}
                    })} navOpen={navDisplay} icon={<GrUserSettings />} />
                    <NavDropdown name="Activity Log"      list={activityLogList.map(item => {
                        return {...item, onClick: displayNav}
                    })} navOpen={navDisplay} icon={<GrHistory />} />
                </div>
            </div>
        </div>
    );
};