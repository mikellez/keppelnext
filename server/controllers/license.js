const ITEMS_PER_PAGE = 10;

const fetchLicenseTypes = async (req, res) => {
  try {
    const results = await global.db.query(`
        SELECT * FROM keppel.license_type
        `);
    res.status(200).send(results.rows);
  } catch (err) {
    console.log(err);
    res.status(500).send("An error has occured while fetching license types");
  }
};

const fetchAllLicenseQuery = (expand, search) => {
  let expandCond = "";
  let SELECT_ARR = [];

  const SELECT = {
    id: "lc.license_id As id",
    license_name: "lc.license_name",
    license_provider: "lc.license_provider",
    license_type_id: "lc.license_type_id",
    license_type: "lt.type AS license_type",
    license_details: "lc.license_details",
    plant_loc_id: "lc.plant_loc_id",
    loc_floor: "pl.loc_floor",
    loc_room: "pl.loc_room",
    plant_name: "pm.plant_name",
    linked_asset_id: "lc.linked_asset_id",
    linked_asset: "psa.plant_asset_instrument AS linked_asset",
    linked_asset_name: "tmp1.asset_name as linked_asset_name",
    assigned_user_id: "lc.assigned_user_id",
    assigned_user:
      "concat( concat(assignU.first_name, ' '), assignU.last_name) AS assigned_user",
    acquisition_date: "lc.acquisition_date",
    expiry_date: "lc.expiry_date",
    status_id: "lc.status_id",
    status: "sl.status",
    images: "lc.images",
  };

  if (expand) {
    const expandArr = expand.split(",");

    SELECT_ARR = [];
    for (let i = 0; i < expandArr.length; i++) {
      SELECT_ARR.push(SELECT[expandArr[i]]);
    }
  } else {
    for (let key in SELECT) {
      if (SELECT.hasOwnProperty(key)) {
        SELECT_ARR.push(SELECT[key]);
      }
    }
  }

  expandCond = SELECT_ARR.join(", ");

  const query = `
        SELECT 
            ${expandCond}
        FROM
            keppel.users u
            JOIN keppel.user_access ua ON u.user_id = ua.user_id
            JOIN keppel.license lc ON ua.allocatedplantids LIKE   
            concat(concat ('%', (SELECT plant_id FROM keppel.plant_location tmp1 WHERE tmp1.loc_id = lc.plant_loc_id)), '%')
            LEFT JOIN keppel.license_type lt ON lc.license_type_id = lt.type_id
            LEFT JOIN keppel.plant_location pl ON lc.plant_loc_id = pl.loc_id
            Left JOin keppel.plant_master pm ON pl.plant_id = pm.plant_id
            LEFT JOIN keppel.plant_system_assets psa ON lc.linked_asset_id = psa.psa_id
            LEFT JOIN keppel.users assignU ON lc.assigned_user_id = assignU.user_id   
            LEFT JOIN keppel.status_lm sl ON lc.status_id = sl.status_id
            left JOIN (SELECT psa_id ,  concat( system_asset , ' | ' , plant_asset_instrument ) AS asset_name 
              FROM  keppel.system_assets   AS t1 ,keppel.plant_system_assets AS t2
              WHERE t1.system_asset_id = t2.system_asset_id_lvl4) tmp1 ON tmp1.psa_id = lc.linked_asset_id
        `;
  console.log(query);
  return query;
};

const fetchDraftLicenseQuery = (expand, search) => {
  return (
    fetchAllLicenseQuery(expand, search) +
    `
        WHERE ua.user_id = $1 AND
        (lc.status_id = 1 OR lc.status_id = 2)
    `
  );
};

const fetchAcquiredLicenseQuery = (expand, search) => {
  return (
    fetchAllLicenseQuery(expand, search) +
    `
        WHERE ua.user_id = $1 AND
        (lc.status_id = 3)
    `
  );
};

const fetchSingleLicense = async (req, res, next) => {
  console.log("Fetching single license");
  const expand = req.query.expand || false;
  try {
    const query = `
            SELECT * FROM keppel.license WHERE license_id = $1
        `;
    const result = await global.db.query(query, [req.params.id]);
    res.status(200).send(result.rows[0]);
  } catch (err) {
    console.log(err);
    res.status(500).send("Error fetching license");
  }
};

const fetchLicenseImages = async (req, res, next) => {
  const query = `SELECT images FROM keppel.license WHERE license_id = $1`;
  try {
    const result = await global.db.query(query, [req.params.id]);
    res.status(200).send(result.rows[0]);
  } catch (err) {
    console.log(err);
    res.status(500).send("Error fetching license images");
  }
};

const fetchDraftLicenses = async (req, res, next) => {
  const page = req.query.page || 1;
  const offsetItems = (+page - 1) * ITEMS_PER_PAGE;
  const expand = req.query.expand || false;
  const search = req.query.search || "";

  const pagesQuery =
    `SELECT COUNT(*) AS row_count FROM (` +
    fetchDraftLicenseQuery(expand, search) +
    `) subquery`;

  try {
    const tmp = await global.db.query(pagesQuery, [req.user.id]);
    const totalRows = tmp.rows[0].row_count;
    const totalPages = Math.ceil(+totalRows / ITEMS_PER_PAGE);
    const query =
      fetchDraftLicenseQuery(expand, search) +
      ` LIMIT ${ITEMS_PER_PAGE} OFFSET ${offsetItems}`;
    // console.log(query);
    const result = await global.db.query(query, [req.user.id]);
    return res.status(200).json({ rows: result.rows, total: totalPages });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ msg: err });
  }
};

const fetchAcquiredLicenses = async (req, res, next) => {
  const page = req.query.page || 1;
  const offsetItems = (+page - 1) * ITEMS_PER_PAGE;
  const expand = req.query.expand || false;
  const search = req.query.search || "";

  const pagesQuery =
    `SELECT COUNT(*) AS row_count FROM (` +
    fetchAcquiredLicenseQuery(expand, search) +
    `) subquery`;

  try {
    const tmp = await global.db.query(pagesQuery, [req.user.id]);
    const totalRows = tmp.rows[0].row_count;
    const totalPages = Math.ceil(+totalRows / ITEMS_PER_PAGE);
    const query =
      fetchAcquiredLicenseQuery(expand, search) +
      ` LIMIT ${ITEMS_PER_PAGE} OFFSET ${offsetItems}`;
    // console.log(query);
    const result = await global.db.query(query, [req.user.id]);
    return res.status(200).json({ rows: result.rows, total: totalPages });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ msg: err });
  }
};

const createLicense = async (req, res, next) => {
  const license = req.body;
  const images = req.files.map((file) => file.buffer);
  const status = license.assigned_user_id ? 2 : 1;

  const query = `
        INSERT INTO keppel.license (
            license_name,
            license_provider,
            license_type_id,
            license_details,
            plant_id,
            plant_loc_id,
            linked_asset_id,
            assigned_user_id,
            images,
            status_id
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    `;
  try {
    await global.db.query(query, [
      license.license_name,
      license.license_provider,
      license.license_type_id,
      license.license_details,
      license.plant_id,
      license.plant_loc_id,
      license.linked_asset_id,
      license.assigned_user_id,
      images,
      status,
    ]);
    res.status(200).send("Successfully created license");
  } catch (err) {
    console.log(err);
    res.status(500).send("Error creating license");
  }
};

module.exports = {
  fetchDraftLicenses,
  createLicense,
  fetchLicenseTypes,
  createLicense,
  fetchSingleLicense,
  fetchLicenseImages,
  fetchAcquiredLicenses,
};
