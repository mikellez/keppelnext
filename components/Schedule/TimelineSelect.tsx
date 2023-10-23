import React, { useEffect, useState } from "react";
import instance from "../../types/common/axios.config";
import { CMMSTimeline } from "../../types/common/interfaces";

interface TimelineSelectProps {
  onChange: React.ChangeEventHandler<HTMLSelectElement>;
  userCreated?: boolean;
  status: number;
  name: string;
  optionTitle?: string;
  specificTimelineId?: number;
  autoSelect?: boolean;
}
// Get timeline by status
export async function getTimelinesByStatus(
  status: number,
  userCreated: boolean = false
) {
  const url = userCreated
    ? "/api/timeline/status/" + status + "/1"
    : "/api/timeline/status/" + status;
  return await instance
    .get<CMMSTimeline[]>(url)
    .then((res) => {
      return res.data;
    })
    .catch((err) => console.log(err.message));
}

export async function getTimelinesById(id: number) {
  const url = "/api/timeline/" + id;
  return await instance
    .get<CMMSTimeline>(url)
    .then((res) => {
      return res.data;
    })
    .catch((err) => console.log(err.message));
}

export function compareWords(a: string, b: string) {
  if (a > b) return 1;
  if (a < b) return -1;
  return 0;
}

export default function TimelineSelect(props: TimelineSelectProps) {
  // Store the list of timelines in a state for dropdown
  const [timelineList, setTimelineList] = useState<CMMSTimeline[]>([]);
  const [selectedValue, setSelectedValue] = useState<string>("");

  useEffect(() => {
    props.specificTimelineId
      ? getTimelinesById(props.specificTimelineId).then((result) => {
          if (result) {
            setTimelineList([result]);
          } else {
            // console.log("no timelines");
            setTimelineList([]);
          }
        })
      : getTimelinesByStatus(props.status, props.userCreated).then((result) => {
          if (result) {
            result.sort((a, b) =>
              compareWords(a.plantName as string, b.plantName as string)
            );
            setTimelineList(result);
          } else {
            // console.log("no timelines");
            setTimelineList([]);
          }
        });

  }, [props.status, props.userCreated]);

   useEffect(() => {
      if(props.autoSelect) {
        if(sortedTimelineList.length>0) {
          setSelectedValue(sortedTimelineList[0]?.id.toString());
        }
      }
  }, [timelineList]);

  const sortedTimelineList = timelineList.sort((a, b) => 
    a.name.localeCompare(b.name)
  );

  // Timeline dropdown options
  const timelineOptions = sortedTimelineList.map((timeline, index) => (
    <option key={index} value={timeline.id}>
      {`${timeline.name} (${timeline.plantName})`}
    </option>
  ));

  return (
    <select className="form-select" onChange={props.onChange} name={props.name} value={selectedValue}>
      <option hidden>
        {!props.optionTitle ? "Select schedule" : "Select " + props.optionTitle}
      </option>
      {timelineOptions}
    </select>
  );
}
