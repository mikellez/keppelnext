const db = require("../../db");
const moment = require("moment");

const getAssetsFromPlant = async (req, res, next) => {
  const { plant_id } = req.params;

  if (plant_id === undefined)
    res.status(400).json({ msg: "plant id not provided" });

  db.query(
    `SELECT psa_id, concat( system_asset , ' | ' , plant_asset_instrument) as "asset_name"  
            FROM keppel.system_assets AS t1 ,keppel.plant_system_assets AS t2
            WHERE t1.system_asset_id = t2.system_asset_id_lvl4 AND plant_id = $1`,
    [plant_id],
    (err, result) => {
      if (err) return res.status(500).json({ msg: err });

      res.status(200).json(result.rows);
    }
  );
};

// Get all assets for AG Grid
const getAssetHierarchy = async (req, res, next) => {
  db.query(
    `
    SELECT 
    pm.plant_name,
    sm.system_name,
    sa.system_asset,

    psa.parent_asset,
    psa.asset_type,
    psa.system_asset_lvl5,
    psa.system_asset_lvl6,
    psa.system_asset_lvl7,
    psa.plant_asset_instrument,
    psa.asset_description,
    psa.asset_location,
    psa.brand,
    psa.model_number,
    psa.technical_specs,
    psa.manufacture_country,
    psa.warranty,
    psa.remarks,
    psa.psa_id

    from
    keppel.plant_master as pm,
    keppel.system_master as sm,
    keppel.system_assets as sa,
    keppel.plant_system_assets as psa

    where
    pm.plant_id = psa.plant_id and
    
    sa.system_asset_id = psa.system_asset_id_lvl4 and 
    sm.system_id = sa.system_id
    
    group by
    pm.plant_name,
    sm.system_name,
    sa.system_asset,
    psa.system_asset_lvl5,
    psa.system_asset_lvl6,
    psa.system_asset_lvl7,
    psa.parent_asset,
    psa.asset_type,
    psa.plant_asset_instrument,
    psa.asset_description,
    psa.asset_location,
    psa.brand,
    psa.model_number,
    psa.technical_specs,
    psa.manufacture_country,
    psa.warranty,
    psa.remarks,
    psa.psa_id`,
    (err, result) => {
      if (err) {
        return res.status(400).send({
          msg: "err",
        });
      }
      if (result.rows.length == 0) {
        return res.status(400).send({
          msg: "No assets added",
        });
      }
      return res.status(200).send(result.rows);
    }
  );
};

const getAssetDetails = async (req, res, next) => {
  db.query(
    `SELECT pm.plant_name, 
    sm.system_name, 
    sa.system_asset, 
    psa.parent_asset, 
    psa.plant_asset_instrument as asset_name,
    psa.asset_type,
    psa.asset_description,
    psa.asset_location,
    psa.brand,
    psa.model_number,
    psa.technical_specs,
    psa.manufacture_country,
    psa.warranty,
    psa.remarks,
    psa.uploaded_image,
    psa.uploaded_files,
    pm.plant_id,
    sm.system_id,
    sa.system_asset_id,
    psa.psa_id,
    psa.system_asset_lvl5,
    psa.system_asset_lvl6,
    psa.system_asset_lvl7
    FROM keppel.plant_system_assets psa
    INNER JOIN keppel.plant_master pm ON pm.plant_id = psa.plant_id
    INNER JOIN keppel.system_master sm ON sm.system_id = psa.system_id_lvl3
    INNER JOIN keppel.system_assets sa ON sa.system_asset_id = psa.system_asset_id_lvl4
    WHERE psa_id = $1::integer`,
    [req.params.psa_id],
    (err, result) => {
      if (err) throw err;
      else res.status(200).json(result.rows);
    }
  );
};

