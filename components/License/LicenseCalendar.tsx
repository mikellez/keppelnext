import React, { useState, useEffect } from "react";
import instance from "../../types/common/axios.config";
import { ModuleContent } from "../ModuleLayout/ModuleContent";
import styles from "../../styles/Schedule.module.scss";
import FullCalendar from "@fullcalendar/react";
import { EventClickArg } from "@fullcalendar/core";
import dayGridPlugin from "@fullcalendar/daygrid";
import { CMMSEvent } from "../../types/common/interfaces";
import { useRouter } from "next/router";

interface ExpiryDate {
  id: number;
  license_name: string;
  expiry_date: string;
}

const LicenseCalendar = ({ selectedPlant }: { selectedPlant: number }) => {
  const [expiryDates, setExpiryDates] = useState<CMMSEvent[]>([]);
  const router = useRouter();

  useEffect(() => {
    // console.log(selectedPlant)
    // if (selectedPlant) {

    instance
      .get(`/api/license/expiry_dates?plantId=${selectedPlant}`)
      .then((res) => {
        // console.log(selectedPlant);
        const expiryEvents = res.data.map((row: ExpiryDate) => {
          return {
            title: row.license_name,
            start: row.expiry_date,
            extendedProps: {
              license_id: row.id,
            },
          };
        });
        setExpiryDates(expiryEvents);
      });
    // }
  }, [selectedPlant]);

  return (
    <ModuleContent>
      <FullCalendar
        plugins={[dayGridPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: "today",
          center: "title",
          right: "prevYear,prev,next,nextYear",
        }}
        dayMaxEvents={2}
        eventDisplay="block"
        eventBackgroundColor="#C70F2B"
        eventBorderColor="#FFFFFF"
        eventTextColor="white"
        displayEventTime={false}
        eventClick={(e) =>
          router.push(`/License/Renew/${e.event._def.extendedProps.license_id}`)
        }
        eventMouseEnter={(info) => (document.body.style.cursor = "pointer")}
        eventMouseLeave={() => (document.body.style.cursor = "default")}
        events={expiryDates}
      />
    </ModuleContent>
  );
};

export default LicenseCalendar;
