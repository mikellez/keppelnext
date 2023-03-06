const db = require("../../db");

// Dashboard path
function homepage(role_id) {
    switch (role_id) {
        case 1: 
        case 2:
            return "/Dashboard/Manager";
        case 3: 
            return "/Dashboard/Engineer";
        case 4:
            return "/Dashboard/Specialist";
    }
} 

const getDashboardPath = async (req, res, next) => {
    res.status(200).json({homepage: homepage(req.user.role_id)});
};

module.exports = { 
    getDashboardPath, 
    homepage,
};