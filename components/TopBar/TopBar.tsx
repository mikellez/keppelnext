
import Image from 'next/image'
import { VscAccount } from "react-icons/vsc";
import DropdownMenu from './DropdownMenu';
import NavBar from '../NavBar/NavBar';

export default function TopBar() {

	return (
		<div>
			<div style={
				{
					position: "fixed",

					top: 0,
					height: "4rem",
					width: "100%",
					zIndex: "255",

					padding: "0.5rem",

					backgroundColor: "#E3E3E3",
					display: "flex",
					alignItems: "center"
				}
			}>
				<NavBar />
				<Image src="/keppellogo.png" alt="Keppell Logo" width={225} height={28}/>
				<VscAccount size={28} style={{color:"#707070", marginLeft: "auto"}}/>
				<DropdownMenu/>
			</div>
		</div>
	)
}