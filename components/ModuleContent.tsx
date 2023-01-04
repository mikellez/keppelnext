interface ModuleContentProps {
	includeGreyContainer?: boolean; 
    children: React.ReactNode;
}

function ModuleContent(props: ModuleContentProps) {
	return (
		<div className={"mainContainer" + (props.includeGreyContainer ? " greyContainer" : "")}>
			{props.children}
		</div>
	)
}

export default ModuleContent;