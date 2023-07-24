const ITEMS_PER_PAGE = 10;

const fetchAllLicenseQuery = (expand, search) => {
  let expandCond = "";
  let SELECT_ARR = [];

  const SELECT = {
    license_id: "lc.license_id",
    license_name: "lc.license_name",
    license_provider: "lc.license_provider",
    license_type_id: "lc.license_type_id",
    license_type: "lt.type AS license_type",
    license_details: "lc.license_details",
    plant_loc_id: "lc.plant_loc_id",
    loc_floor: "pl.loc_floor",
    loc_room: "pl.loc_room",
    linked_asset_id: "lc.linked_asset_id",
    linked_asset: "psa.plant_asset_instrument AS linked_asset",
    assigned_user_id: "lc.assigned_user_id",
    assigned_user:
      "concat( concat(assignU.first_name, ' '), assignU.last_name) AS assigned_user",
    images: "lc.images",
    acquisition_date: "lc.acquisition_date",
    expiry_date: "lc.expiry_date",
    status_id: "lc.status_id",
    status: "sl.status",
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
            LEFT JOIN keppel.plant_system_assets psa ON lc.linked_asset_id = psa.psa_id
            LEFT JOIN keppel.users assignU ON lc.assigned_user_id = assignU.user_id   
            LEFT JOIN keppel.status_lm sl ON lc.status_id = sl.status_id
        `;
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
    const result = await global.db.query(query, [req.user.id]);
    return res.status(200).json({ rows: result.rows, total: totalPages });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ msg: error });
  }
};

module.exports = {
    fetchDraftLicenses,
}