// Get the history of an asset instrument for either request or checklist
const getAssetHistory = async (req, res, next) => {
  if (req.params.type === "request") {
    const queryS = `SELECT rt.request_id, pt.priority, ft.fault_type, requesthistory 
        FROM keppel.request AS rt
        LEFT JOIN keppel.priority AS pt ON pt.p_id = rt.priority_id
        LEFT JOIN keppel.fault_types AS ft ON ft.fault_id = rt.fault_id
        WHERE psa_id = $1 AND requesthistory IS NOT NULL`;
    db.query(queryS, [req.params.id], (err, found) => {
      if (err) throw err;
      if (found.rows.length === 0) {
        return res.status(200).json("no history");
      } else {
        const historyArr = [];
        found.rows.forEach((row) => {
          const tmp = row.requesthistory.split("!");
          tmp.forEach((tmpItem) => {
            tmpItem +=
              "_" + row.request_id + "_" + row.priority + "_" + row.fault_type;
            historyArr.push(tmpItem);
          });
        });
        return res.status(200).json(
          historyArr.map((row) => {
            const tmp = row.split("_");
            return {
              status: tmp[0],
              action: tmp[1],
              date: tmp[2].slice(0, -3),
              role: tmp[3],
              name: tmp[4],
              caseId: tmp[5],
              priority: tmp[6],
              faultType: tmp[7],
            };
          })
        );
      }
    });
  } else if (req.params.type === "checklist") {
    const queryS = `SELECT cm.checklist_id, cm.chl_name, cm.history 
        FROM keppel.checklist_master AS cm
        LEFT JOIN keppel.status_cm AS s ON cm.status_id = s.status_id
        WHERE linkedassetids LIKE concat(concat('%', $1::text), '%') AND history IS NOT NULL`;

    db.query(queryS, [req.params.id], (err, found) => {
      if (err) throw err;
      if (found.rows.length === 0) return res.status(200).json("no history");
      else {
        const historyArr = [];
        found.rows.forEach((row) => {
          const tmp = row.history.split(",");
          tmp.forEach((item) => {
            item += "_" + row.checklist_id + "_" + row.chl_name;
            historyArr.push(item);
          });
        });
        return res.status(200).json(
          historyArr.map((row) => {
            const tmp = row.split("_");
            return {
              action: tmp[0],
              status: tmp[1],
              date: tmp[2].slice(0, -3),
              name: tmp[3],
              checklistId: tmp[5],
              checklistName: tmp[6],
            };
          })
        );
      }
    });
  }
};

const fetchSystems = async (req, res, next) => {
  db.query(
    `SELECT system_id, system_name FROM keppel.system_master`,
    (err, result) => {
      if (err) res.status(500);
      else res.status(200).json(result.rows);
    }
  );
};

const fetchSystemAssets = async (req, res, next) => {
  let q = `SELECT system_asset, system_asset_id from keppel.system_assets
        where keppel.system_assets.system_id = ${req.params.system_id};`;
  db.query(q, (err1, result) => {
    if (err1) {
      // throw err;
      console.log(err1);
      return res.status(400).send({
        msg: err1,
      });
    }

    return res.status(200).send(result.rows);
  });
};

const fetchSystemAssetNames = async (req, res, next) => {
  let q = `SELECT DIStiNCT system_asset_lvl6 FROM keppel.plant_system_assets
        WHERE 
        plant_id = ${req.params.plant_id} AND
        system_id_lvl3 = ${req.params.system_id} AND
        system_asset_id_lvl4= ${req.params.system_asset_id};`;
  db.query(q, (err1, result) => {
    if (err1) {
      // throw err;
      console.log(err1);
      return res.status(400).send({
        msg: err1,
      });
    }

    return res.status(200).send(result.rows);
  });
};

const fetchSubComponent1Names = async (req, res, next) => {
  let q = `SELECT DIStiNCT system_asset_lvl7 FROM keppel.plant_system_assets
        WHERE 
        plant_id = ${req.params.plant_id} AND
        system_id_lvl3 = ${req.params.system_id} AND
        system_asset_id_lvl4= ${req.params.system_asset_id} AND
        system_asset_lvl6 = '${req.params.system_asset_name_id}' AND
        system_asset_lvl7 != '';`;
  db.query(q, (err1, result) => {
    if (err1) {
      // throw err;
      console.log(err1);
      return res.status(400).send({
        msg: err1,
      });
    }

    return res.status(200).send(result.rows);
  });
};

const fetch_asset_types = async (req, res, next) => {
  let q = `SELECT * FROM keppel.asset_type
    ORDER BY asset_type.asset_type ASC `;
  db.query(q, (err1, result) => {
    if (err1) {
      // throw err;
      console.log(err1);
      return res.status(400).send({
        msg: err1,
      });
    }

    return res.status(200).send(result.rows);
  });
};

