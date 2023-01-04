import Head from 'next/head'

interface ModuleHeaderProps {
	title: string;
	header: string;
    children?: React.ReactNode;
}

export default function ModuleHeader(props: ModuleHeaderProps) {
	return <div>
		<Head>
			<title>{props.title}</title>
		</Head>
		<h1>{props.header}</h1></div>
}