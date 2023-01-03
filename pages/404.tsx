
import Image from 'next/image'
import styles from '../styles/404.module.scss'

function Custom404() {
	return (
		<div className={styles.errorContainer}>
			<Image src="/keppellogo.png" alt="Keppell Logo" className={styles.errorTopImage} width={450} height={56}/>
			<div className={styles.errorText}>
				<span className={styles.errorHeader}>404|</span>
				<Image src="/server.png" alt="Error Image" className={styles.errorImage} width={234} height={307}/>
			</div>
			<span style={{position: "relative", top: "0.4em"}}>The page cannot be found</span>
			<p>Contact your administrator or <a href="/"><u>return to home</u></a></p>
		</div>
	)
}

export default Custom404;