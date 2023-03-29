import styles from "../styles/animations.module.css"

export default function LoadingHourglass({size, colour}: {size?: number, colour?: string})
{
    return (
        <svg width={size || 64} height={size || 64} stroke={colour || "#808080"} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <g className={styles.spinner_V8m1}>
                <circle cx="12" cy="12" r="9.5" fill="none" stroke-width="3"/>
            </g>
        </svg>
    )
}