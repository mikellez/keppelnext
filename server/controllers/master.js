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
	system_asset_lvl5: {
		internalName: "plant_system_assets",
		name: "plant_system_assets",
		id: "system_asset_lvl5",
		fields: [{
			column_label: "Name",
			column_name: "plant_system_assets"
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
		return res.status(404).json("no type");

	let table       = tableInfo[req.params.type].internalName;
	let idColumn    = tableInfo[req.params.type].id;

	let q = `SELECT * FROM keppel.${table} ORDER BY ${idColumn}`;

	db.query(q, (err1, result) => {
		if (err1) {
			// throw err;
			return res.status(500).json({
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
		return res.status(400).json()

	if(!(type in tableInfo))
		return res.status(400).json("type does not exist")

	const query = `SELECT * FROM keppel.${tableInfo[type].internalName} WHERE ${tableInfo[type].id}=$1`

	db.query(query, [id], (err1, result) => {
		if (err1) {
			// throw err;
			return res.status(500).json({
				msg: err1,
			});
		}
		if (result.rows.length === 0) {
			return res.status(400).json({
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

const updateMasterTypeSingle = async (req, res, next) => {

	// verifies if all the columns have been provided
	// returns false if failed
	// returns queryFields if success
	function verifyColumns(tableName /*string*/, entries /*([column:string]: string)[]*/) {
		const columns = Object.keys(entries)

		if(!(tableName in tableInfo))
			return false;

		/*for(let x of tableInfo[tableName].fields) {
			if( !(x.column_name in columns) )
				return false;
		}*/

		console.log(columns);
		tableInfo[tableName].fields.forEach(x => console.log(x.column_name));

		console.log(tableInfo[tableName].fields.every(x => (columns.includes(x.column_name))), 
					tableInfo[tableName].fields.every(x => (entries[x.column_name] !== undefined) ));

		const queryFields = [];
		for(let field of tableInfo[tableName].fields) {
			const index = columns.indexOf(field.column_name)
			if(index === -1)
				return false

			queryFields.push({
				name: columns[index],
				value: entries[columns[index]]
			})
		}

		if( !(tableInfo[tableName].fields.every(x => (columns.includes(x.column_name)) && (entries[x.column_name] !== undefined) )) )
			return false;

		return queryFields;
	}

	if(req.params.type === undefined || tableInfo[req.params.type] === undefined)
		return res.status(404).json("no type");

	if(req.params.id === undefined)
		return res.status(404).json("no id");

	let table       = tableInfo[req.params.type].internalName;
	let idColumn    = tableInfo[req.params.type].id;

	if(req.body.entries === undefined)
		return res.status(400).json("no entries provided")

	let entryKeys = Object.keys(req.body.entries)
	// verify columns are filled in
	const q = verifyColumns(table, req.body.entries)
	if(!q)
		return res.status(400).json("entries invalid")

	// build query
	let i = 1;
	//let setQ = entryKeys.map(x => "" + x + "='$" + (i++) + "'").join(",");
	let setQ = q.map(x => "" + x.name + "=$" + (i++)).join(",");

	let query = `UPDATE keppel.${table} SET
			${setQ}
            WHERE ${idColumn}=$${i}`

	console.log(query);

	const p = q.map(x => x.value)
	p.push(req.params.id);
	console.log(p)

	db.query(query, p, (err1, result) => {
		if (err1) {
			// throw err;
			console.log(err1)
			return res.status(500).json({
				msg: err1,
			});
		}
		if (result.rowCount === 0) {
			return res.status(400).json({
				msg: "id does not exist",
			});
		}
		return res.status(200).json("success");
	});

};

const deleteMasterTypeSingle = async (req, res, next) => {
	const { type, id } = req.params

	if(!type || !id)
		return res.status(400).json()

	if(!(type in tableInfo))
		return res.status(400).json("type does not exist")

	const query = `DELETE FROM keppel.${tableInfo[type].internalName} WHERE ${tableInfo[type].id}=$1;`

	db.query(query, [id], (err1, result) => {
		if (err1) {
			// throw err;
			return res.status(500).json({
				msg: err1,
			});
		}
		if (result.rowCount === 0) {
			return res.status(400).json({
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
	updateMasterTypeSingle,
	deleteMasterTypeSingle
}