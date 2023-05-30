const moment = require("moment");

module.exports.getDateRange = (start,period,end) => {
	var next_date = new Date(start);
	var range_of_dates =[next_date.toISOString().split('T')[0]];
	var add_days = 0;
	while (next_date <= end)
	    //Add only for Recurring events
	{   
		if (period >0) {
		//   add_days = module.exports.get_no_of_days(next_date,period);

			temp_date = new Date(next_date.setDate(next_date.getDate() + period ));
						
			next_date = temp_date;
						
			if (moment(temp_date,'YYYY-MM-DD')<= (moment(end,'YYYY-MM-DD'))) 
			{
				range_of_dates.push(temp_date.toISOString().split('T')[0]);
			}//end if moment
		} //end if
		else
		{
			break;
		}
	}//end while
	next_date = null;
	//console.log("Start: " + start + "End =" + end + "Range= " + range_of_dates);
	return range_of_dates
}//end daterange

module.exports.get_no_of_days = (current_startdate, period_stated) => {
//defaul starting period to differentiate daily/monthly/quarterly/semi-annual /yearly
 var daysInMonth = period_stated
  //console.log("get" + current_startdate );
  //Case I: no recurrence

  //Case 2 : Recurrence 
  switch(true) {
  
  case (period_stated < 30): // n days period no change   
		daysInMonth = period_stated ;
		break;
  case (period_stated >= 30): //monthly: get the number of days for the current month
    daysInMonth = 0;
		cut_off = Math.round(period_stated/30);
		//console.log("Cut off ="+ cut_off + "period =" + period_stated);
		for (let mon = 1; mon <= cut_off; mon++) {
		 // console.log( "mon=" + mon);
      		daysInMonth += new Date(current_startdate.getFullYear(), current_startdate.getMonth()+ mon, 0).getDate();
    	}
	  //console.log("Days in Month (monthly) : " + current_startdate.getMonth() + " =" + daysInMonth);
	  console.log(`Days in month: ${daysInMonth}`);
    break; 
}//end switch
return (daysInMonth)
}//end get_no_of_days

