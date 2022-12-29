
import Image from 'next/image'
import styles from '../styles/Login.module.css'

export default function Custom404() {
	return (
		<div className={styles.loginContainer}>
			<Image src="/keppellogo.png" alt="Keppell Logo" className={styles.loginImage} width={450} height={56}/><br></br>
			<h1 className={styles.headerLogin} style={{textAlign: "center"}}>404</h1>
		</div>
	)
}