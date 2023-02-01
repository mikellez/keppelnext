
const { Pool, Client } = require('pg')

let conn;

if (!conn) {
	conn = new Pool({
		user: 'postgres',
		host: '192.168.20.96',
		database: 'cmms_dev',
		password: '123Az!!!',
		port: 5432,
		application_name: 'Keppel CMMS (Next.js)'
	});
}

module.exports = conn ;