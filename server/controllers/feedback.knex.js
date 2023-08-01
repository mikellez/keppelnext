/**
 * FetchFilteredFeedback is not added from the original feedback.js as it is not
 * used on the frontend
 */

const knexConfig = require('../db/knexConfig');
const knex = require('knex')(knexConfig.development);
const moment = require("moment");
const {
  CreateFeedbackMail,
  AssignFeedbackMail,
  CompletedFeedbackMail,
} = require("../mailer/FeedbackMail");

const ITEMS_PER_PAGE = 10;

const conditionGen = (req) => {
    let date = req.params.date || 'all';
    let datetype = req.params.datetype;
    // let status = req.params.status || 0;
    let plant = req.params.plant || 0;
    // let dateCond = "";
    // let statusCond = "";
    // let plantCond = "";
    // let userRoleCond = "";
    const cond = {}

    if (plant && plant != 0) {
        cond.plant_id = [plant,];
    //   plantCond = `AND f.plant_loc_id = '${plant}'`;
    }
  
    if (date !== "all") {
      switch (datetype) {
        case "week":
          dateCond = `
                    DATE_PART('week', F.CREATED_DATE::DATE) = DATE_PART('week', '${date}'::DATE) 
                    DATE_PART('year', F.CREATED_DATE::DATE) = DATE_PART('year', '${date}'::DATE)`;
  
          break;
  
        case "month":
          dateCond = `
                    DATE_PART('month', F.CREATED_DATE::DATE) = DATE_PART('month', '${date}'::DATE) 
                    DATE_PART('year', F.CREATED_DATE::DATE) = DATE_PART('year', '${date}'::DATE)`;
  
          break;
  
        case "year":
          dateCond = `DATE_PART('year', F.CREATED_DATE::DATE) = DATE_PART('year', '${date}'::DATE)`;
  
          break;
  
        case "quarter":
          dateCond = `
                    DATE_PART('quarter', F.CREATED_DATE::DATE) = DATE_PART('quarter', '${date}'::DATE) 
                    DATE_PART('year', F.CREATED_DATE::DATE) = DATE_PART('year', '${date}'::DATE)`;
  
          break;
        default:
          dateCond = `F.CREATED_DATE::DATE = '${date}'::DATE`;

        cond.dateCond = dateCond;
      }
    }
  
    return cond;
  
  }

// const feedbackQuery = async () => {
//     const query = knex
//       .select(
//         'f.feedback_id as id',
//         'f.plant_loc_id',
//         'f.plant_id',
//         'f.description',
//         'f.contact',
//         'f.imageurl as image',
//         'f.status_id',
//         'f.activity_log',
//         'f.completed_date',
//         'f.remarks',
//         knex.raw("concat(concat(createdu.first_name, ' '), createdu.last_name) AS createdByUser"),
//         knex.raw("concat(concat(assignu.first_name, ' '), assignu.last_name) AS assigned_user_name"),
//         'pl.loc_room',
//         'pl.loc_id',
//         'pl.loc_floor',
//         'pm.plant_name',
//         'pm.plant_id',
//         'f.created_date',
//         'f.assigned_user_id',
//         'st.status',
//         'f.name',
//         'f.created_user_id',
//         'f.completed_img'
//       )
//       .from('keppel.users AS u')
//       .join('keppel.user_access AS ua', 'u.user_id', '=', 'ua.user_id')
//       .join('keppel.feedback AS f', knex.raw("ua.allocatedplantids LIKE concat(concat('%', f.plant_id::text), '%')"))
//       .leftJoin(
//         knex.raw('(SELECT t3.feedback_id FROM keppel.feedback AS t3 GROUP BY t3.feedback_id) tmp1'),
//         'tmp1.feedback_id',
//         'f.feedback_id'
//       )
//       .leftJoin('keppel.users AS assignu', 'assignu.user_id', 'f.assigned_user_id')
//       .leftJoin('keppel.users AS createdu', 'createdu.user_id', 'f.created_user_id')
//       .leftJoin('keppel.plant_master AS pm', 'pm.plant_id', 'f.plant_id')
//       .leftJoin('keppel.plant_location AS pl', 'pl.loc_id', 'f.plant_loc_id')
//       .join('keppel.status_fm AS st', 'st.status_id', 'f.status_id');
// }

