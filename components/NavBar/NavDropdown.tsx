import React, { useState } from 'react';
import Link from 'next/link';
import styles from '../../styles/Nav.module.scss'
import { SlArrowDown } from 'react-icons/sl';
import { NavLinkInfo } from './NavLink';


interface NavListInfo {
    name: string;
    path: string;
}

interface NavDropdownInfo {
    name: string;
    list: Array<NavListInfo>;
} 

function NavDropdown(props: NavDropdownInfo) {
    // Storing whether user has clicked on the dropdown as a state
    const [isClicked, setIsClicked] = useState(false);
    // Props mapped into dropdown elements
    const dropdownElements = props.list.map(item => {
        return <Link href={item.path} key={item.name} className={styles.navDropdownItem}>
            {item.name}
            </Link>
    });

    return (
        <div>
            <div className={styles.navItem} onClick={() => {setIsClicked(prev => !prev)}}>
                <h6 className={styles.navItemText}>{props.name}</h6>
                <SlArrowDown style={{color:"#4D4D4D", marginLeft: "1.5rem"}}/>
            </div>
            <div style={{display: isClicked ? "flex" : "none"}} className={styles.navDropdownItems}>
                {dropdownElements}
            </div>
        </div>

    );
};

export default NavDropdown;