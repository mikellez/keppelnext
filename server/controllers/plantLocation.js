const getAllPlantLoc = async (req, res, next) => {
    try {

        global.db.query(`SELECT loc_id as id, plant_id, concat(concat(loc_floor, ' Floor - '), loc_room) as location
        FROM keppel.plant_location`, (err, result) => {
            if (err) throw err;
            res.status(200).send(result.rows);
        })
    } catch (e) {
        console.log(e);
        res.status(500).send("Error has occured in the server")
    }
}

const getSinglePlantLoc = async (req, res, next) => {
    const loc_id = req.params.id;
    try {

        global.db.query(`SELECT loc_id as id, plant_id, concat(concat(loc_floor, ' Floor - '), loc_room) as location
        FROM keppel.plant_location
        WHERE loc_id = $1`, [loc_id], (err, result) => {
            if (err) throw err;
            res.status(200).send(result.rows[0]);
        })
    } catch (e) {
        console.log(e);
    }
}

module.exports = {
    getAllPlantLoc,
    getSinglePlantLoc,
};