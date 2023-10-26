import moment from "moment";

/** 
 * This Helper function retrieves the latest date that a particular record was updated to a given status
 * 
 * The latest date is retrieved from the Activity_Log column of the record. Activity_Log is an array of jsons that gets added with an entry whenever
 * a change is made to a particular record. 
 * 
 * Example of activity_log column value:
 * [
  {
    "date": "2023-06-23 10:22:00",
    "name": " Administrator",
    "role": "Admin",
    "activity": "Request Created",
    "activity_type": "PENDING"
  },
  {
    "date": "2023-06-23 11:43:15",
    "name": " Administrator",
    "role": "Admin",
    "activity": "Assigned Changi CMT to Case ID: 329",
    "activity_type": "ASSIGNED"
  },
  {
    "date": "2023-06-23 11:44:22",
    "name": "Changi CMT",
    "role": "Operation Specialist",
    "activity": "Completed request",
    "activity_type": "COMPLETED"
  },]

  Hence, to get the latest date that the record was set to "ASSIGNED" status, we search for the last occurance of the activity_type "ASSIGNED"
  and read the "date" field for that json.
 * 
*/


interface Status_Activity_Type_Data {
    [type: string]: string[];
  }

interface Activity_Type_Status {
    [type: string]: Status_Activity_Type_Data;
  }
  
  

  /** Other activity type data for other modules can be created below here */
  const Schedule_Type: Status_Activity_Type_Data = {
    APPROVED : ["APPROVED"],
    REJECTED : ["REJECTED"],
    DRAFT : ["DRAFT"],
    PENDING : ["PENDING"],
    COMPLETED : ["COMPLETED"],
    "PENDING CANCELLED" : ["CANCELLED", "CANCELED"],
    CANCELLED : ["APPROVED CANCELLED","APPROVED CANCELED", "DELETED"],
    "REJECTED CANCELLED" : ["REJECTED CANCELLED", "REJECTED CANCELED" ],

  };

  // Add your created module activity type data as a key and value here:
  // The keys here should follow the string values from the enum "Module_Activity_Log". 
  const Activity_Status_Type: Activity_Type_Status = {
    "Schedule" : Schedule_Type,
  }

// Used to get the latest date from the activity_log based on the status string given:
const getLatestDateByStatus = (activity_log : { [key: string]: string }[] | undefined, status : string | undefined, status_type : string ) => {
    
    if(activity_log && status){
        let activity_types = Activity_Status_Type[status_type][status];
        if(activity_types){
            let dateToDisplay = activity_log
                    .findLast((activity) => 
                        activity_types.find((a) => a === activity["activity_type"].toUpperCase()) ? true : false
                    )?.date;
            if(dateToDisplay){
                return moment(
                    new Date(dateToDisplay)
                ).format("MMMM Do YYYY, h:mm:ss a")
            }
            else{
                return null;
            }
        }
        else{
            return null;
        }
        
    }
    else{
        return null;
    }
}

const ActivityLog_Helper = {
    getLatestDateByStatus,
}

export default ActivityLog_Helper;