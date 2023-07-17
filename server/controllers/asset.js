const db = require("../../db");
const moment = require("moment");
const ITEMS_PER_PAGE = 10;

const getUploadedFile = async (req, res, next) => {
  const psa_id = +req.params.psa_id;
  const index = +req.params.index;

  const result = await global.db.query(
    `SELECT psa.uploaded_files from keppel.plant_system_assets as psa WHERE psa.psa_id = ${psa_id}`
  );
  const uploaded_file = result.rows[0].uploaded_files[index][1];
  const [mimetype, base64Img] = uploaded_file.split(";");

  const img = Buffer.from(base64Img.split(",")[1], "base64");

  return res
    .writeHead(200, {
      "Content-Type": mimetype.split(":")[1],
      "Content-Length": img.length,
    })
    .end(img);

  // res.send(img);
};

const getSystemsFromPlant = async (req, res, next) => {
  const plant_id = +req.params.plant_id;

  if (plant_id === undefined)
    res.status(400).json({ msg: "plant id not provided" });

  global.db.query(
    `SELECT DISTINCT(sm.system_name), sm.system_id FROM keppel.plant_system_assets as psa
    JOIN keppel.system_master as sm
    ON psa.system_id_lvl3 = sm.system_id
    WHERE psa.plant_id = $1`,
    [plant_id],
    (err, result) => {
      if (err) return res.status(500).json({ msg: err });

      // console.log;
      res.status(200).json(result.rows);
    }
  );
};

