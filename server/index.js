const express = require('express');
const next = require('next');
const bodyParser = require('body-parser');
const db = require("../db");
const passport = require('passport');
const LocalStrategy = require('passport-local');
const bcrypt = require("bcryptjs");
const session = require('express-session')

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

app.prepare().then(() => {
	const server = express()

	server.use(session({
		secret: "secret",
		resave: true,
		saveUninitialized: true
	}))
	server.use(passport.initialize());
	server.use(passport.session());

	passport.use(new LocalStrategy((username, password, callback) => {
		console.log(username, password)
		db.query("SELECT * FROM keppel.users WHERE LOWER(user_name) = LOWER($1::text)", [username], (err, result) => {
			if(err)							return callback(err);
			if(result.rows.length < 1)		return callback(null, false, { message: 'Incorrect username or password.' });

			console.log(result.rows)

			bcrypt.compare(password, result.rows[0].user_pass.toString(), (bErr, bRes) => {
				console.log(bErr);
				console.log(bRes);

				if (bErr)		return callback(null, false, { message: 'Incorrect username or password.', detailedmsg: bErr });
				if(!bRes)		return callback(null, false, { message: 'Incorrect username or password.' });
								console.log("success"); return callback(null, result.rows[0]);
			})
		})
	}));

	passport.serializeUser((user, cb) => {
		cb(null, user.user_id);
	});
	
	passport.deserializeUser((id, cb) => {
		db.query("SELECT * FROM keppel.users WHERE user_id = $1::text", [id], (err, result) => {
			if (err) return cb(err);
			const userInfo = {
				user_name: result.rows[0].user_name,
			};
			cb(null, userInfo);
		})
	})

	server.use(bodyParser.json())

	server.post('/api/login', passport.authenticate("local", {
	}), (req, res) => {
		return res.status(200).json({
			msg: "yeah"
		});
	});

	// NO API ROUTE
	server.all('/api/*', (req, res) => {
		return res.status(404).send();
	})

	// HOME PAGE
	server.get('/', (req, res) => {
		return res.redirect("/Login");
	})

	// NEXT JS
	server.get('*', (req, res) => {
		return handle(req, res)
	})

	server.listen(3001, () => {
		console.log('Ready on http://localhost:3001')
	})
})