const db = require("../../db");

const getAssetsFromPlant = async (req, res, next) => {

	const { plant_id } = req.params;

	if(plant_id === undefined)
        res.status(400).json({msg: "plant id not provided"})

    db.query(
        `SELECT psa_id, concat( system_asset , ' | ' , plant_asset_instrument) as "asset_name"  
            FROM keppel.system_assets AS t1 ,keppel.plant_system_assets AS t2
            WHERE t1.system_asset_id = t2.system_asset_id_lvl4 AND plant_id = $1`,
        [
			plant_id
		], (err, result) => {
			if(err) return res.status(500).json({msg: err});
	
			res.status(200).json(result.rows);
		});
}

module.exports = {
	getAssetsFromPlant
}