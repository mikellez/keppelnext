import Head from 'next/head';
import Image from 'next/image'
import Link from 'next/link';
import styles from '../styles/404.module.scss'

function Custom403() {
	return (
		<div className={styles.errorContainer}>
			<Head>
				<title>403: Forbidden</title>
			</Head>
			<Image src="/keppellogo.png" alt="Keppell Logo" className={styles.errorTopImage} width={450} height={56}/>
			<div className={styles.errorText}>
				<span className={styles.errorHeader}>403|</span>
				<Image src="/server.png" alt="Error Image" className={styles.errorImage} width={234} height={307}/>
			</div>
			<span style={{position: "relative", top: "0.4em"}}>You do not have permissions to access this page.</span>
			<p>Contact your administrator or <Link href="/Dashboard"><u>return to home</u></Link></p>
		</div>
	)
}

export default Custom403;