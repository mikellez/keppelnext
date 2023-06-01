const  tableInfo = require("../../public/master.json");
const db = require("../../db");
const moment = require('moment');

const fetchMasterInfo = async (req, res, next) => {

	if(tableInfo[req.params.type] === undefined)
		return res.status(404).json("no type");
	console.log(tableInfo[req.params.type].internalName)
	let table       = tableInfo[req.params.type].internalName;
	let idColumn    = tableInfo[req.params.type].id;
	let q = `SELECT * FROM keppel.${table} ORDER BY ${idColumn}`;

	// if(table == 'system_assets'){
	// 	q = `SELECT keppel.system_assets.system_asset_id,keppel.system_assets.system_id,keppel.system_assets.system_asset_id,keppel.system_master.system_name,keppel.system_assets.system_asset
	// 	FROM keppel.system_assets
	// 	JOIN keppel.system_master
	// 	ON keppel.system_assets.system_id = keppel.system_master.system_id ORDER BY keppel.system_assets.system_asset_id
	// 	`;
	// }
	
	global.db.query(q, (err1, result) => {
		if (err1) {
			// throw err;
			return res.status(500).json({
					msg: err1,
			});
		}
		console.log(result.rows);
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
	console.log(req.body);
	let table=tableInfo[req.body.type].internalName;
	console.log(tableInfo)
	const today = moment(new Date()).format("DD/MM/YYYY HH:mm A");
	let sql;
	let insert =[];
	// if asset_type
	num="("
	temp = 0;

	columns ="(";
	for (const key in req.body.entries) {
		columns += key + ",";
		insert.push(req.body.entries[key]);
		temp++;
	}
	console.log(temp);
	for (let i = 0; i < temp; i++) {
		num += "$"+(i+1)+",";
	}
	columns = columns.slice(0, -1);
	columns += ",created_date, activity_log";
	columns += ")";
	let activity_log = [{
		date: today,
		name: req.user.name,
		role: req.user.role_name,
		activity: `Created ${tableInfo[req.body.type].name} Master ${tableInfo[req.body.type].name} `
	}];
	activity_log_json = JSON.stringify(activity_log);

	num = num.slice(0, -1);
	num += `, NOW(), '${activity_log_json}'`;
	num += ")";
	sql = `INSERT INTO keppel.${table} ${columns} VALUES ${num} `;
	console.log(sql)
	console.log(insert)
	global.db.query(sql,insert)	
		.then(result => {
			return res.status(200).send({
				msg: "success",
			})})
		.catch(err => {
			// console.log(err.table)
			// return err.table
			return res.status(500).send({
				msg: err,
				table: err.table
			})
		})
};

const fetchMasterTypeSingle = async (req, res, next) => {
	const { type, id } = req.params

	if(!type || !id)
		return res.status(400).json()

	if(!(type in tableInfo))
		return res.status(400).json("type does not exist")

	const query = `SELECT * FROM keppel.${tableInfo[type].internalName} WHERE ${tableInfo[type].id}=$1`

	global.db.query(query, [id], (err1, result) => {
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
	const today = moment(new Date()).format("DD/MM/YYYY HH:mm A");
	const activity_log = {
		date: today,
		name: req.user.name,
		role: req.user.role_name,
		activity: `Updated ${tableInfo[req.params.type].name} Master ${tableInfo[req.params.type].id} ${req.params.id}`
	};
	console.log(tableInfo)
	const activity_log_json = JSON.stringify(activity_log);
	

	function verifyColumns(tableName /*string*/, entries /*([column:string]: string)[]*/) {
		const columns = Object.keys(entries)
		if (tableName == 'plant_master')
			tableName = 'plant'
		if(tableName == 'system_master')
			tableName = 'system'
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
	console.log(q)
	if(!q)
		return res.status(400).json("entries invalid")

	// build query
	let i = 1;
	//let setQ = entryKeys.map(x => "" + x + "='$" + (i++) + "'").join(",");
	let setQ = q.map(x => "" + x.name + "=$" + (i++)).join(",");

	let query = `UPDATE keppel.${table} SET
			${setQ}, activity_log = activity_log || '${activity_log_json}'
            WHERE ${idColumn}=$${i}`

	console.log(query);
	const p = q.map(x => x.value)
	p.push(req.params.id);
	console.log(p)

	global.db.query(query, p, (err1, result) => {
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

	global.db.query(query, [id], (err1, result) => {
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