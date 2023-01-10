import Head from 'next/head'
import React, { CSSProperties } from 'react';

interface ModuleHeaderProps {
	title?: string;
	header: string;
	headerSize?: string;
    children?: React.ReactNode;
}

const headerStyle: CSSProperties = {
	position: "relative",
	marginBottom: "2em"
}

const headerName: CSSProperties = {
	fontSize: "2.5rem"
}

const headerSide: CSSProperties = { 
	display: "flex",
	position: "absolute",
	right: 0,
	bottom: 0
}

const headerSideElement: CSSProperties = { 
	marginLeft: "0.3em",
	marginRight: "0.3em"
}

export function ModuleHeader(props: ModuleHeaderProps) {
	const headerFinalName:CSSProperties = props.headerSize ? {fontSize: props.headerSize} : headerName;
	 
	return (
	<div>
		{props.title && <Head><title>{props.title}</title></Head>}
		<div style={headerStyle}>
			<span style={headerFinalName}>{props.header}</span>
			<span style={headerSide}>
				{
					React.Children.map(props.children, child => {
						return <div style={headerSideElement}>{child}</div>
					})
				}
			</span>
		</div>
	</div>
	)
}