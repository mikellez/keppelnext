const cron = require("node-cron");
const { knex } = require("knex");
const knexJSON = require("../db/db.knexConfig.json");

const connectDB = () => {
  const dbName = knexJSON["cmms"];
  const client = knex(dbName);
  return client;
};

// Only do it for checklist records
const fetchNewlyOverdueChecklists = async () => {
    const client = connectDB();
    const result = await client("keppel.checklist_master")
    .select()
    // Condition to check if the checklist is overdue past the created date based on the overdue freq field
    .where(function () {
        this.where('overdue', 'Daily').andWhereRaw('created_date + INTERVAL \'1 day\' < NOW()');
      }).orWhere(function () {
        this.where('overdue', 'Weekly').andWhereRaw('created_date + INTERVAL \'1 week\' < NOW()');
      }).orWhere(function () {
        this.where('overdue', 'Monthly').andWhereRaw('created_date + INTERVAL \'1 month\' < NOW()');
      }).orWhere(function () {
        this.where('overdue', 'Quarterly').andWhereRaw('created_date + INTERVAL \'3 month\' < NOW()');
      }).orWhere(function () {
        this.where('overdue', 'Half Yearly').andWhereRaw('created_date + INTERVAL \'6 month\' < NOW()');
      }).orWhere(function () {
        this.where('overdue', 'Annually').andWhereRaw('created_date + INTERVAL \'1 year\' < NOW()');
      }) 
    .andWhere(builder =>{
      builder.where('status_id', 1).orWhere('status_id', 2); // Status of checklist is Assigned or Pending
    })
    .andWhere(builder =>{
      builder.whereNot('overdue', true) // Retrieve those that have not yet been set to overdue:
    })
    .catch(error => {
      console.log("Unable to retrieve newly overdue checklists: " + error);
    })
    .finally(() => {
      client.destroy();
    })
    return result;
  };

const handleOverdueChecklists = async (id) => {
    const client = connectDB();
    const result = await client("keppel.checklist_master")
    .where('checklist_id', id)
    .update({
      overdue_status: true // set overdue status
    }).catch(error => {
      console.log("Unable to update checklist overdue_status: " + error);
    })
    .finally(() => {
      client.destroy();
    });
    //console.log(result);
    return result;
  };
const main = async () => {
    try {
      // Get the checklists that have just been overdue
      const checklists = await fetchNewlyOverdueChecklists();
      console.log(checklists);
      
      // Set the status of every checklists to be overdue (overdue_status = true)
      for (let cl of checklists) {
        //console.log(cl.checklist_id);
        await handleOverdueChecklists(cl.checklist_id);
      }
      
    } catch (error) {
      console.log(error);
    }
  };
  
module.exports = cron.schedule("0 8 * * *", () => {
    main();
});


