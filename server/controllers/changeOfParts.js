const db = require("../../db");
const moment = require("moment");

const fetchAllOfChangeOfPartsQuery = (req) => `
    SELECT 
        cop.cop_id,
        cop.psa_id,
        cop.changed_date,
        cop.scheduled_date,
        cop.description,
        cop.assigned_user_id,
        psa.plant_asset_instrument,
        psa.plant_id,
        pm.plant_name,
        u.first_name,
        u.last_name
    FROM
        keppel.change_of_parts cop
            JOIN keppel.plant_system_assets psa ON cop.psa_id = psa.psa_id
            JOIN keppel.plant_master pm ON psa.plant_id = pm.plant_id
            JOIN keppel.users u ON cop.assigned_user_id = u.user_id
    WHERE 
        psa.plant_id IN 
            (SELECT 
                UNNEST(string_to_array(allocatedplantids, ', ')::int[]) 
            FROM 
                keppel.user_access WHERE user_id = ${req.user.id})
        
`;

const fetchChangeOfPartsByPlantQuery = (req) => fetchAllOfChangeOfPartsQuery(req) + `AND pm.plant_id = ${req.query.plant_id} `;

const fetchChangeofPartsByAssetQuery = (req) => fetchAllOfChangeOfPartsQuery(req) + `AND cop.psa_id = ${req.query.psa_id} `;

const fetchChangeOfPartsByIdQuery = (req) => fetchAllOfChangeOfPartsQuery(req) + `AND cop.cop_id = ${req.params.cop_id} `;

const fetchAllCompletedChangeOfPartsQuery = (req) => fetchAllOfChangeOfPartsQuery(req) + `AND cop.changed_date IS NOT NULL `;

const fetchAllScheduledChangeOfPartsQuery  = (req) =>  fetchAllOfChangeOfPartsQuery(req) + `AND cop.changed_date IS NULL `;

const toCMMSChangeOfParts = (row) => {
    return {
        plant: row.plant_name,
        plantId: row.plant_id,
        description: row.description,
        changedDate: row.changed_date,
        scheduledDate: row.scheduled_date,
        assignedUser: (row.first_name + " " + row.last_name).trim(),
        assignedUserId: row.assigned_user_id,
        asset: row.plant_asset_instrument,
        psaId: row.psa_id,
        copId: row.cop_id,
    };
};

const fetchChangeOfParts = async (req, res, next) => {
    let sql = req.query.plant_id ? 
        fetchChangeOfPartsByPlantQuery(req) : 
        req.params.cop_id ? 
        fetchChangeOfPartsByIdQuery(req) : 
        req.query.psa_id ? 
        fetchChangeofPartsByAssetQuery(req) : 
        fetchAllOfChangeOfPartsQuery(req);

    sql =  req.query.type === "completed" ?
        fetchAllCompletedChangeOfPartsQuery(req) :
        req.query.type === "scheduled" ? 
        fetchAllScheduledChangeOfPartsQuery(req) : sql;
    
    sql = req.query.plant_id && req.query.type ? 
        sql + `AND pm.plant_id = ${req.query.plant_id}` :
        sql;

    global.db.query(sql, (err, found) => {
        if (err) {
            console.log(err);
            return res.status(500).json("Failure to fetch change of parts");
        }

        if (found.rows.length === 0) return res.status(204).json("No change of parts found");

        return res.status(200).send(
            found.rows.map((row) => toCMMSChangeOfParts(row))
        );
    });
};

const createNewChangeOfParts = async (req, res, next) => {
    sql = `INSERT INTO
        keppel.change_of_parts
        (
            psa_id,
            scheduled_date,
            description,
            assigned_user_id
        )
        VALUES ($1, $2, $3, $4)`;

    global.db.query(
        sql,
        [
            req.body.formData.psaId,
            moment(req.body.formData.scheduledDate).format("YYYY-MM-DD HH:mm:ss"),
            req.body.formData.description,
            req.body.formData.assignedUserId,
        ],
        (err) => {
            if (err) {
                console.log(err);
                return res.status(500).json("Failure to create new change of parts");
            }
            return res.status(200).json("New change of parts successfully created");
        }
    );
};

const editChangeOfParts = async (req, res, next) => {
    sql = `
    UPDATE 
        keppel.change_of_parts
    SET
        psa_id = $1,
        scheduled_date = $2,
        description = $3,
        assigned_user_id = $4,
        changed_date = $5
    WHERE 
        cop_id = $6
    `;

    global.db.query(
        sql,
        [
            req.body.formData.psaId,
            moment(req.body.formData.scheduledDate).format("YYYY-MM-DD HH:mm:ss"),
            req.body.formData.description,
            req.body.formData.assignedUserId,
            req.body.formData.changedDate,
            req.body.formData.copId,
        ],
        (err) => {
            if (err) {
                console.log(err);
                return res.status(500).json("Failure to update new change of parts");
            }
            return res.status(200).json("Change of parts successfully edited");
        }
    );
};

module.exports = {
    fetchChangeOfParts,
    createNewChangeOfParts,
    editChangeOfParts,
};