const editAsset = async (req, res, next) => {
  console.log(req.body);
  var parent_asset;

  if (req.body.asset_type == "") {
    parent_asset = req.body.system_asset;
  }

  if (
    req.body.system_asset != req.body.asset_type &&
    req.body.asset_type != ""
  ) {
    parent_asset = req.body.system_asset_name;
  }

  if (req.body.system_asset_name == "NA") {
    parent_asset = "req.body.asset_type";
  }

  var asset_type = req.body.asset_type;
  var system_asset_lvl5 = req.body.system_lvl_5;
  var system_asset_lvl6 = req.body.system_lvl_6;
  // var system_asset_lvl7 = req.body.system_lvl_7;
  var asset_description = req.body.description;
  var asset_location = req.body.location;
  var brand = req.body.brand;
  var plant_asset_instrument = req.body.system_asset_name;
  var model_number = req.body.model_number;
  var technical_specs = req.body.tech_specs;
  var manufacture_country = req.body.manufacture_country;
  var warranty = req.body.warranty;
  var remarks = req.body.remarks;
  var psa_id = req.body.psa_id;
  var uploaded_image = req.body.image;
  var uploaded_files = req.body.files;
  console.log("req.body is here");
  console.log(req.body);
  var system_id_lvl3 = req.body.system_id;
  var system_asset_id_lvl4 = req.body.system_asset_id;
  var parent_asset;
  var plant_asset_instrument;
  var system_asset_name = req.body.system_asset;
  var system_asset_name_2 = req.body.system_asset_name;

  var asset_type = req.body.asset_type;

  if (req.body.asset_type == "NA") {
    asset_type = req.body.system_asset;
    parent_asset = asset_type;
  }
  //user selects system asset -> selects an existing tag -> selects asset type to tag a lvl5 item
  //then lv4 item = parent asset
  if (
    req.body.system_asset != req.body.asset_type &&
    req.body.asset_type != "NA"
  ) {
    parent_asset = req.body.system_asset_name;
  }
  //Case 1: user selects system asset but does not select asset type - lvl4
  // parent asset same as system asset
  else {
    parent_asset = req.body.system_asset;
  }
  console.log(
    "Asset Type" +
      asset_type +
      "System Asset" +
      req.body.system_asset_name +
      "Parent Asset" +
      parent_asset
  );
  var system_asset_lvl5 = req.body.system_lvl_5;
  var level5 = req.body.system_lvl_5;
  var system_asset_lvl6 = req.body.system_lvl_6;
  var system_asset_lvl6_2 = req.body.system_lvl_6;

  // var system_asset_lvl7 = req.body.system_lvl_7;
  var asset_description = req.body.description;
  var asset_location = req.body.location;
  var brand = req.body.brand;

  var model_number = req.body.model_number;
  var technical_specs = req.body.tech_specs;
  var manufacture_country = req.body.manufacture_country;
  var warranty = req.body.warranty;
  var remarks = req.body.remarks;
  var plant_id = req.body.plant_id;
  var uploaded_image = req.body.image;
  var uploaded_files = req.body.files;

  var plant_asset_instrument = "";
  plant_asset_instrument = req.body.system_asset_name;
  console.log(req.body);

  var sql = `UPDATE keppel.plant_system_assets SET parent_asset='${parent_asset}',asset_type='${asset_type}',asset_description='${asset_description}',asset_location='${asset_location}',brand='${brand}',plant_asset_instrument='${plant_asset_instrument}',model_number='${model_number}',technical_specs='${technical_specs}',manufacture_country='${manufacture_country}',warranty='${warranty}',remarks='${remarks}',system_asset_lvl6='${system_asset_lvl6}',system_asset_lvl5='${system_asset_lvl5}',system_asset_lvl7='', uploaded_image = '${uploaded_image}', uploaded_files = '${uploaded_files}'  WHERE psa_id = '${psa_id}'`;
  // if only chosen up to Select System Asset and create a new asset name with an asset type
  if (
    req.body.system_lvl_6 == "" &&
    typeof req.body.system_lvl_5 === "undefined" &&
    asset_type != req.body.system_asset
  ) {
    sql = `UPDATE keppel.plant_system_assets
       SET 
           asset_description = '${asset_description}',
           asset_location = '${asset_location}',
           brand = '${brand}',
           model_number = '${model_number}',
           technical_specs = '${technical_specs}',
           manufacture_country = '${manufacture_country}',
           warranty = '${warranty}',
           remarks = '${remarks}',
           uploaded_image = '${uploaded_image}',
           uploaded_files = '${uploaded_files}'
       WHERE psa_id = '${psa_id}'`;
  }
  // if only chosen up to Select System Asset and create a new asset name and no asset type DONE
  else if (
    req.body.system_lvl_6 == "" &&
    typeof req.body.system_lvl_5 === "undefined"
  ) {
    sql = `UPDATE keppel.plant_system_assets
        SET 
            asset_description = '${asset_description}',
            asset_location = '${asset_location}',
            brand = '${brand}',
            model_number = '${model_number}',
            technical_specs = '${technical_specs}',
            manufacture_country = '${manufacture_country}',
            warranty = '${warranty}',
            remarks = '${remarks}',
            uploaded_image = '${uploaded_image}',
            uploaded_files = '${uploaded_files}'
        WHERE psa_id = '${psa_id}'`;
  }
  // if only chosen up to System Asset Name and create a new Sub-Components 1 with an asset type
  else if (req.body.system_lvl_6 == "" && req.body.asset_type != "NA") {
    sql = `UPDATE keppel.plant_system_assets
        SET 
            asset_description = '${asset_description}',
            asset_location = '${asset_location}',
            brand = '${brand}',
            model_number = '${model_number}',
            technical_specs = '${technical_specs}',
            manufacture_country = '${manufacture_country}',
            warranty = '${warranty}',
            remarks = '${remarks}',
            uploaded_image = '${uploaded_image}',
            uploaded_files = '${uploaded_files}'
        WHERE psa_id = '${psa_id}'`;
  }
  // if only chosen up to System Asset Name and create a new Sub-Components 1 without asset type
  else if (req.body.system_lvl_6 == "" && req.body.asset_type == "NA") {
    var system_asset_name_2 = req.body.system_asset_name;
    sql = `UPDATE keppel.plant_system_assets
        SET 
            asset_description = '${asset_description}',
            asset_location = '${asset_location}',
            brand = '${brand}',
            model_number = '${model_number}',
            technical_specs = '${technical_specs}',
            manufacture_country = '${manufacture_country}',
            warranty = '${warranty}',
            remarks = '${remarks}',
            uploaded_image = '${uploaded_image}',
            uploaded_files = '${uploaded_files}'
        WHERE psa_id = '${psa_id}'`;
  }
  // if all options are selected with an asset type
  else if (req.body.system_lvl_6 != "" && req.body.asset_type != "NA") {
    var system_lvl_7 = req.body.system_lvl_5;
    var asset_type = req.body.asset_type;
    sql = `UPDATE keppel.plant_system_assets
        SET 
            asset_description = '${asset_description}',
            asset_location = '${asset_location}',
            brand = '${brand}',
            model_number = '${model_number}',
            technical_specs = '${technical_specs}',
            manufacture_country = '${manufacture_country}',
            warranty = '${warranty}',
            remarks = '${remarks}',
            uploaded_image = '${uploaded_image}',
            uploaded_files = '${uploaded_files}'
        WHERE psa_id = '${psa_id}'`;
  } else if (req.body.system_lvl_6 != "" && req.body.asset_type == "NA") {
    var system_lvl_7 = req.body.system_lvl_5;
    sql = `UPDATE keppel.plant_system_assets
        SET 
            asset_description = '${asset_description}',
            asset_location = '${asset_location}',
            brand = '${brand}',
            model_number = '${model_number}',
            technical_specs = '${technical_specs}',
            manufacture_country = '${manufacture_country}',
            warranty = '${warranty}',
            remarks = '${remarks}',
            uploaded_image = '${uploaded_image}',
            uploaded_files = '${uploaded_files}'
        WHERE psa_id = '${psa_id}'`;
  }

  //   console.log(sql);
  const assetQuery = `
  SELECT asset_description,
  asset_location,
  brand,
  model_number,
  technical_specs,
  manufacture_country,
  warranty,
  remarks,
  uploaded_image,
  uploaded_files
  FROM keppel.plant_system_assets
  WHERE psa_id = '${psa_id}'
  `;

  const old = await db.query(assetQuery);

  await db.query(sql);
  const updated = await db.query(assetQuery);

  const fields = compare(old.rows[0], updated.rows[0]).join(", ");

  await db.query(
    `INSERT INTO keppel.history (action, user_id, fields, date, asset_id) VALUES ('EDITED', '${
      req.body.user_id
    }', '${fields}', '${moment(new Date()).format(
      "YYYY-MM-DD HH:mm:ss"
    )}', '${psa_id}')`
  );

  res.status(200).send({
    SuccessCode: "200",
  });
};

