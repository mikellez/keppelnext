
import React, { useState , useEffect , useRef } from 'react'
import { SlArrowDown } from 'react-icons/sl'
import DropdownOption from './DropdownOption'
import styles from '../../styles/Dropdown.module.css'
import axios from 'axios'
import useComponentVisible from './useComponentVisible'


export default function DropdownMenu() {

    const { ref, isComponentVisible, setIsComponentVisible } = useComponentVisible(false);

	const [isDropdowned, setIsDropdowned] = useState(false);

	const sendLogout = (): void => {
		axios.post("/api/logout")
		.then((response) => {
			console.log("success", response);
			window.location.href = '/';
		}).catch((e) => {
			console.log("error", e);
			alert("logout fail")
		})
	}

	const logOut = (): boolean => {
		sendLogout();
		return false;
	}

	const toggleDropdown = (): void => {
		if(isComponentVisible)	setIsComponentVisible(false);
		else					setIsComponentVisible(true);
	}

	return <div ref={ref}>
		<button className={styles.dropdownButton} onClick={toggleDropdown}>
			<SlArrowDown size={28} style={{color:"#707070", marginLeft: "1.5em", marginRight:"1em"}}/>
		</button>
		{isComponentVisible && (
			<div className={styles.dropdownMenuContainer}>
				<DropdownOption href="/">Settings</DropdownOption>
				<DropdownOption href="#" onClick={logOut}>Logout</DropdownOption>
			</div>)
		}
	</div>
}