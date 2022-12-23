import React, { useState } from 'react';
import Link from 'next/link';
import styles from '../styles/Nav.module.css'
import { SlArrowDown } from 'react-icons/sl';

const NavDropdown = () => {
    const [isClicked, setIsClicked] = useState(false);
    return (
        <div className={styles.navItem}>
            <h6 className={styles.navDropdown}>User Management</h6>
            <SlArrowDown style={{color:"#4D4D4D", marginLeft: "auto"}}/>
        </div>
    )
};

export default NavDropdown;