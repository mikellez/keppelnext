import React, { ReactComponentElement, useEffect, useState } from 'react';
import Link from 'next/link';
import styles from '../../styles/Nav.module.scss'
import { SlArrowDown } from 'react-icons/sl';
import { SlArrowUp} from 'react-icons/sl';
import { useRouter } from 'next/router';

interface NavDropdownInfo {
    name: string;
    path?: string;
    navOpen?: boolean;
    icon?: React.ReactNode;
    children?: React.ReactNode;
} 

export function NavDropdownLink({children, href}: {children?: React.ReactNode, href: string}) {
    
    const router = useRouter();

    if(router.pathname === href)
        return <Link className={styles.navDropdownItem + " " + styles.navDropdownSelected} href={href}>{children}</Link>

    return <Link className={styles.navDropdownItem} href={href}>{children}</Link>
}

function NavDropdown(props: NavDropdownInfo) {
    // Storing whether user has clicked on the dropdown as a state
    const [isClicked, setIsClicked] = useState(false);
    const router = useRouter();

    useEffect(() => {
        if(props.path !== undefined && router.pathname.includes(props.path))
            setIsClicked(true);
        else
            setIsClicked(false);
    }, [router.pathname])

    const arrowStyles = {color:"#4D4D4D", marginLeft: "auto"};

    return (
        <div>
            <div className={styles.navItem} onClick={() => {setIsClicked(prev => !prev)}}>
                {props.icon}
                <h6 className={styles.navItemText}>{props.name}</h6>
                <div>
                    {isClicked ? <SlArrowUp style={arrowStyles}/> : <SlArrowDown style={arrowStyles}/>}
                </div>
            </div>
            <div style={{display: isClicked ? "flex" : "none"}} className={styles.navDropdownItems}>
                {props.children}
            </div>
        </div>

    );
};

export default NavDropdown;