const db = require("../../db");

const tableInfo = {
	plant: {
		internalName: "plant_master",
		name: "Plant",
		id: "plant_id",
		fields: [{
			column_label: "Name",
			column_name: "plant_name"
		},{
			column_label: "Description",
			column_name: "plant_description"
		}]
	},
	system: {
		internalName: "system_master",
		name: "System",
		id: "system_id",
		fields: [{
			column_label: "Name",
			column_name: "system_name"
		}]
	},
	fault_type: {
		internalName: "fault_types",
		name: "Fault Type",
		id: "fault_id",
		fields: [{
			column_label: "Name",
			column_name: "fault_type"
		}]
	},
	asset_type: {
		internalName: "asset_type",
		name: "Asset Type",
		id: "asset_id",
		fields: [{
			column_label: "Name",
			column_name: "asset_type"
		}]
	}
}

const fetchMasterInfo = async (req, res, next) => {

	if(tableInfo[req.params.type] === undefined)
		return res.status(404).send("no type");

	let table       = tableInfo[req.params.type].internalName;
	let idColumn    = tableInfo[req.params.type].id;

	let q = `SELECT * FROM keppel.${table} ORDER BY ${idColumn}`;

	db.query(q, (err1, result) => {
		if (err1) {
			// throw err;
			return res.status(500).send({
					msg: err1,
			});
		}

		console.log(result);
		return res.status(200).json(
			{
				rows: result.rows,
				fields: result.fields 
			});
	});
};

const fetchMasterTypeEntry = async (req, res, next) => {
	return res.status(200).json(tableInfo)
};

const postMasterTypeEntry = async (req, res, next) => {
	
};

module.exports = {
	fetchMasterInfo,
	fetchMasterTypeEntry,
	postMasterTypeEntry
}