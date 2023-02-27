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
	fault_types: {
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
	},
	asset_instrument: {
		internalName: "plant_system_assets",
		name: "Asset Instrument",
		id: "psa_id",
		fields: [{}]
	},
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

const createMasterTypeEntry = async (req, res, next) => {
	return res.status(200).json(tableInfo)
};

const fetchMasterTypeSingle = async (req, res, next) => {
	const { type, id } = req.params

	if(!type || !id)
		return res.status(400).send()

	if(!(type in tableInfo))
		return res.status(400).send("type does not exist")

	const query = `SELECT * FROM keppel.${tableInfo[type].internalName} WHERE ${tableInfo[type].id}=$1`

	db.query(query, [id], (err1, result) => {
		if (err1) {
			// throw err;
			return res.status(500).send({
				msg: err1,
			});
		}
		if (result.rows.length === 0) {
			return res.status(400).send({
				msg: "id does not exist",
			});
		}
		return res.status(200).json({
			name:tableInfo[type].name,
			fields:tableInfo[type].fields,
			data:result.rows[0]
		});
	});
}

const deleteMasterTypeSingle = async (req, res, next) => {
	const { type, id } = req.params

	if(!type || !id)
		return res.status(400).send()

	if(!(type in tableInfo))
		return res.status(400).send("type does not exist")

	const query = `DELETE FROM keppel.${tableInfo[type].internalName} WHERE ${tableInfo[type].id}=$1;`

	db.query(query, [id], (err1, result) => {
		if (err1) {
			// throw err;
			return res.status(500).send({
				msg: err1,
			});
		}
		if (result.rowCount === 0) {
			return res.status(400).send({
				msg: "id does not exist",
			});
		}
		return res.status(200).json(result.rows[0]);
	});
};

module.exports = {
	fetchMasterInfo,
	fetchMasterTypeEntry,
	createMasterTypeEntry,
	fetchMasterTypeSingle,
	deleteMasterTypeSingle
}