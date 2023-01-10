import React, { CSSProperties } from "react"
import { BsCameraFill } from "react-icons/bs"

const greyFill = "rgba(0,0,0,0.05)"

const previewContainer: CSSProperties = {
	marginTop: "1em",
	marginBottom: "1em",
	padding: "1em",
	border: "6px solid " + greyFill,
	borderRadius: "8px",
	display:"block", flex:1, height: "50%"
}

const centerTransform: CSSProperties = {
	position: "relative",
	left: "50%",
	top: "50%",
	transform: "translate(-50%, -50%)",
}

const previewContent: CSSProperties = {
	...centerTransform,
	textAlign: "center",

	height: "100%",
	width: "100%",

	backgroundSize: "contain",
	backgroundRepeat: "no-repeat",
	backgroundPosition: "center"
}

interface ImagePreviewProps {
	previewObjURL?: string
}

export default function ImagePreview(props: ImagePreviewProps) {

	const previewContentFinal = props.previewObjURL ?
	{...previewContent, 
		backgroundImage: 'url("' + props.previewObjURL + '")',
	} : previewContent

	return (
		<div style={previewContainer} >
			<div style={previewContentFinal}>
				{!props.previewObjURL && <div style={centerTransform}><BsCameraFill size={104} fill={greyFill}/><div style={{color: "rgba(0,0,0,0.1)"}}>No Image</div></div>}
			</div>
		</div>
	)
}