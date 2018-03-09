const _ = require('lodash');
const crypto = require('crypto');
const express = require('express');
const app = express();
const WebSocket = require('ws');
const http = require('http');

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const generateBlocks = require('./blocks');

const SERVER_CONFIG = {
	PORT: 8080,
	TICK: 10,
	CLIENT_KEY_SIZE: 16,
	CLIENT_TTL: 5 * 1000,
	PROBABILITY_FAIL: 0.01
};
const BLOCKS_INIT_CONFIG = {
	alphabet: ['Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon', 'Zeta', 'Eta', 'Theta', 'Iota', 'Kappa', 'Lambda',
		'Mu', 'Nu', 'Xi', 'Omicron', 'Pi', 'Rho', 'Sigma', 'Tau', 'Upsilon', 'Phi', 'Chi', 'Psi', 'Omega'],
	pointsQty: 100,
	absMax: 100,
	delayMax: 10
};

const clients = {};

function requestShouldFail() {
	return _.random(0.0, 1.0, true) < SERVER_CONFIG.PROBABILITY_FAIL;
}

function initClient() {
	const clientKey = crypto.randomBytes(SERVER_CONFIG.CLIENT_KEY_SIZE).toString('hex');
	clients[clientKey] = {
		blocks: generateBlocks(BLOCKS_INIT_CONFIG),
		lastAccessTime: Date.now()
	};
	return clientKey;
}

setInterval(function () {
	const time = Date.now();
	_.forEach(_.keys(clients), (clientKey) => {
		const client = clients[clientKey];
		if (time - client.lastAccessTime > SERVER_CONFIG.CLIENT_TTL) {
			delete clients[clientKey];
			return;
		}
		client.blocks.tick();
	});
}, SERVER_CONFIG.TICK);

app.use(express.static('public'));

app.get('/api/v1/init', function (req, res) {
	const clientKey = initClient();
	res.json({
		clientKey: clientKey,
		time: clients[clientKey].lastAccessTime,
		stations: clients[clientKey].blocks.getBlocks()
	});
});

app.get('/api/v1/client/:clientKey/delta/:stationName/since/:time', function (req, res) {
	if (requestShouldFail()) {
		return res.status(500).send('Will be back after lunch.');
	}
	const clientKey = req.params.clientKey;
	if (!clientKey) {
		return res.json({error: `Client key cannot be empty.`});
	}
	const client = clients[clientKey];
	if (!client) {
		return res.json({error: `Client key "${clientKey}" not found.`});
	}
	client.lastAccessTime = Date.now();
	const blockKey = req.params.stationName;
	if (!blockKey) {
		return res.json({error: `Station name cannot be empty.`});
	}
	const time = req.params.time;
	if (!time) {
		return res.json({error: `Time since latest update cannot be empty.`});
	}
	let delta = null;
	try {
		delta = client.blocks.getDelta(blockKey, time);
	} catch (error) {
		return res.json({error});
	}
	res.json({
		time: client.lastAccessTime,
		...delta
	});
});

wss.on('connection', function connection (ws, req) {
   
	ws.on('message', function incoming (message) {
		let e = JSON.parse(message);
        let eventName = e.event;
		let data = e.data;

		const clientKey = data.clientKey;
		const client = clients[clientKey];
		const blockKey = data.stationName;
		const time = data.time;
		let delta = null;

		if (requestShouldFail()) {
			ws.send(JSON.stringify({event: 'state_offline', message: 'Will be back after lunch.', data: { stationName: blockKey }}));
			return;
		}

		
		if (!clientKey) {
			ws.send(JSON.stringify({event: 'error', message: 'Client key cannot be empty.'}));
			return;
		}
		
		if (!client) {
			ws.send(JSON.stringify({event: 'error', message: `Client key "${clientKey}" not found.`}));
			return;
		}

		client.lastAccessTime = Date.now();
		if (!blockKey) {
			ws.send(JSON.stringify({event: 'error', message: 'Station name cannot be empty.'}));
			return;
		}

		if (!time) {
			ws.send(JSON.stringify({event: 'error', message: 'Time since latest update cannot be empty.'}));
			return;
		}

		try {
			delta = client.blocks.getDelta(blockKey, time);
		} catch (error) {
			ws.send(JSON.stringify({event: 'error', message: error.message}));
			return;
		}

		ws.send(JSON.stringify({event: 'data_updated', data: { stationName: blockKey, time: client.lastAccessTime, ...delta }}));
	});
});

server.listen(SERVER_CONFIG.PORT, function () {
	console.log(`listening on port ${SERVER_CONFIG.PORT}`);
});
