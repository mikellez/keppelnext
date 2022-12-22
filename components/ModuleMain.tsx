import Head from 'next/head'

interface ModuleInfo {
    title: string;
    header: string;
    children: React.ReactNode;
}

function ModuleMain(props: ModuleInfo) {

	return (
		<div>
			<Head>
				<title>{props.title}</title>
				<link rel="icon" href="/favicon.ico" />
			</Head>

			<main className="container-md">
				<h1>{props.header}</h1>
				<div className="mainContainer">
                    {props.children}
                </div>
            </main>
        </div>
	)
}

export default ModuleMain;