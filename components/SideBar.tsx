
//import useState hook to create menu collapse state
import React, { useState, useEffect } from "react";

//import react pro sidebar components
import { Sidebar, Menu, MenuItem, SubMenu, useProSidebar } from 'react-pro-sidebar';

//const { collapseSidebar, toggleSidebar, collapsed, toggled, broken, rtl } = useProSidebar();

function SideBar() {/*
    const [showChild, setShowChild] = useState(false);
  
    // Wait until after client-side hydration to show
    useEffect(() => {
        setShowChild(true);
    }, []);
    
    if (!showChild) {
        // You can show some kind of placeholder UI here
        return null;
    }*/

    return <SideBarLayout />
}

function SideBarLayout() {
	return (
		<div style={{
			display: 'flex',
			height: '100%',
			position:'absolute'}}>
		<Sidebar defaultCollapsed={false}>
			<Menu>
				<SubMenu label="Charts">
					<MenuItem> Pie charts </MenuItem>
					<MenuItem> Line charts </MenuItem>
				</SubMenu>
				<MenuItem> Documentation </MenuItem>
				<MenuItem> Calendar </MenuItem>
			</Menu>
		</Sidebar>
		</div>
	);
}

export default SideBar;