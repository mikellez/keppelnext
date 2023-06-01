const exec = require('child_process').exec;
const bcrypt = require("bcryptjs");
const { Client } = require('pg');
const fs = require('fs');

const checkIfDatabaseExists = (dbName) => {
    fs.readFile('../db/db.config.json', (err, data) => {
        if (err) console.log(err);
        if (data && JSON.parse(data)[dbName]) {
            throw new Error('Error: database alr exists.');
        }
    });
};

const createNewDatabase = (newDB, cb) => {
    return new Promise((resolve, reject) => {
        const script = exec(`sh db_clone.sh ${newDB}`);
        script.stdout.on('data', data => console.log(data));
        script.stderr.on('data', data => console.log(data));
        script.on('exit', (code) => {
            if (code == 0) {
                resolve("Database successfully created.");
            } else {
                reject("Database creation failed.");
            }
        })
    })
};

const connectDB = (dbName) => {
    const client = new Client({
        host: '192.168.20.96',
        port: 5432,
        database: dbName,
        user: 'postgres',
        password: '123Az!!!',
    });
    client.connect();
    return client;
};

// const changeSchemaName = async (dbName) => {
//     const client = connectDB(dbName);
//     await client.query(`
//         ALTER SCHEMA keppel RENAME TO company_schema
//     `);
//     client.end();
// };

const createAdminUser = async (dbName) => {
    const client = connectDB(dbName);

    const salt = bcrypt.genSaltSync(10);
    const hash = await bcrypt.hash('123Az!!!', salt);  

    await client.query(`
        INSERT INTO 
            keppel.users (
                user_name,
                user_email,
                user_pass,
                first_name,
                last_name,
                employee_id
            )
        VALUES (
            $1, $2, $3, $4, $5, $6
        )
    `, [
        'admin',
        'admin',
        hash,
        '',
        'Adminstrator',
        '-'
    ]);
    client.end();
};

const addToJSONFile = async (dbName) => {
    fs.readFile('../db/db.config.json', (err, data) => {
        if (err) console.log(err)
        if (data) {
            let json = JSON.parse(data)
            json[dbName] = {
                host: "192.168.20.96",
                port: 5432,
                database: dbName,
                user: "postgres",
                password: "123Az!!!"
            }
            fs.writeFile('../db/db.config.json', JSON.stringify(json), (err) => {
                if (err) console.log(err);
                else console.log("db.config.json successfully updated.");
            });
        }
    });    
};

const main = async (newDB) => {
    try {
        checkIfDatabaseExists(newDB);
        await createNewDatabase(newDB)
        // await changeSchemaName(newDB);
        await createAdminUser(newDB)
        addToJSONFile(newDB);
    } catch (err) {
        console.log(err);
    }
};


main("test_db");
