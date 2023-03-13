const db = require("../../db");

const fetchFaultTypes = async (req, res, next) => {
	db.query(`SELECT * FROM keppel.fault_types ORDER BY fault_id ASC`, (err, result) => {
		if(err) return res.status(500).json({errormsg: err});
		res.status(200).json(result.rows);
	})
}

module.exports = {
	fetchFaultTypes
}