const compare = (old, updated) => {
  const fields = [];
  for (const key in old) {
    if (Array.isArray(old[key])) {
      if (JSON.stringify(old[key]) !== JSON.stringify(updated[key])) {
        fields.push(key);
      }
    } else if (old[key] !== updated[key]) {
      fields.push(key);
    }
  }

  console.log(fields);
  return fields;
};

const addNewAsset = (req, res, next) => {
  console.log("req.body is here");
  console.log(req.body);
  var system_id_lvl3 = req.body.system_id;
  var system_asset_id_lvl4 = req.body.system_asset_id;
  var parent_asset;
  var plant_asset_instrument;
  var system_asset_name = req.body.system_asset;
  var system_asset_name_2 = req.body.system_asset_name;

  var asset_type = req.body.asset_type;

  if (req.body.asset_type == "NA") {
    asset_type = req.body.system_asset;
    parent_asset = asset_type;
  }
  //user selects system asset -> selects an existing tag -> selects asset type to tag a lvl5 item
  //then lv4 item = parent asset
  if (
    req.body.system_asset != req.body.asset_type &&
    req.body.asset_type != "NA"
  ) {
    parent_asset = req.body.system_asset_name;
  }
  //Case 1: user selects system asset but does not select asset type - lvl4
  // parent asset same as system asset
  else {
    parent_asset = req.body.system_asset;
  }
  console.log(
    "Asset Type" +
      asset_type +
      "System Asset" +
      req.body.system_asset_name +
      "Parent Asset" +
      parent_asset
  );
  var system_asset_lvl5 = req.body.system_lvl_5;
  var level5 = req.body.system_lvl_5;
  var system_asset_lvl6 = req.body.system_lvl_6;
  var system_asset_lvl6_2 = req.body.system_lvl_6;

  // var system_asset_lvl7 = req.body.system_lvl_7;
  var asset_description = req.body.description;
  var asset_location = req.body.location;
  var brand = req.body.brand;

  var model_number = req.body.model_number;
  var technical_specs = req.body.tech_specs;
  var manufacture_country = req.body.manufacture_country;
  var warranty = req.body.warranty;
  var remarks = req.body.remarks;
  var plant_id = req.body.plant_id;
  var uploaded_image = req.body.image;
  var uploaded_files = req.body.files;

  var plant_asset_instrument = "";
  plant_asset_instrument = req.body.system_asset_name;

  /*** determine parent asset; plant asset instrument and subsequent level if any, to be set as asset type ****/
  var elementList = [
    system_id_lvl3,
    req.body.system_asset,
    req.body.system_asset_name,
    system_asset_lvl5,
    system_asset_lvl6,
  ];
  var parent_ = "";
  var tag = "";
  var lvl = 0;
  for (let idx = 0; idx < elementList.length; idx++) {
    currentval = elementList[idx];
    if (idx == 0) {
      parent_ = currentval;
      tag = currentval;
    }
    if (idx > 0) {
      prevval = elementList[idx - 1];

      if (!(currentval == "")) {
        tag = currentval;
        if (!(prevval == "")) {
          parent_ = prevval;
        }
      }
    } //end if idx>0
  } //end for
  parent_asset = req.body.system_asset_name;
  plant_asset_instrument = tag;
  console.log(parent_asset, tag);

  if (tag == system_asset_lvl5) {
    system_asset_lvl5 = asset_type;
  } else if (tag == system_asset_lvl6) {
    /* level6 is the asset type selected by user
        level5 = asset type of level5
        asset type switches to level 5 asset type*/

    system_asset_lvl6 = req.body.asset_type;
    if (req.body.asset_type == "NA") {
      system_asset_lvl6 = "";
    }
    asset_type = system_asset_lvl5.split(" | ")[0];
    //level 5=  level5 asset type
    system_asset_lvl5 = system_asset_lvl5.split(" | ")[0];
  }

  var sql = `INSERT INTO keppel.plant_system_assets (system_id_lvl3, system_asset_id_lvl4, parent_asset, asset_type,asset_description,asset_location,brand,plant_asset_instrument,model_number,technical_specs,manufacture_country,warranty,remarks,system_asset_lvl5,system_asset_lvl6,system_asset_lvl7, uploaded_image, uploaded_files, plant_id)
        VALUES ('${system_id_lvl3}', '${system_asset_id_lvl4}', '${parent_asset}', '${asset_type}','${asset_description}','${asset_location}','${brand}','${plant_asset_instrument}','${model_number}','${technical_specs}','${manufacture_country}','${warranty}','${remarks}','${system_asset_lvl5}','${system_asset_lvl6}','', '${uploaded_image}','${uploaded_files}','${plant_id}')`;
  console.log(sql);
  // if only chosen up to Select System Asset and create a new asset name with an asset type
  if (
    req.body.system_lvl_6 == "" &&
    typeof req.body.system_lvl_5 === "undefined" &&
    asset_type != req.body.system_asset
  ) {
    sql = `INSERT INTO keppel.plant_system_assets (system_id_lvl3, system_asset_id_lvl4, parent_asset, asset_type,asset_description,asset_location,brand,plant_asset_instrument,model_number,technical_specs,manufacture_country,warranty,remarks,system_asset_lvl5,system_asset_lvl6,system_asset_lvl7, uploaded_image, uploaded_files, plant_id)
        VALUES ('${system_id_lvl3}', '${system_asset_id_lvl4}', '${system_asset_name}', '${asset_type}','${asset_description}','${asset_location}','${brand}','${system_asset_name_2}','${model_number}','${technical_specs}','${manufacture_country}','${warranty}','${remarks}','${system_asset_name}','','', '${uploaded_image}','${uploaded_files}','${plant_id}')`;
  }
  // if only chosen up to Select System Asset and create a new asset name and no asset type DONE
  else if (
    req.body.system_lvl_6 == "" &&
    typeof req.body.system_lvl_5 === "undefined"
  ) {
    sql = `INSERT INTO keppel.plant_system_assets (system_id_lvl3, system_asset_id_lvl4, parent_asset, asset_type,asset_description,asset_location,brand,plant_asset_instrument,model_number,technical_specs,manufacture_country,warranty,remarks,system_asset_lvl5,system_asset_lvl6,system_asset_lvl7, uploaded_image, uploaded_files, plant_id)
        VALUES ('${system_id_lvl3}', '${system_asset_id_lvl4}', '${system_asset_name_2}', '${system_asset_name_2}','${asset_description}','${asset_location}','${brand}','${system_asset_name_2}','${model_number}','${technical_specs}','${manufacture_country}','${warranty}','${remarks}','${system_asset_name}','${system_asset_name_2}','', '${uploaded_image}','${uploaded_files}','${plant_id}')`;
  }

  // if only chosen up to System Asset Name and create a new Sub-Components 1 with an asset type
  else if (req.body.system_lvl_6 == "" && req.body.asset_type != "NA") {
    sql = `INSERT INTO keppel.plant_system_assets (system_id_lvl3, system_asset_id_lvl4, parent_asset, asset_type,asset_description,asset_location,brand,plant_asset_instrument,model_number,technical_specs,manufacture_country,warranty,remarks,system_asset_lvl5,system_asset_lvl6,system_asset_lvl7, uploaded_image, uploaded_files, plant_id)
        VALUES ('${system_id_lvl3}', '${system_asset_id_lvl4}', '${system_asset_name_2}', '${asset_type}','${asset_description}','${asset_location}','${brand}','${plant_asset_instrument}','${model_number}','${technical_specs}','${manufacture_country}','${warranty}','${remarks}','${system_asset_name}','${system_asset_name_2}','', '${uploaded_image}','${uploaded_files}','${plant_id}')`;
  }
  // if only chosen up to System Asset Name and create a new Sub-Components 1 without asset type
  else if (req.body.system_lvl_6 == "" && req.body.asset_type == "NA") {
    var system_asset_name_2 = req.body.system_asset_name;
    sql = `INSERT INTO keppel.plant_system_assets (system_id_lvl3, system_asset_id_lvl4, parent_asset, asset_type,asset_description,asset_location,brand,plant_asset_instrument,model_number,technical_specs,manufacture_country,warranty,remarks,system_asset_lvl5,system_asset_lvl6,system_asset_lvl7, uploaded_image, uploaded_files, plant_id)
            VALUES ('${system_id_lvl3}', '${system_asset_id_lvl4}', '${system_asset_name_2}', '${system_asset_name_2}','${asset_description}','${asset_location}','${brand}','${plant_asset_instrument}','${model_number}','${technical_specs}','${manufacture_country}','${warranty}','${remarks}','${system_asset_lvl5}','${system_asset_name_2}','', '${uploaded_image}','${uploaded_files}','${plant_id}')`;
  }
  // if all options are selected with an asset type
  else if (req.body.system_lvl_6 != "" && req.body.asset_type != "NA") {
    var system_lvl_7 = req.body.system_lvl_5;
    var asset_type = req.body.asset_type;
    sql = `INSERT INTO keppel.plant_system_assets (system_id_lvl3, system_asset_id_lvl4, parent_asset, asset_type,asset_description,asset_location,brand,plant_asset_instrument,model_number,technical_specs,manufacture_country,warranty,remarks,system_asset_lvl5,system_asset_lvl6,system_asset_lvl7, uploaded_image, uploaded_files, plant_id)
        VALUES ('${system_id_lvl3}', '${system_asset_id_lvl4}', '${system_asset_lvl5}', '${asset_type}','${asset_description}','${asset_location}','${brand}','${plant_asset_instrument}','${model_number}','${technical_specs}','${manufacture_country}','${warranty}','${remarks}','${system_asset_name}','${system_asset_name_2}','${system_lvl_7}', '${uploaded_image}','${uploaded_files}','${plant_id}')`;
  } else if (req.body.system_lvl_6 != "" && req.body.asset_type == "NA") {
    var system_lvl_7 = req.body.system_lvl_5;
    sql = `INSERT INTO keppel.plant_system_assets (system_id_lvl3, system_asset_id_lvl4, parent_asset, asset_type,asset_description,asset_location,brand,plant_asset_instrument,model_number,technical_specs,manufacture_country,warranty,remarks,system_asset_lvl5,system_asset_lvl6,system_asset_lvl7, uploaded_image, uploaded_files, plant_id)
        VALUES ('${system_id_lvl3}', '${system_asset_id_lvl4}', '${system_asset_lvl5}', '${system_asset_lvl5}','${asset_description}','${asset_location}','${brand}','${plant_asset_instrument}','${model_number}','${technical_specs}','${manufacture_country}','${warranty}','${remarks}','${system_asset_name}','${system_asset_name_2}','${system_lvl_7}', '${uploaded_image}','${uploaded_files}','${plant_id}')`;
  }

  sql += "RETURNING psa_id";

  let psa_id;
  db.query(sql)
    .then((result) => {
      psa_id = result.rows[0].psa_id;
      const query = `INSERT INTO keppel.history (action, user_id, fields, date, asset_id) VALUES ('CREATED', '${
        req.body.user_id
      }', '-', '${moment(new Date()).format(
        "YYYY-MM-DD HH:mm:ss"
      )}', '${parseInt(psa_id)}')`;
      return db.query(query);
    })
    .then((rows) => {
      return res.status(200).send({
        SuccessCode: "200",
      });
    })
    .catch((err) => console.log(err));

  //   db.query(sql, function (err, result) {
  //     if (err) {
  //       console.log(err);
  //     }
  //     return res.status(200).send({
  //       SuccessCode: "200",
  //     });
  //   });
};

