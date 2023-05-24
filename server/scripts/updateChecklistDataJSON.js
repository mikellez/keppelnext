const { Client } = require("pg");

const getOldChecklists = async (checklistType) => {
    if (!validateChecklistType(checklistType)) throw new Error("Invalid checklist type.");

    const checklists = await queryChecklists(checklistType);
    return checklists
        .filter(c => c.datajson.constructor != Array)
        .map(c => {return {id: c.checklist_id, datajson: c.datajson}});
};

const validateChecklistType = (checklistType) => {
    return  (checklistType != "template" || checklistType != "record");
};

const queryChecklists = async (checklistType) => {
    const client = connectDB();
    const table = checklistType === "templates" ? "checklist_templates" : "checklist_master";
    const result = await client.query(`SELECT * from keppel.${table}`);

    client.end();
    return result.rows
};

const connectDB = () => {
    const client = new Client({
        user: "postgres",
        host: "192.168.20.96",
        database: "cmms",
        password: "123Az!!!",
        port: 5432,
        application_name: "Keppel CMMS (Next.js)",
    });

    client.connect();
    return client;
};

const changeChecklist = async (checklists) => {
    return checklists.map(t => {
        return {
            ...t,
            datajson: changeJSONFormat(t.datajson)
        };
    });
};

const changeJSONFormat = (datajson) => {
    const sections = [];
    for (const [key, value] of Object.entries(datajson)) {
        sections.push(value);
    }
    return sections.map(s => changeSectionFormat(s));
};

const changeSectionFormat = (section) => {
    let description;
    const rows = [];

    for (const [key, value] of Object.entries(section)) {
        if (key === "sectionName") {
            description = value;
        } else {
            rows.push(value);
        }
    }

    return {
        description: description, 
        rows: rows.map(r => changeRowFormat(r))
    };
};

const changeRowFormat = (row) => {
    return {
        description: row.rowDescription, 
        checks: row.checks.map(c => changeCheckFormat(c))
    };
};

const changeCheckFormat = (check) => {
    const newCheck = {
        type: changeCheckType(check.input_type),
        question: check.question,
        value: "",
    }
    
    if (check.input_type === "radio" || check.input_type === "checkbox") {
        newCheck.choices = [...check.values];
    }

    return newCheck;
};

const changeCheckType = (type) => {
    switch(type) {
        case "Signature":
            return "Signature";
        case "radio":
            return "SingleChoice";
        case "file":
            return "FileUpload";
        case "textarea":
        case "textarealong":
        case "textareashort":
            return "FreeText";
        case "checkbox":
            return "MultiChoice";
    };
};

const updateDB = async (checklists, checklistType) => {
    if (!validateChecklistType(checklistType)) throw new Error("Invalid checklist type.");
    const table = checklistType === "templates" ? "checklist_templates" : "checklist_master";

    for (const checklist of checklists) {
        const client = connectDB();  

        await client.query(`
            UPDATE keppel.${table} SET
            datajson = $1
            WHERE checklist_id = $2
        `, [JSON.stringify(checklist.datajson), checklist.id]);

        client.end();
    }
};

const main = async (checklistType) => {
    const checklists = await getOldChecklists(checklistType);
    const newChecklists = await changeChecklist(checklists);
    await updateDB(newChecklists, checklistType);
};

main("record")
.then(r => console.log("Successfull updated checklists"))
.catch(err => console.log(err))

