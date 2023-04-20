import React from "react"
import styles from "../../styles/Schedule.module.scss"

export const EventColours = {
    scheduledCOP: {color: "#4D96FF", label: "Scheduled Change of Parts"},
    completedCOP: {color: "#36AE7C", label: "Completed Change of Parts"},
    completedTimeline: {color: "#F9D923", label: "Completed Checklist"},
    approvedTimeline: {color: "#FF6B6B", label: "Approved Checklist"}
};

const EventColorLegend = () => {
    const values = Object.values(EventColours);

    const legendElements = values.map(item => {
        return (
            <div key={item.color} className={styles.legendLine}>
                <div 
                    className={styles.legendColorBox}
                    style={{backgroundColor: item.color}}
                ></div>
                {item.label}
            </div>
        )
    })

    return (
        <div className={styles.legendContainer}>
            {legendElements}
        </div>
    );
};

export default EventColorLegend;