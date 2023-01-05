interface DividerProps {
    style?: React.CSSProperties
}

const border: React.CSSProperties = { 
	borderTop: "2px solid rgba(0,0,0,0.3)"
}

export function ModuleDivider(props: DividerProps) {
    return <hr style={{...border, ...props.style}}/>
}