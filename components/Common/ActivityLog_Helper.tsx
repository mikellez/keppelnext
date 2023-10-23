import moment from "moment";

interface Status_Activity_Type_Data {
    [type: string]: string[];
  }
  

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

// Used to get the latest date from the activity_log based on the status string given:
const getLatestDateByStatus = (activity_log : { [key: string]: string }[] | undefined, status : string | undefined) => {
    
    if(activity_log && status){
        let activity_types = Schedule_Type[status];
        console.log(activity_types);
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