const getAllPlantLoc = async (req, res, next) => {
    global.db.query(`SELECT loc_id as id, plant_id, concat(concat(loc_floor, ' Floor - '), loc_room) as location
        FROM keppel.plant_location`, (err, result) => {
            if (err) throw err;
            res.status(200).send(result.rows);
    })
}

module.exports = {
    getAllPlantLoc
};