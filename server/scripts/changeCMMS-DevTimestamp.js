const { connectDB, dellocateGlobalDB } = require("../db/dbAPI");

const runScript = async () => {
  connectDB("cmms_dev");
  global.db
    .query(
      `ALTER TABLE keppel.testevents
                        ALTER COLUMN datetime TYPE TIMESTAMP USING 
                        TO_TIMESTAMP(concat(SPLIT_PART(datetime, ' ', 1),
                        ' ',
                        SPLIT_PART(datetime, ' ', 2)), 'MM/DD/YYYY HH24:MI AM');`
    )
    .then((res) => {
      console.log("Altered datetime successfully");
      dellocateGlobalDB();
    });
};

runScript();