const specificFeedbackQuery = async (expand, cond, pageOptions, user_id) => {
    let expandCond = "";
    let SELECT_ARR = [];
    const rawFields = ["createdByUser", "assigned_user_name"]

    const SELECT = {
        id: "f.feedback_id AS id",
        plant_loc_id: "f.plant_loc_id",
        plant_id: "f.plant_id",
        description: "f.description",
        contact: "f.contact",
        image: "f.imageurl AS image",
        status_id: "f.status_id",
        activity_log: "f.activity_log",
        completed_date: "f.completed_date",
        remarks: "f.remarks",
        createdByUser:
        "concat( concat(createdu.first_name ,' '), createdu.last_name ) AS createdByUser",
        assigned_user_name:
        "concat( concat(assignu.first_name ,' '), assignu.last_name ) AS assigned_user_name",
        loc_room: "pl.loc_room",
        loc_id: "pl.loc_id",
        loc_floor: "pl.loc_floor",
        plant_name: "pm.plant_name",
        plant_id: "pm.plant_id",
        created_date: "f.created_date",
        assigned_user_id: "f.assigned_user_id",
        status: "st.status",
        name: "f.name",
        created_user_id: "f.created_user_id",
        completed_img: "f.completed_img",
    };

    SELECT_ARR = [];
    SELECT_RAW_ARR = [];
    if (expand) {
        const expandArr = expand.split(",");

        for (let i = 0; i < expandArr.length; i++) {
            if (rawFields.includes(expandArr[i])) {
                SELECT_RAW_ARR.push(SELECT[expandArr[i]])
            } else {
                SELECT_ARR.push(SELECT[expandArr[i]]);

            }
        }
    } else {
        for (let key in SELECT) {
            if (SELECT.hasOwnProperty(key)) {
                if (rawFields.includes(key)) {
                    SELECT_RAW_ARR.push(SELECT[key])
                } else {
                    SELECT_ARR.push(SELECT[key]);
    
                }
            }
        }
    }

    expandCond = SELECT_ARR;
    console.log(SELECT_RAW_ARR)
    
    const query = knex
        .select(expandCond)
        .select(SELECT_RAW_ARR.map(field => knex.raw(field)))
            .from('keppel.users AS u')
            .join('keppel.user_access AS ua', 'u.user_id', '=', 'ua.user_id')
            .join('keppel.feedback AS f', knex.raw("ua.allocatedplantids LIKE concat(concat('%', f.plant_id::text), '%')"))
            .leftJoin('keppel.users AS assignu', 'assignu.user_id', 'f.assigned_user_id')
            .leftJoin('keppel.users AS createdu', 'createdu.user_id', 'f.created_user_id')
            .leftJoin('keppel.plant_master AS pm', 'pm.plant_id', 'f.plant_id')
            .leftJoin('keppel.plant_location AS pl', 'pl.loc_id', 'f.plant_loc_id')
            .leftJoin('keppel.status_fm AS st', 'st.status_id', 'f.status_id')


    if (cond.userCond) {
        query.where(function () {
            this.where("ua.user_id", user_id).orWhere("f.assigned_user_id", user_id)
        })
    } else {
        query.where("ua.user_id", user_id)
    }

    if (cond.feedback_id) {
        query.where("f.feedback_id", cond.feedback_id)
    }

    if (cond.status_id) {
        query.whereIn('f.status_id', cond.status_id)
    }
    if (cond.plant_id) {
        query.whereIn('f.plant_id', cond.plant_id)
    }
    if (cond.date) {
        query.whereRaw(cond.date)
    }
    
    if (pageOptions) {
        query.limit(pageOptions.limit).offset(pageOptions.offset)
    }

    query.orderBy("f.feedback_id", "desc")

    return query;


    
}

const fetchPendingFeedback = async (req, res, next) => {
    const page = req.query.page || 1;
    const expand = req.query.expand || null;
    // const search = req.query.search || null;
    const offsetItems = (+page - 1) * ITEMS_PER_PAGE;
    
    const condition = conditionGen(req);
    condition.status_id = [1];
    
    const pageOptions = {
        limit: ITEMS_PER_PAGE,
        offset: offsetItems
    }
    try {
        const results = await specificFeedbackQuery(expand, condition, pageOptions, req.user.id);
        res.status(200).json({rows: results})
    } catch (err) {
        console.log(err);
        next(err);
    }
}

const fetchAssignedFeedback = async (req, res, next) => {
    const page = req.query.page || 1;
    const expand = req.query.expand || null;
    // const search = req.query.search || null;
    const offsetItems = (+page - 1) * ITEMS_PER_PAGE;

    const condition = conditionGen(req);
    condition.status_id = [2];

    const pageOptions = {
        limit: ITEMS_PER_PAGE,
        offset: offsetItems
    }

    try {
        const results = await specificFeedbackQuery(expand, condition, pageOptions, req.user.id);
        res.status(200).json({rows: results})
    } catch (err) {
        console.log(err);
        next(err);
    }
}

const fetchOutstandingFeedback = async (req, res, next) => {
    const page = req.query.page || 1;
    const expand = req.query.expand || null;
    // const search = req.query.search || null;
    const offsetItems = (+page - 1) * ITEMS_PER_PAGE;
    
    const condition = conditionGen(req);
    condition.status_id = [2];

    const pageOptions = {
        limit: ITEMS_PER_PAGE,
        offset: offsetItems
    }
    try {
        const results = await specificFeedbackQuery(expand, condition, pageOptions, req.user.id);
        res.status(200).json({rows: results})
    } catch (err) {
        console.log(err);
        next(err);
    }
}

