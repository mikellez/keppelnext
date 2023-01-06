import React, { CSSProperties } from "react"

interface ModuleFooterProps {
	children?: React.ReactNode;
}

const footerStyle: CSSProperties = {
	marginBottom: "4em"
}

const footerSideElement: CSSProperties = { 
	float: "right",
	marginRight: "1em"
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