const db = require("../../db");
const moment = require("moment");

const fetchChangeOfParts = async (req, res, next) => {
    const sql = `
        SELECT 
            cop.cop_id,
            cop.psa_id,
            cop.changed_date,
            cop.scheduled_date,
            cop.description,
            psa.plant_system_instrument,
            psa.plant_id,
            pm.plant_name
        FROM
            keppel.change_of_parts cop
                JOIN keppel.plant_system_assets psa ON cop.psa_id = psa.psa_id
                JOIN keppel.plant_master pm ON psa.plant_id = pm.plant_id
        ORDER_BY(plant_id, psa_id);
    `;

    db.query(sql, (err, found) => {
        if (err) return res.status(500).json("Failure to fetch change of parts");
        if (found.rows.length === 0) return res.status(404).json("No change of parts found");
        return res.status(200).send(found.rows)
    })
};

module.exports =  {
    fetchChangeOfParts,
}