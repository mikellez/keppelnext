import React, { useEffect, useState, useTransition } from 'react';
import styles from '../../styles/Nav.module.scss'
import { GrClose } from "react-icons/gr";
import { BsList, BsHouseDoor } from 'react-icons/bs'
import { TbChecklist } from "react-icons/tb";
import { AiOutlineQrcode , AiOutlineControl, AiOutlineUser, AiOutlineSchedule, AiOutlinePhone, AiOutlineHistory, AiOutlineDashboard } from "react-icons/ai";
import { MdWorkOutline } from "react-icons/md";
import { VscBook } from "react-icons/vsc";
import NavDropdown, { NavDropdownLink } from './NavDropdown';
import NavLink, { NavLinkInfo } from './NavLink';
import { useCurrentUser } from '../SWR';
import { useRouter } from 'next/router';

export default function NavBar() {

    const [navDisplay, setNavDisplay] = useState<boolean>(false);
    const [isTransitioning, setTransitioning] = useState<boolean>(false);

    const {
		data,
		error,
	} = useCurrentUser();

    const router = useRouter();
    
    useEffect(() => {
        console.log(router.events)

        const closeOnRouteChange = () => {
            setNavDisplay(false);
        }

        router.events.on("routeChangeStart", closeOnRouteChange);

        return () => {
            router.events.off("routeChangeStart", closeOnRouteChange);
        }
    }, []);

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

    useEffect(() => {
        console.log(data)
    }, [data])

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
            }></div>
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

                    <NavLink     name="Dashboard"         path="/Dashboard"     icon={<AiOutlineDashboard size={21} />} />
                    <NavLink     name="Request"           path="/Request"       icon={<AiOutlinePhone size={21} />} />
                    <NavLink     name="Asset"             path="/Asset"         icon={<BsHouseDoor size={21} />} />
                    <NavDropdown name="Schedule"          path="/Schedule" navOpen={navDisplay} icon={<AiOutlineSchedule size={21} />}>
                        <NavDropdownLink href="/Schedule" >View Schedules</NavDropdownLink>
                        <NavDropdownLink href="/Schedule/Create" >Create Schedule</NavDropdownLink>
                        {data && (data.role_id === 1 || data.role_id === 2 ) &&
                            <NavDropdownLink href="/Schedule/Manage" >Manage Schedules</NavDropdownLink>
                        }
                    </NavDropdown>
                    <NavLink     name="Checklist"         path="/Checklist"     icon={<TbChecklist size={21}/>} />
                    <NavLink     name="E-Logbook"         path="/Logbook"       icon={<VscBook size={21} />} />
                    <NavLink     name="Generate QR Codes" path="/QRCode"        icon={<AiOutlineQrcode size={21}/>} />
                    <NavLink     name="Workflow"          path="/Workflow"      icon={<MdWorkOutline size={21} />} />
                    <NavLink     name="Master"            path="/Master"        icon={<AiOutlineControl size={21} />} />
                    <NavDropdown name="User Management"   path="/User" navOpen={navDisplay} icon={<AiOutlineUser size={21} />}>
                        <NavDropdownLink href="/">User Management</NavDropdownLink>
                        <NavDropdownLink href="/">Access Control</NavDropdownLink>
                        <NavDropdownLink href="/">Add New User</NavDropdownLink>
                        <NavDropdownLink href="/">Password Policy</NavDropdownLink>
                    </NavDropdown>
                    <NavDropdown name="Activity Log"      path="/Activity" navOpen={navDisplay} icon={<AiOutlineHistory size={21} />}>
                        <NavDropdownLink href="/">Account Activity Log</NavDropdownLink>
                    </NavDropdown>
                </div>
            </div>
        </div>
    );
};