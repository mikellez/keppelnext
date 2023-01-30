import React, { CSSProperties } from "react"

interface ModuleFooterProps {
	children?: React.ReactNode;
}

const footerStyle: CSSProperties = {
	display: "flex",
	alignItems: "center",
	justifyContent: "right"
}

const footerSideElement: CSSProperties = { 
	float: "right",
	marginLeft: "1em"
}

export function ModuleFooter(props: ModuleFooterProps) {
return (
	<div style={footerStyle}>
		{
			React.Children.map(props.children, child => {
				return <div style={footerSideElement}>{child}</div>
			})
		}
	</div>
	)
}