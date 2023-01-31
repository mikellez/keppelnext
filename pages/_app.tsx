import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/globals.css'
import "../styles/index.scss";

import type { AppProps } from 'next/app'
import { useEffect } from "react";
import { useRouter } from 'next/router';
import TopBar from '../components/TopBar/TopBar';
import Footer from '../components/Footer';


export default function App({ Component, pageProps }: AppProps) {
	const router = useRouter();
	const { asPath, route, pathname } = router;

	useEffect(() => {
		require("bootstrap/dist/js/bootstrap.bundle.min.js");
	}, []);

	console.log(asPath, route, pathname);

	if(asPath === "/Login" || pathname === "/404" || pathname === "/500")
		return <div><Component {...pageProps} /></div>

	return <div>
		<TopBar />
		<div style={
				{
					position: "relative",
					minHeight: "calc(100vh - 4rem)"
				}
			// minheight -4rem due to top bar height of 4 rem
			}>
			<div style={{paddingBottom: "12rem"}}>
				<Component {...pageProps} />
			</div>
			<Footer />
		</div>
	</div>
}
