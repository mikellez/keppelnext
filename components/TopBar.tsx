import Image from 'next/image'
import { BsList } from 'react-icons/bs'
import { SlArrowDown } from 'react-icons/sl'
import { VscAccount } from "react-icons/vsc";

import SideBar from '../components/SideBar'
import { useProSidebar } from 'react-pro-sidebar';

import { useState, useEffect } from 'react';

function TopBar() {

	return (
		<div>
			<div style={{backgroundColor: "#E3E3E3", padding: "0.5em", display: "flex", alignItems: "center"}}>
				<BsList size={42} style={{color:"#707070", marginRight:"1em"}}/>
				<Image src="/keppellogo.png" alt="Keppell Logo" width={225} height={28}/>
				<VscAccount size={28} style={{color:"#707070", marginLeft: "auto"}}/>
				<SlArrowDown size={28} style={{color:"#707070", marginLeft: "1.5em", marginRight:"1em"}}/>
				
			</div>
		</div>
	)
}

export default TopBar;