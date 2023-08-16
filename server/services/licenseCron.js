/**
 *
 * Explanation of LicenseCron Module
 *
 * This module helps to automatically check for expired license everymoring at 0800
 * and emails the finding to the assignee
 *
 * This module also checks for license expiring in 30,60,90 days and send a reminder
 * to the assigned party
 *
 * This module makes use of Cron from node
 *
 *
 */

const { ExpireLicenseMail } = require("../mailer/LicenseMail");
const { ReminderLicenseMail } = require("../mailer/LicenseMail");
const cron = require("node-cron");
const { Client } = require("pg");
const moment = require("moment");
const exp = require("constants");
const dbJSON = require("../db/db.config.json");

const connectDB = () => {
  const dbName = dbJSON["cmms_dev"];
  const client = new Client(dbName);
  client.connect();
  return client;
};

const OngoingMailQuery = `
SELECT 
    AGE(lc.expiry_date, CURRENT_dATE) as age, 
    license_id, 
    license_provider,
    lc.license_name,
    asset_name,
    user_email,
    concat( concat(u.first_name ,' '), u.last_name ) AS user_name,
	plant_name,
	concat(concat(pl.loc_floor, ' | '),pl.loc_room) as plant_loc
FROM
    keppel.license lc
    left JOIN 
        (SELECT psa_id ,  concat( system_asset , ' | ' , plant_asset_instrument ) AS asset_name 
            FROM  keppel.system_assets   AS t1 ,keppel.plant_system_assets AS t2
            WHERE t1.system_asset_id = t2.system_asset_id_lvl4) tmp1 ON tmp1.psa_id = lc.linked_asset_id
    left JOIN keppel.users u ON lc.assigned_user_id = u.user_id
	left JOIN keppel.plant_master pm ON lc.plant_id = pm.plant_id
	left JOIN keppel.plant_location pl ON lc.plant_loc_id = pl.loc_id
WHERE 
    DATE_PART('days',AGE(lc.expiry_date,CURRENT_dATE)) > 0 AND
    lc.status_id != 5
`;

const fetchOngoingLicense = async () => {
  const client = connectDB();
  const result = await client.query(OngoingMailQuery);

  client.end();
  return result.rows;
};

const checkExpiredLicense = async () => {
  const client = connectDB();
  const result = await client.query(`
  SELECT 
    license_id
  FROM
    keppel.license lc 
  WHERE 
    DATE_PART('days',AGE(lc.expiry_date,CURRENT_dATE)) <= 0 AND
    lc.status_id != 5 AND
    lc.status_id != 4
  `);
  client.end();
  return result.rows;
};

const fetchLicenseTemplate = async (license_id) => {
  const client = connectDB();
  const result = await client.query(`
  SELECT 
    AGE(lc.expiry_date, CURRENT_dATE) as age, 
    license_id, 
    license_provider,
    lc.license_name,
    asset_name,
    user_email,
    concat( concat(u.first_name ,' '), u.last_name ) AS user_name,
	plant_name,
	concat(concat(pl.loc_floor, ' | '),pl.loc_room) as plant_loc
FROM
    keppel.license lc
    left JOIN 
        (SELECT psa_id ,  concat( system_asset , ' | ' , plant_asset_instrument ) AS asset_name 
            FROM  keppel.system_assets   AS t1 ,keppel.plant_system_assets AS t2
            WHERE t1.system_asset_id = t2.system_asset_id_lvl4) tmp1 ON tmp1.psa_id = lc.linked_asset_id
    left JOIN keppel.users u ON lc.assigned_user_id = u.user_id
	left JOIN keppel.plant_master pm ON lc.plant_id = pm.plant_id
	left JOIN keppel.plant_location pl ON lc.plant_loc_id = pl.loc_id
        WHERE license_id = ${license_id}
  `);
  client.end();
  return result.rows;
};

const handleExpireLicense = async (id) => {
  const client = connectDB();
  const res = await client.query(
    `
    UPDATE keppel.license lc 
    SET status_id = 4
    Where lc.license_id = $1
    `,
    [id]
  );
  console.log(res);
  client.end();
};

const autoSendExpireEmail = (license) => {
  const mail = new ExpireLicenseMail(license);
  mail.send();
};

const autoSendReminderEmail = (license) => {
  const mail = new ReminderLicenseMail(license);
  mail.send();
};

const main = async () => {
  try {
    const expiry = await checkExpiredLicense();
    for (let lc of expiry) {
      //   console.log(lc);
      await handleExpireLicense(lc.license_id);
      const curr_license = await fetchLicenseTemplate(lc.license_id);
      //   console.log(curr_license[0]);

      autoSendExpireEmail(curr_license[0]);
    }
    const remind = await fetchOngoingLicense();
    // console.log(remind);
    for (let lc of remind) {
      //   console.log(lc);
      if (lc.age.days == 90 || lc.age.days == 30 || lc.age.days == 60) {
        autoSendReminderEmail(lc);
      }
    }
  } catch (error) {
    console.log(error);
  }
};

module.exports = cron.schedule("0 8 * * *", () => {
  main();
});
