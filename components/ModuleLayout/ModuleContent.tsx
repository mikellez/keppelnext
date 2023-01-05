interface ModuleContentProps {
	includeGreyContainer?: boolean;
	grid?: boolean;
    children: React.ReactNode;
}

export function ModuleContent(props: ModuleContentProps) {
	return (
		<div className={"mainContainer"
			+ (props.includeGreyContainer	? " greyContainer" : "")
			+ (props.grid					? " gridContainer" : "")}>
			{props.children}
		</div>
	)
}