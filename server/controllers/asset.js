const db = require("../../db");

const getAssetsFromPlant = async (req, res, next) => {
    const { plant_id } = req.params;

    if (plant_id === undefined) res.status(400).json({ msg: "plant id not provided" });

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

const getAssetHistory = async (req, res, next) => {
    const id = parseInt(req.params.id);
    if (id === NaN) return res.status(400).json("Invalid asset id");
    const queryS = `SELECT * FROM (SELECT requesthistory as history FROM keppel.request WHERE psa_id = ${id}
    UNION 
    SELECT history FROM keppel.checklist_master WHERE linkedassetids LIKE '%${id}%') AS H
    WHERE H.history IS NOT NULL`;
    db.query(queryS, (err, found) => {
        if (err) throw err;
        else return res.status(200).json(found.rows)
    });
};

module.exports = {
    getAssetsFromPlant,
    getAssetHierarchy,
    getAssetDetails,
    getAssetHistory,
};
