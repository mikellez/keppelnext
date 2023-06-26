const { connectDB, dellocateGlobalDB } = require("../db/dbAPI");

const runScript = async () => {
    let args = process.argv.slice(2);
    console.log(args);
    if (args.length != 1) {
        throw new Error("1 argument required only")
    }
    connectDB("cmms_dev");
    await global.db.query(`UPDATE ${args[0]}
    SET activity_log = (
      SELECT jsonb_agg(
        CASE 
          WHEN elem->>'date' LIKE '%/%'
          THEN jsonb_set(elem, '{date}', to_jsonb(concat(split_part(elem->>'date', ' ', 1), ' ', split_part(elem->>'date', ' ', 2))))
          ELSE elem
        END
      )
      FROM jsonb_array_elements(activity_log) AS elem
    )`);
    await global.db.query(`UPDATE ${args[0]}
    SET activity_log = (
      SELECT jsonb_agg(
        CASE 
          WHEN elem->>'date' LIKE '%/%'
          THEN jsonb_set(elem, '{date}', to_jsonb(to_timestamp(elem ->>'date', 'DD/MM/YYYY HH24:MI AM')::timestamp))
          ELSE elem
        END
      )
      FROM jsonb_array_elements(activity_log) AS elem
    )`);
    await global.db.query(`UPDATE ${args[0]}
    SET activity_log = (
      SELECT jsonb_agg(
        jsonb_set(elem, '{date}', to_jsonb(replace(elem->>'date', 'T', ' ')))
      )
      FROM jsonb_array_elements(activity_log) AS elem
    )`)
}

runScript();