const fetchCompletedFeedback = async (req, res, next) => {
    const page = req.query.page || 1;
    const expand = req.query.expand || null;
    // const search = req.query.search || null;
    const offsetItems = (+page - 1) * ITEMS_PER_PAGE;
    
    const condition = conditionGen(req);
    condition.status_id = [4];

    const pageOptions = {
        limit: ITEMS_PER_PAGE,
        offset: offsetItems
    }
    try {
        const results = await specificFeedbackQuery(expand, condition, pageOptions, req.user.id);
        res.status(200).json({rows: results})
    } catch (err) {
        console.log(err);
        next(err);
    }
}

const fetchSingleFeedback = async (req, res, next) => {
    const condition = {
        feedback_id: req.params.id
    };
    try {
        const result = await specificFeedbackQuery(null, condition, null, req.user.id);
        if (result.length > 0) {
            return res.status(200).send(result[0]);
          } else {
            return res.status(404).send("No Feedback found");
        }

    } catch (err) {
        console.log(err);
        next(err);
    }
}

const createFeedback = async (req, res, next) => {
    const data = req.body;
    const today = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
    const activity_log = [
        {
          date: today,
          name: req.user ? req.user.name : "Guest",
          activity: `Created Feedback on ${data.plantName} ${data.location}`,
          activity_type: "PENDING",
        },
    ];
    const feedback = {
        name: data.name,
        description: data.comments,
        plant_loc_id: data.taggedLocID,
        imageurl: data.image,
        plant_id: data.plantID,
        contact: JSON.stringify(data.contact),
        created_user_id: req.user ? req.user.id : 55,
        status_id: 1,
        created_date: today,
        completed_img: data.completed_img,
        activity_log: JSON.stringify(activity_log),
    }
    try {
        await knex("keppel.feedback").insert(feedback);
        
        const mail = new CreateFeedbackMail([feedback.contact.email], {
            name: feedback.name,
            description: feedback.comments,
            created_date: today,
        });
      
        await mail.send();
        res.status(200).send("Feedback successfully created")
    } catch (err) {
        console.log(err);
        return res.status(500).send("Failure to create feedback");
    }
}

const assignFeedback = async (req, res, next) => {
    const today = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
    const activityLog = {
        date: today,
        name: req.user.name,
        activity: `Assigned Feedback Case ID-${req.params.id} to ${req.body.assigned_user_name}`,
        activity_type: 'ASSIGNED'
    };
    const updatedFields = {
        status_id: 2,
        activity_log: knex.raw(`activity_log || ?::jsonb`, [JSON.stringify(activityLog)]),
        assigned_user_id: req.body.assigned_user_id
    }
    try {
        await knex('keppel.feedback')
            .where("feedback_id", req.params.id)
            .update(updatedFields)

        const {
            assigned_user_email,
            creator_email,
            plant_name,
            status,
            name,
            description,
            created_date,
            completed_date,
            } = await fetchEmailDetailsForSpecificFeedback(req.params.id);
        
        const mail = new AssignFeedbackMail(
        [assigned_user_email, req.user.email],
        {
            plant_name: plant_name,
            name: name,
            description: description,
            id: req.body.id,
            created_date: today,
        }
        );
    
        await mail.send();

        res.status(200).send("Feedback successfully assigned")
    } catch (err) {
        console.log(err);
        return res.status(500).send("Failure to assign feedback");
    }
}

const completeFeedback = async (req, res, next) => {
    const today = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
    const activityLog = {
        date: today,
        name: req.user.name,
        activity: `Completed Feedback Case ID-${req.params.id}`,
        activity_type: 'WORK DONE'
    };

    const updatedFields = {
        status_id: 4,
        remarks: req.body.remarks,
        completed_date: today,
        completed_img: req.body.completed_img,
        activity_log: knex.raw(`activity_log || ?::jsonb`, [JSON.stringify(activityLog)]),
    };

    try {
        await knex("keppel.feedback")
            .where("feedback_id", req.params.id)
            .update(updatedFields);

        const {
            assigned_user_email,
            creator_email,
            plant_name,
            status,
            name,
            description,
            created_date,
            completed_date,
            remarks,
            } = await fetchEmailDetailsForSpecificFeedback(req.params.id);
        
            const mail = new CompletedFeedbackMail(
            [assigned_user_email, creator_email, req.body.contact.email],
            {
                plant_name: plant_name,
                name: name,
                remarks: remarks,
                id: req.body.id,
                created_date: today,
                completed_date: today,
            }
            );
        
            await mail.send();

        res.status(200).send("Feedback successfully completed")
    } catch (err) {
        console.log(err);
        return res.status(500).send("Failure to complete feedback");
    }
}

module.exports = {
    fetchPendingFeedback,
    fetchAssignedFeedback,
    fetchCompletedFeedback,
    fetchOutstandingFeedback,
    createFeedback,
    assignFeedback,
    completeFeedback,
    fetchSingleFeedback, 
}