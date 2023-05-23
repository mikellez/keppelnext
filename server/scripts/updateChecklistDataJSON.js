const db = require('../../db');

const getOldChecklistTemplates = async () => {
    try {
        const result = await db.query(`SELECT * from keppel.checklist_templates`)
        return result.rows
            .filter(c => c.datajson.constructor != Array)
            .map(c => {return {id: c.checklist_id, datajson: c.datajson}});

    } catch (err) {
        console.log(err);
    }
};

const changeTemplates = async (templates) => {
    return templates.map(t => {
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

const updateDB = async (templates) => {
    for (const template of templates) {
        try {
            await db.query(`
                UPDATE keppel.checklist_templates SET
                datajson = $1
                WHERE checklist_id = $2
            `, [JSON.stringify(template.datajson), template.id]);
        } catch (err) {
            console.log(err);
        }
    }
};

const main = async () => {
    const templates = await getOldChecklistTemplates();
    const newTemplates = await changeTemplates(templates);
    await updateDB(newTemplates);
};

// module.exports = main;
main();

