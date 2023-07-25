const { connectDB, dellocateGlobalDB } = require("../db/dbAPI");

const main = async () => {
    connectDB("cmms_dev");
    await global.db.query(`
        CREATE TABLE IF NOT EXISTS keppel.status_lm
        (
            status_id SERIAL PRIMARY KEY,
            status character varying COLLATE pg_catalog."default"
        );
        INSERT INTO keppel.status_lm
            (status_id, status)
        VALUES 
            (1, 'PENDING'),
            (2, 'ASSIGNED'),
            (3, 'ACQUIRED'),
            (4, 'EXPIRED'),
            (5, 'ARCHIVED'),
            (6, 'DELETED');
    `)

    await global.db.query(`
        CREATE TABLE IF NOT EXISTS keppel.license_type
        (
            type_id SERIAL PRIMARY KEY,
            type character varying COLLATE pg_catalog."default"
        ); 
    `)

    await global.db.query(`
    CREATE TABLE IF NOT EXISTS keppel.license
    (
        license_id SERIAL PRIMARY KEY,
        license_name character varying COLLATE pg_catalog."default",
        license_provider character varying COLLATE pg_catalog."default",
        license_type_id integer,
        license_details character varying COLLATE pg_catalog."default",
        plant_loc_id integer,
        linked_asset_id integer,
        assigned_user_id integer,
        images bytea[],
        acquisition_date timestamp with time zone,
        expiry_date timestamp with time zone,
        status_id integer,
        plant_id integer,
        activity_log jsonb,
        CONSTRAINT assigned_user FOREIGN KEY (assigned_user_id)
            REFERENCES keppel.users (user_id) MATCH SIMPLE
            ON UPDATE NO ACTION
            ON DELETE NO ACTION,
        CONSTRAINT license_type FOREIGN KEY (license_type_id)
            REFERENCES keppel.license_type (type_id) MATCH SIMPLE
            ON UPDATE NO ACTION
            ON DELETE NO ACTION
            NOT VALID,
        CONSTRAINT linked_asset FOREIGN KEY (linked_asset_id)
            REFERENCES keppel.plant_system_assets (psa_id) MATCH SIMPLE
            ON UPDATE NO ACTION
            ON DELETE NO ACTION,
        CONSTRAINT plant_id FOREIGN KEY (plant_id)
            REFERENCES keppel.plant_master (plant_id) MATCH SIMPLE
            ON UPDATE NO ACTION
            ON DELETE NO ACTION
            NOT VALID,
        CONSTRAINT plant_loc_id FOREIGN KEY (plant_loc_id)
            REFERENCES keppel.plant_location (loc_id) MATCH SIMPLE
            ON UPDATE NO ACTION
            ON DELETE NO ACTION,
        CONSTRAINT status_id FOREIGN KEY (status_id)
            REFERENCES keppel.status_lm (status_id) MATCH SIMPLE
            ON UPDATE NO ACTION
            ON DELETE NO ACTION
            NOT VALID
    )
    `)

    dellocateGlobalDB()
    console.log("License Tables Created!")
}

main();