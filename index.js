const config   = require('./config');

const path     = require('path');
const fs       = require('fs');
const _        = require('lodash');

const express  = require('express');
const app      = express();
const http     = require('http').createServer(app);
const io       = require('socket.io')(http);
const nunjucks = require('nunjucks');

/**
 * CREATING A GLOBAL SETTINGS OBJECT
 */

// Theme
let skin = { path: config.theme };
const themeConfig = JSON.parse(fs.readFileSync(`themes/${config.theme}/config.json`, 'utf8'));
config.theme = _.assign(themeConfig, skin);

// Integrations
config.integrations.forEach((int) => {
	const intConfig = JSON.parse(fs.readFileSync(`integrations/${int}/config.json`, 'utf8'));
	config[int] = _.assign(intConfig, config[int]);
});

/**
 * THE BIT WHERE WE MAKE IT ALL WORK
 */

// Nunjucks configuration
nunjucks.configure(__dirname, {
	autoescape: true,
	express: app
});

// Websockets
io.sockets.on('connection', (socket) => {
	socket.on('connect', () => {
		console.log('Connected to control panel.');
	});
	socket.on('disconnect', () => {
		console.log('Disconnected from control panel.');
	});
	socket.on('reconnect', () => {
		console.log('Reconnected to control panel.');
	});
	socket.on('command', (cmd, params) => {
		io.emit('command', cmd, params);
		console.log('Command:', cmd, params);
	})
});

// Static assets URL
app.use('/themes', express.static('themes'));
app.use('/integrations', express.static('integrations'));

// Dashboard page routing
app.get('/', (req, res) => {
	res.render(`index.html`, {
		settings: config
	});
});

app.get('/admin', (req, res) => {
	res.render(`admin.html`, {
		settings: config
	});
});

// Integrations routing
config.integrations.forEach((int) => {
	console.log(`Loading "${int}" integration.`);
	app.get(`/integration/${int}`, (req, res) => {
		const integrationSettings = config[int];
		integrationSettings.path = int;
		integrationSettings.theme = config.theme;
		res.render(`integrations/${int}/index.html`, {
			settings: integrationSettings
		});
	});
});

// Make the server actually accessible
http.listen(config.port, () => {
	console.log('Full configuration:', config);
	console.log(`Server started on http://127.0.0.1:${config.port}.`);
});