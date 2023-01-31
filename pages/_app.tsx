import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/globals.scss'
import "../styles/index.scss";
//import "nprogress/nprogress.css"

import type { AppProps } from 'next/app'
import { useEffect } from "react";
import { useRouter } from 'next/router';
import TopBar from '../components/TopBar/TopBar';
import Footer from '../components/Footer';
import nProgress from 'nprogress';

export default function App({ Component, pageProps }: AppProps) {
	const router = useRouter();
	const { asPath, route, pathname } = router;

	useEffect(() => {
		require("bootstrap/dist/js/bootstrap.bundle.min.js");

		const handleRouteStart = () => nProgress.start();
		const handleRouteDone = () => nProgress.done();

		router.events.on("routeChangeStart",		handleRouteStart);
		router.events.on("routeChangeComplete",		handleRouteDone);
		router.events.on("routeChangeError",		handleRouteDone);

		return () => {
			// unmounting
			router.events.off("routeChangeStart",		handleRouteStart);
			router.events.off("routeChangeComplete",	handleRouteDone);
			router.events.off("routeChangeError",		handleRouteDone);
		}
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
