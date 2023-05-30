const moment = require("moment");

const findWeek = (date) => {
	return Math.floor((date.getDate() - 1) / 7);
}

module.exports.getDateRange = (start,period,end) => {
	var next_date = new Date(start);
	var range_of_dates =[next_date.toISOString().split('T')[0]];
	// var add_days = 0;
	if (period >= 28) {
		while (next_date <= end) {

			const startingWeek = findWeek(next_date) == 4 ? 0 : findWeek(next_date);
			next_date = new Date(next_date.setDate(next_date.getDate() + period));
			while (findWeek(next_date) !== startingWeek) {
				
				next_date = new Date(next_date.setDate(next_date.getDate() - 7));
			}
			if (moment(next_date,'YYYY-MM-DD')<= (moment(end,'YYYY-MM-DD'))) {
				range_of_dates.push(next_date.toISOString().split('T')[0]);
			}
		}
	} else {
		while (next_date <= end) {
			next_date = new Date(next_date.setDate(next_date.getDate() + period ));
			if (moment(next_date,'YYYY-MM-DD')<= (moment(end,'YYYY-MM-DD'))) {
				range_of_dates.push(next_date.toISOString().split('T')[0]);
			}
		}
	}
	return range_of_dates
}

