import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import styles from '../../styles/Nav.module.scss'
import { SlArrowDown } from 'react-icons/sl';
import { SlArrowUp} from 'react-icons/sl';
import { NavLinkInfo } from './NavLink';


interface NavDropdownInfo {
    name: string;
    list: Array<NavLinkInfo>;
    navOpen?: boolean;
} 

function NavDropdown(props: NavDropdownInfo) {
    // Storing whether user has clicked on the dropdown as a state
    const [isClicked, setIsClicked] = useState(false);
    // Props mapped into dropdown elements

    useEffect(() => {
        setIsClicked(false);
    }, [props.navOpen])

    const dropdownElements = props.list.map(item => {
        return <Link href={item.path} key={item.name} onClick={item.onClick} className={styles.navDropdownItem}>
            {item.name}
            </Link>
    });

    const arrowStyles = {color:"#4D4D4D", marginLeft: "auto"};

    return (
        <div>
            <div className={styles.navItem} onClick={() => {setIsClicked(prev => !prev)}}>
                <h6 className={styles.navItemText}>{props.name}</h6>
                {isClicked ? <SlArrowUp style={arrowStyles}/> : <SlArrowDown style={arrowStyles}/>}
            </div>
            <div style={{display: isClicked ? "flex" : "none"}} className={styles.navDropdownItems}>
                {dropdownElements}
            </div>
        </div>

    );
};

export default NavDropdown;