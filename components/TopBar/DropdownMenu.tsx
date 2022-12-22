
import React from 'react'
import { SlArrowDown } from 'react-icons/sl'
import DropdownOption from './DropdownOption'
import styles from '../../styles/DropdownMenu.module.css'
import axios from 'axios'

export default function DropdownMenu() {

	const sendLogout = () => {
		axios.post("/api/logout")
		.then((response) => {
			console.log("success", response);
			window.location.href = '/';
		}).catch((e) => {
			console.log("error", e);
			alert("logout fail")
		})
	}

	const logOut = (): void => {
		sendLogout();
	}

	return <div>
		<SlArrowDown size={28} style={{color:"#707070", marginLeft: "1.5em", marginRight:"1em"}}/>
		<div className={styles.dropdownMenuContainer}>
			<DropdownOption href="google.com">Settings</DropdownOption>
			<DropdownOption funcOnClick={logOut}>Logout</DropdownOption>
		</div>
	</div>
}