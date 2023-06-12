const getAllPlantLoc = async (req, res, next) => {
    global.db.query(`SELECT loc_id, plant_id, loc_floor, loc_room 
        FROM keppel.plant_location`, (err, result) => {
            if (err) throw err;
            res.status(200).send(result.rows);
    })
}

module.exports = {
    getAllPlantLoc
};