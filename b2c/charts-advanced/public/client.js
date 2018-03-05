$(function () {
	const URL_INIT = '/api/v1/init';
	const URL_DELTA = '/api/v1/client/{clientKey}/delta/{blockKey}/since/{time}';

	const CANVAS_STYLE_BG = 'rgb(200, 200, 200)';
	const CANVAS_STYLE_LINE = 'rgb(100, 100, 100)';
	const CANVAS_CX = 200;
	const CANVAS_CY = 100;
	const CANVAS_MY = Math.round(CANVAS_CY / 2);
	let CANVAS_DX = 0;
	let CANVAS_DY = 0;

	let blocks = {};
	let clientKey = null;

	function tmpl(template, data) {
		let result = template;
		Object.keys(data).forEach(function (key) {
			result = result.replace('{' + key + '}', data[key]);
		});
		return result;
	}

	function getCanvasId(blockKey) {
		return 'block-' + blockKey;
	}

	function initBlocks() {
		let canvasHtml = '';
		Object.keys(blocks).forEach(blockKey => {
			canvasHtml += tmpl(
				'<canvas id="{id}" width="{width}" height="{height}"></canvas>',
				{id: getCanvasId(blockKey), width: CANVAS_CX, height: CANVAS_CY}
			);
			document.getElementById('app').innerHTML = '<div id="blocks">' + canvasHtml + '</div>';
		});
	}

	function redrawBlock(blockKey) {
		const points = blocks[blockKey].points;
		const canvas = document.getElementById(getCanvasId(blockKey));
		const ctx = canvas.getContext('2d');
		ctx.fillStyle = CANVAS_STYLE_BG;
		ctx.fillRect(0, 0, CANVAS_CX, CANVAS_CY);
		if (!blocks[blockKey].enabled) return;
		ctx.strokeStyle = CANVAS_STYLE_LINE;
		ctx.lineWidth = 1;
		ctx.beginPath();
		ctx.moveTo(0, Math.round(CANVAS_MY + CANVAS_DY * points[0]));
		for (let pointIndex = 1; pointIndex < points.length; pointIndex++) {
			ctx.lineTo(Math.round(CANVAS_DX * pointIndex), Math.round(CANVAS_MY + CANVAS_DY * points[pointIndex]));
		}
		ctx.stroke();
	}

	function redrawBlocks() {
		Object.keys(blocks).forEach(redrawBlock);
	}

	function updateBlock(blockKey) {
		const url = tmpl(URL_DELTA, {blockKey, clientKey, time: blocks[blockKey].time});
		$.getJSON(url, function (data) {
			if (data.error) {
				console.log('Error while receiving data for a block ' + blockKey, data.error);
				return;
			}
			blocks[blockKey].enabled = data.enabled;
			blocks[blockKey].time = data.time;
			if (!data.delta || !data.delta.length) {
				//console.log('No data received for a block ' + blockKey);
				return;
			}
			blocks[blockKey].points = blocks[blockKey].points.slice(data.delta.length).concat(data.delta);
		});
	}

	function updateBlocks() {
		Object.keys(blocks).forEach(updateBlock);
		redrawBlocks();
	}

	$.getJSON(URL_INIT, function (data) {
		clientKey = data.clientKey;
		blocks = data.stations;
		Object.keys(blocks).forEach(blockKey => {
			blocks[blockKey].time = data.time;
		});

		CANVAS_DX = CANVAS_CX / 100;
		CANVAS_DY = CANVAS_CY / 200;

		initBlocks();
		setInterval(updateBlocks, 1000);
	});
});
