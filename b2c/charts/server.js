var express = require('express');
var app = express();

var CONFIG = {
	POINTS: {
		QTY: 100,					// number of points
		MIN: -100,					// minimum value of a point
		MAX: 100,					// maximum value of a point
		UPDATE_INTERVAL: 20			// interval between points update (ms)
	}
};

var points;

function getRandom(min, max) {
	return Math.round(Math.random() * (max - min) + min);
}

function initPoints() {
	points = [];
	for (var pointIndex = 0; pointIndex < CONFIG.POINTS.QTY; pointIndex++) {
		points[pointIndex] = getRandom(CONFIG.POINTS.MIN, CONFIG.POINTS.MAX);
	}
}

function updatePoints() {
	points.shift();
	points.push(getRandom(CONFIG.POINTS.MIN, CONFIG.POINTS.MAX));
}

initPoints();
setInterval(updatePoints, CONFIG.POINTS.UPDATE_INTERVAL);

app.use(express.static('public'));

app.get('/api/v1/config', function (req, res) {
	res.json(CONFIG);
});

app.get('/api/v1/points', function (req, res) {
	res.json(points);
});

app.listen(3000, function () {
	console.log('listening on port 3000');
});
