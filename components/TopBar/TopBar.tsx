
import Image from 'next/image'
import { VscAccount } from "react-icons/vsc";
import DropdownMenu from './DropdownMenu';
import NavBar from '../NavBar/NavBar';
import colours from '../../styles/colours.module.scss'
import Link from 'next/link';
import { useCurrentUser } from '../SWR';
import useComponentVisible from './useComponentVisible';
import axios from 'axios';
import { useRouter } from 'next/router';
import { useContext } from 'react';

function ProfileInfo() {
	const {
		data,
		error
	} = useCurrentUser()

    const { ref, isComponentVisible, setIsComponentVisible } = useComponentVisible(false);

	const toggleDropdown = (): void => {
		if(isComponentVisible)	setIsComponentVisible(false);
		else					setIsComponentVisible(true);
	}

	return <>
		<VscAccount size={28} style={{color:"#707070", marginLeft: "auto", cursor: "pointer"}} onClick={toggleDropdown}/>
		{ isComponentVisible &&
		<div ref={ref} style={{
			position: "fixed",
			right: "5em",
			top: "5em",

			padding: "1em",

			backgroundColor: "white",
			border: "1px rgb(200,200,200) solid",
			borderRadius: "4px"
		}}>
			{data?.name}
			{data?.role_name}
		</div>
		}
	</>
}

export default function TopBar() {

	const router = useRouter();

	const getDashboard = () => {
		if (router.pathname.startsWith("/Dashboard")) return;
		axios.get("/api/dashboard/")
			.then(res => {
				router.push(res.data.homepage)
			})
			.catch(err => {
				console.log(err);
			})
	};

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
					borderBottom: "4px solid " + colours.primary,

					display: "flex",
					alignItems: "center"
				}
			}>
				<NavBar />
				<div onClick={getDashboard} style={{ cursor: "pointer" }}>
					<Image src="/keppellogo.png" alt="Keppell Logo" width={225} height={28}/>
				</div>

				<ProfileInfo/>

				<DropdownMenu/>
			</div>
		</div>
	)
}