import React from "react";
import styles from '../styles/Footer.module.css';
import { AiOutlineCopyrightCircle } from 'react-icons/ai';
import AzendianLogo from "../public/AzendianLogo";

export default function Footer() {
    return (
        <footer className={styles.footerMain}>
            <div className={styles.footerLine}>
                    <AiOutlineCopyrightCircle />
                    <p  className={styles.footerCopyrightText}>2022 Copyright: <strong>Azendian Solutions Pte Ltd</strong></p>
            </div>
            <div className={styles.footerLine}>
                <AzendianLogo size={30} />
                <p className={styles.footerLastText}>Powered By Azendian Solutions</p>
            </div>
        </footer>
    );
};