const getSystemAssetsFromPlant = async (req, res, next) => {
  const plant_id = +req.params.plant_id;
  const system_id = +req.params.system_id;

  let q = `SELECT DISTINCT(psa.system_asset_lvl5) FROM keppel.plant_system_assets as psa
          JOIN keppel.system_master as sm
          ON psa.system_id_lvl3 = sm.system_id
          JOIN keppel.system_assets as sa
          ON psa.system_asset_id_lvl4 = sa.system_asset_id
          WHERE psa.plant_id = ${plant_id}
          AND psa.system_id_lvl3 = ${system_id}`;
  global.db.query(q, (err1, result) => {
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

const getSystemAssetNamesFromPlant = async (req, res, next) => {
  const plant_id = +req.params.plant_id;
  const system_id = +req.params.system_id;
  const system_asset = req.params.system_asset_id.replaceAll("_", " ");

  let q = `SELECT DISTINCT(psa.system_asset_lvl6) FROM keppel.plant_system_assets as psa
          JOIN keppel.system_master as sm
          ON psa.system_id_lvl3 = sm.system_id
          JOIN keppel.system_assets as sa
          ON psa.system_asset_id_lvl4 = sa.system_asset_id
          WHERE psa.plant_id = ${plant_id}
          AND psa.system_id_lvl3 = ${system_id}
          AND psa.system_asset_lvl5 = '${system_asset}'`;

  try {
    const result = await global.db.query(q);

    if (result.rows[0].system_asset_lvl6 === "") {
      const d = await checkAssetType(plant_id, system_id, system_asset);
      return res.status(200).send(d);
    }

    return res.status(200).send(result.rows);
  } catch (error) {
    console.log(error);
  }
};

const getSubComponentsFromPlant = async (req, res, next) => {
  const plant_id = +req.params.plant_id;
  const system_id = +req.params.system_id;
  const system_asset = req.params.system_asset_id.replaceAll("_", " ");
  const system_asset_name = req.params.system_asset_name
    .replaceAll("_", " ")
    .replaceAll(",", "/");

  let q = `SELECT DISTINCT(psa.system_asset_lvl7) FROM keppel.plant_system_assets as psa
          JOIN keppel.system_master as sm
          ON psa.system_id_lvl3 = sm.system_id
          JOIN keppel.system_assets as sa
          ON psa.system_asset_id_lvl4 = sa.system_asset_id
          WHERE psa.plant_id = ${plant_id}
          AND psa.system_id_lvl3 = ${system_id}
          AND psa.system_asset_lvl5 = '${system_asset}'
          AND psa.system_asset_lvl6 = '${system_asset_name}'`;

  try {
    const result = await global.db.query(q);
    let lvl7 = [];
    if (result.rows.length > 1) {
      lvl7 = result.rows.map((row) => `'${row.system_asset_lvl7}'`);
    } else {
      lvl7 = [`'${result.rows[0].system_asset_lvl7}'`];
    }

    if (lvl7[0] === "") {
      const d = await checkAssetType(
        plant_id,
        system_id,
        system_asset,
        system_asset_name
      );
      return res.status(200).send(d);
    } else {
      const d = await checkAssetType(
        plant_id,
        system_id,
        system_asset,
        system_asset_name,
        lvl7
      );

      d["subComponents"] = result.rows;
      return res.status(200).send(d);
    }
  } catch (error) {
    console.log(error);
  }
};

const checkAssetType = async (...args) => {
  // console.log(args);
  let q = `SELECT psa.parent_asset, psa.asset_type, psa.plant_asset_instrument, psa.psa_id FROM keppel.plant_system_assets as psa
          WHERE psa.plant_id = ${args[0]}
          AND psa.system_id_lvl3 = ${args[1]}
          AND psa.system_asset_lvl5 = '${args[2]}'`;
  if (args[3]) {
    q += `AND psa.system_asset_lvl6 = '${args[3]}'`;
  }
  if (args[4]) {
    q += `AND psa.system_asset_lvl7 = ANY(ARRAY[${args[4]}]::varchar[])`;
  }

  try {
    const result = await global.db.query(q);
    d = {};
    arr = [];
    for (const row of result.rows) {
      if (row.parent_asset !== row.asset_type) {
        if (!(row.asset_type in d)) {
          d[row.asset_type] = [
            { psa_id: row.psa_id, pai: row.plant_asset_instrument },
          ];
        } else {
          d[row.asset_type].push({
            psa_id: row.psa_id,
            pai: row.plant_asset_instrument,
          });
        }
      } else {
        arr.push({
          psa_id: row.psa_id,
          pai: row.plant_asset_instrument,
          prev_level: row.asset_type,
        });
      }
    }

    return { dict: d, pai: arr };
  } catch (error) {
    console.log(error);
  }
};

const getAssetsFromPlant = async (req, res, next) => {
  const { plant_id } = req.params;

  if (plant_id === undefined)
    res.status(400).json({ msg: "plant id not provided" });

  global.db.query(
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

const getAllAssets = async (req, res, next) => {
  global.db.query(
    `SELECT plant_id, psa_id, concat( system_asset , ' | ' , plant_asset_instrument) as "asset_name"  
            FROM keppel.system_assets AS t1 ,keppel.plant_system_assets AS t2
            WHERE t1.system_asset_id = t2.system_asset_id_lvl4`,
    (err, result) => {
      if (err) return res.status(500).json({ msg: err });

      res.status(200).json(result.rows);
    }
  );
};

// Get all assets for AG Grid
const getAssetHierarchy = async (req, res, next) => {
  global.db.query(
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
  global.db.query(
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
      else console.log(result.rows);
      res.status(200).json(result.rows);
    }
  );
};

// Get the history of an asset instrument for either request or checklist
const getAssetHistory = async (req, res, next) => {
  if (req.params.type === "request") {
    let queryS = `SELECT 
    btrim(concat(activity.value -> 'activity_type'::text), '"'::text) AS activity_type,
    btrim(((activity.value -> 'name'::text)::character varying)::text, '"'::text) AS name,
    to_timestamp(substr(((activity.value -> 'date'::text)::character varying)::text, 2, length(((activity.value -> 'date'::text)::character varying)::text) - 5), 'YYYY-MM-DD HH24:mi:ss'::text) AS date,
    btrim(concat(activity.value -> 'activity'::text), '"'::text) AS activity
    FROM keppel.request,
    LATERAL jsonb_array_elements(request.activity_log) activity(value)
    WHERE psa_id = $1`;
    try {

      const totalRows = await global.db.query(queryS, [req.params.id]);
      const totalPages = Math.ceil(+totalRows.rowCount / ITEMS_PER_PAGE);
      const page = req.query.page || 1;
      const offsetItems = (+page - 1) * ITEMS_PER_PAGE;
      queryS += ` LIMIT ${ITEMS_PER_PAGE} OFFSET ${offsetItems}`
      const results = await global.db.query(queryS, [req.params.id]);
      return res.status(200).json({ rows: results.rows, total: totalPages });
    } catch (err) {
      console.log(err);
      return res.status(500).json({ msg: err });
    }
  } else if (req.params.type === "checklist") {
      let queryS = `SELECT 
      btrim(concat(activity.value -> 'activity_type'::text), '"'::text) AS activity_type,
      btrim(((activity.value -> 'name'::text)::character varying)::text, '"'::text) AS name,
      to_timestamp(substr(((activity.value -> 'date'::text)::character varying)::text, 2, length(((activity.value -> 'date'::text)::character varying)::text) - 5), 'YYYY-MM-DD HH24:mi:ss'::text) AS date,
      btrim(concat(activity.value -> 'activity'::text), '"'::text) AS activity
      FROM keppel.checklist_master,
      LATERAL jsonb_array_elements(checklist_master.activity_log) activity(value)
      WHERE ',' || linkedassetids || ',' LIKE  concat(concat('%,', $1::text) , ',%')`;
      try {

        const totalRows = await global.db.query(queryS, [req.params.id]);
        const totalPages = Math.ceil(+totalRows.rowCount / ITEMS_PER_PAGE);
        const page = req.query.page || 1;
        const offsetItems = (+page - 1) * ITEMS_PER_PAGE;
        queryS += ` LIMIT ${ITEMS_PER_PAGE} OFFSET ${offsetItems}`
        const results = await global.db.query(queryS, [req.params.id]);
        return res.status(200).json({ rows: results.rows, total: totalPages });
      } catch (err) {
        console.log(err);
        return res.status(500).json({ msg: err });
      }
  }
};

const fetchSystems = async (req, res, next) => {
  global.db.query(
    `SELECT system_id, system_name FROM keppel.system_master`,
    (err, result) => {
      if (err) res.status(500).send(err);
      else res.status(200).json(result.rows);
    }
  );
};

const fetchSystemAssets = async (req, res, next) => {
  let q = `SELECT system_asset, system_asset_id from keppel.system_assets
        where keppel.system_assets.system_id = ${req.params.system_id};`;
  global.db.query(q, (err1, result) => {
    if (err1) {
      // throw err;
      // console.log(err1);
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
  global.db.query(q, (err1, result) => {
    if (err1) {
      // throw err;
      // console.log(err1);
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
  global.db.query(q, (err1, result) => {
    if (err1) {
      // throw err;
      // console.log(err1);
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
  global.db.query(q, (err1, result) => {
    if (err1) {
      // throw err;
      // console.log(err1);
      return res.status(400).send({
        msg: err1,
      });
    }

    return res.status(200).send(result.rows);
  });
};

const editAsset = async (req, res, next) => {
  // console.log(req.body);
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
  // console.log("req.body is here");
  // console.log(req.body);
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
  // console.log(
  //   "Asset Type" +
  //     asset_type +
  //     "System Asset" +
  //     req.body.system_asset_name +
  //     "Parent Asset" +
  //     parent_asset
  // );
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
  // console.log(req.body);

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

  const old = await global.db.query(assetQuery);

  await global.db.query(sql);
  const updated = await global.db.query(assetQuery);
  // console.log(compare(old.rows[0], updated.rows[0]));
  const fields = compare(old.rows[0], updated.rows[0]).join(", ");
  const today = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
  await global.db.query(
    `
    UPDATE keppel.plant_system_assets
    SET activity_log = activity_log || 
    jsonb_build_object(
      'date', '${today}',
      'name', '${req.user.name}',
      'role', '${req.user.role_name}',
      'activity', 'Edited Asset ${psa_id}: ${fields}',
      'activity_type', 'EDITED',
      'fields', '${fields}'
    )
    WHERE psa_id = '${psa_id}';
    `
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
        fields.push(key + " : " + old[key] + " => " + updated[key]);
      }
    } else if (old[key] !== updated[key]) {
      fields.push(key + " : " + old[key] + " => " + updated[key]);
    }
  }

  // console.log(fields);
  return fields;
};

const addNewAsset = (req, res, next) => {
  // console.log("req.body is here");
  // console.log(req.body);
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
  // console.log(
  //   "Asset Type" +
  //     asset_type +
  //     "System Asset" +
  //     req.body.system_asset_name +
  //     "Parent Asset" +
  //     parent_asset
  // );
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
  // console.log(parent_asset, tag);

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
  // console.log(sql);
  // if only chosen up to Select System Asset and create a new asset name with an asset type IGNORE
  if (
    req.body.system_lvl_6 == "" &&
    typeof req.body.system_lvl_5 === "undefined" &&
    asset_type != req.body.system_asset
  ) {
    console.log(1)
    sql = `INSERT INTO keppel.plant_system_assets (system_id_lvl3, system_asset_id_lvl4, parent_asset, asset_type,asset_description,asset_location,brand,plant_asset_instrument,model_number,technical_specs,manufacture_country,warranty,remarks,system_asset_lvl5,system_asset_lvl6,system_asset_lvl7, uploaded_image, uploaded_files, plant_id)
        VALUES ('${system_id_lvl3}', '${system_asset_id_lvl4}', '${system_asset_name}', '${asset_type}','${asset_description}','${asset_location}','${brand}','${system_asset_name_2}','${model_number}','${technical_specs}','${manufacture_country}','${warranty}','${remarks}','${system_asset_name}','','', '${uploaded_image}','${uploaded_files}','${plant_id}')`;
  }
  // if only chosen up to Select System Asset and create a new asset name and no asset type DONE IGNORE
  else if (
    req.body.system_lvl_6 == "" &&
    typeof req.body.system_lvl_5 === "undefined"
  ) {
    console.log(2)
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
    sql = `INSERT INTO keppel.plant_system_assets (
        system_id_lvl3, 
        system_asset_id_lvl4, 
        parent_asset, 
        asset_type,
        asset_description,
        asset_location,
        brand,
        plant_asset_instrument,
        model_number,
        technical_specs,
        manufacture_country,
        warranty,
        remarks,
        system_asset_lvl5,
        system_asset_lvl6,
        system_asset_lvl7,
        uploaded_image,
        uploaded_files,
        plant_id
      )
      VALUES (
        '${system_id_lvl3}',
        '${system_asset_id_lvl4}',
        '${system_asset_name_2}',
        '${system_asset_name_2}',
        '${asset_description}',
        '${asset_location}',
        '${brand}',
        '${plant_asset_instrument}',
        '${model_number}',
        '${technical_specs}',
        '${manufacture_country}',
        '${warranty}',
        '${remarks}',
        '${system_asset_lvl5}',
        '${system_asset_name_2}',
        '',
        '${uploaded_image}',
        '${uploaded_files}',
        '${plant_id}'
      )`;
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
  global.db
    .query(sql)
    .then((result) => {
      const today = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
      psa_id = result.rows[0].psa_id;
      const activity_log = [
        {
          date: today,
          name: req.user.name,
          role: req.user.role_name,
          activity: "Created Asset " + psa_id,
          activity_type: "CREATED",
          fields: "-",
        },
      ];

      const query = `UPDATE keppel.plant_system_assets 
      SET activity_log = '${JSON.stringify(activity_log)}',
      created_date = now()
      WHERE psa_id = '${parseInt(psa_id)}';
      `;
      // console.log(query);
      return global.db.query(query);
    })
    .then((rows) => {
      return res.status(200).send({
        SuccessCode: "200",
      });
    })
    .catch((err) => console.log(err));

  //   global.db.query(sql, function (err, result) {
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
  var q = `DELETE from keppel.history where asset_id = '${psa_id}';
  DELETE from keppel.plant_system_assets where psa_id = '${psa_id}'`;
  // console.log(q);
  global.db.query(q, function (err, result) {
    if (err) {
      console.log(err);
    }

    return res.status(200).send({
      SuccessCode: "200",
    });
  });
};

const fetchAssetHistory = async (req, res, next) => {
  let query = `SELECT 
    to_timestamp(substr(((activity.value -> 'date'::text)::character varying)::text, 2, length(((activity.value -> 'date'::text)::character varying)::text) - 5), 'YYYY-MM-DD HH24:mi:ss'::text) AS history_id,
    btrim(concat(activity.value -> 'activity_type'::text), '"'::text) AS action,
    btrim(((activity.value -> 'name'::text)::character varying)::text, '"'::text) AS name,
    to_timestamp(substr(((activity.value -> 'date'::text)::character varying)::text, 2, length(((activity.value -> 'date'::text)::character varying)::text) - 5), 'YYYY-MM-DD HH24:mi:ss'::text) AS date,
    btrim(concat(activity.value -> 'fields'::text), '"'::text) AS fields
    FROM keppel.plant_system_assets,
    LATERAL jsonb_array_elements(plant_system_assets.activity_log) activity(value)
    WHERE psa_id = $1`;
    
    try {
    
      const totalRows = await global.db.query(query, [req.params.psa_Id]);
      const totalPages = Math.ceil(+totalRows.rowCount / ITEMS_PER_PAGE);
      const page = req.query.page || 1;
      const offsetItems = (+page - 1) * ITEMS_PER_PAGE;
    
      query += ` LIMIT ${ITEMS_PER_PAGE} OFFSET ${offsetItems}`
      const results = await global.db.query(query, [req.params.psa_Id]);
      return res.status(200).json({ rows: results.rows, total: totalPages });
    } catch (err) {
      console.log(err);
      return res.status(500).json({ msg: error });
    }

  // global.db.query(
  //   query,
  //   (err, result) => {
  //     if (err) {
  //       return res.status(400).send({
  //         msg: err,
  //       });
  //     }
  //     return res.status(200).send(result.rows);
  //   }
  // );
};

module.exports = {
  getUploadedFile,
  getSystemsFromPlant,
  getSystemAssetsFromPlant,
  getSystemAssetNamesFromPlant,
  getSubComponentsFromPlant,
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
  getAllAssets,
};
