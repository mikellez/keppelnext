const { checklist } = require(".");
const db = require("../../db");

// Dashboard path
function homepage(permissions) {
    switch (permissions) {
        case "admin": 
        case "manager":
            return "/Dashboard/Manager";
        case "engineer": 
            return "/Dashboard/Engineer";
        case "specialist":
            return "/Dashboard/Specialist";
    }
} 

const getDashboardPath = async (req, res, next) => {
    res.status(200).json({homepage: homepage(req.user.permissions)});
};

module.exports = { 
    getDashboardPath, 
};