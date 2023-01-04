interface ModuleMainProps {
    children: React.ReactNode;
}

export default function ModuleMain(props: ModuleMainProps) {
	return (
		<main className="container-md">
			{props.children}
        </main>
	)
}