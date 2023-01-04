import ModuleHeader from "./ModuleHeader";

interface ModuleInfo {
    title: string;
	header: string;
	includeGreyContainer?: boolean; 
    children: React.ReactNode;
}

function ModuleMain(props: ModuleInfo) {

	return (
		<div>
			<main className="container-md">
				<ModuleHeader title={props.title} header={props.header}></ModuleHeader>
				<div className={props.includeGreyContainer ? "mainContainer" : ""}>
                    {props.children}
                </div>
            </main>
        </div>
	)
}

export default ModuleMain;