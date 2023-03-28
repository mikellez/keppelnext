const rateLimit = require('express-rate-limit');

const apiLimiter = rateLimit({
	windowMs: 5 * 60 * 1000, // 5 minutes
	max: 10000000000, // Limit each IP to 100 requests per `window` (here, per 5 minutes)
	standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

const loginLimiter = rateLimit({
	windowMs: 10 * 60 * 1000, // 10 minutes
	max: 10, 
	standardHeaders: true, 
	legacyHeaders: false, 
});

module.exports = { apiLimiter, loginLimiter }