const deleteAsset = (req, res, next) => {
  var psa_id = req.body.psa_id;
  var q = `DELETE from keppel.plant_system_assets where psa_id = '${psa_id}'`;
  console.log(q);
  db.query(q, function (err, result) {
    if (err) {
      console.log(err);
    }

    return res.status(200).send({
      SuccessCode: "200",
    });
  });
};

const fetchAssetHistory = (req, res, next) => {
  db.query(
    `SELECT h.history_id, h.action, h.user_id, h.fields, h.date, CONCAT(u.first_name, ' ', u.last_name) as name FROM keppel.history h
        JOIN keppel.users u
        ON u.user_id = h.user_id
      WHERE asset_id = ${req.params.psa_Id}`,
    (err, result) => {
      if (err) {
        return res.status(400).send({
          msg: err,
        });
      }
      console.log(result.rows);
      return res.status(200).send(result.rows);
    }
  );
};

module.exports = {
  getAssetsFromPlant,
  getAssetHierarchy,
  getAssetDetails,
  getAssetHistory,
  fetchSystems,
  fetchSystemAssets,
  fetch_asset_types,
  fetchAssetHistory,
  fetchSystemAssetNames,
  fetchSubComponent1Names,
  addNewAsset,
  editAsset,
  deleteAsset,
};
