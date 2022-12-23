import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/globals.css'
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

	if(asPath === "/Login")
		return <div><Component {...pageProps} /></div>

	// return <div><TopBar /><Component {...pageProps} /><Footer /></div>
	return <div><Component {...pageProps} /></div>
}
