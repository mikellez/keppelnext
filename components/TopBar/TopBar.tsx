import Image from 'next/image'
import { BsList } from 'react-icons/bs'
import { VscAccount } from "react-icons/vsc";

import SideBar from '../SideBar'
import DropdownMenu from './DropdownMenu';

export default function TopBar() {

	return (
		<div>
			<div style={{backgroundColor: "#E3E3E3", padding: "0.5em", display: "flex", alignItems: "center"}}>
				<BsList size={42} style={{color:"#707070", marginRight:"1em"}}/>
				<Image src="/keppellogo.png" alt="Keppel Logo" width={225} height={28}/>
				<VscAccount size={28} style={{color:"#707070", marginLeft: "auto"}}/>
				<DropdownMenu/>
			</div>
		</div>
	)
}