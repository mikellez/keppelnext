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

        global.db.query(`SELECT pl.loc_id as id, pl.plant_id, pm.plant_name, concat(concat(loc_floor, ' Floor - '), loc_room) as location
        FROM keppel.plant_location pl
        JOIN keppel.plant_master pm ON pl.plant_id = pm.plant_id
        WHERE loc_id = $1`, [loc_id], (err, result) => {
            if (err) throw err;
            res.status(200).send(result.rows[0]);
        })
    } catch (e) {
        console.log(e);
    }
}

const getUserPlantLocs = async (req, res) => {
    const query = `
        SELECT 
            pl.plant_id,
            pm.plant_name,
            pl.loc_id,
            pl.loc_floor,
            pl.loc_room
        FROM 
            keppel.users u
            JOIN keppel.user_access ua ON u.user_id = ua.user_id
            JOIN keppel.plant_location pl ON ua.allocatedplantids LIKE
            concat(concat('%', pl.plant_id), '%') 
            JOIN keppel.plant_master pm ON pl.plant_id = pm.plant_id
        WHERE ua.user_id = $1
    `
    try {
        const result = await global.db.query(query, [req.user.id]);
        res.status(200).send(result.rows);
    } catch (e) {
        console.log(e);
        res.status(500).send("Error has occured in the server")
    }
}

module.exports = {
    getAllPlantLoc,
    getSinglePlantLoc,
    getUserPlantLocs,
};