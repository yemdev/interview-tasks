const _ = require('lodash');

const PROBABILITY_BLOCK_DISABLE = 0.0001;
const PROBABILITY_BLOCK_ENABLE = 0.001;
const TIME_RESOLUTION = 100;			// in ms

function shouldSwitchState(probability) {
	return _.random(0.0, 1.0, true) < probability;
}

function generateShiftedRandom(max) {
	const shift = _.floor(max / 4);
	return _.floor(max / 2) + _.random(-shift, shift);
}

function initPoint({time, absMax, baseline}) {
	return {
		time,
		value: _.random(baseline - absMax, baseline + absMax)
	};
}

function initBlock({pointsQty, absMax, delayMax}) {
	const time = Date.now();
	const blockAbsMax = generateShiftedRandom(absMax);
	const baseline = _.random(-blockAbsMax, blockAbsMax);
	return {
		absMax: blockAbsMax,
		baseline: baseline,
		delay: _.random(1, delayMax),
		points: _.times(pointsQty, () => initPoint({time, absMax: blockAbsMax, baseline})),
		enabled: true,
		lastUpdateTime: time,
		adjustState: function adjustState() {
			this.enabled = this.enabled ?
				!shouldSwitchState(PROBABILITY_BLOCK_DISABLE) :
				shouldSwitchState(PROBABILITY_BLOCK_ENABLE);
		},
		adjustPoints: function adjustPoints(time) {
			if (!this.enabled) return;
			if ((time - this.lastUpdateTime) / TIME_RESOLUTION < this.delay) return;
			this.points = _.concat(_.tail(this.points), initPoint({time, absMax: blockAbsMax, baseline}));
			this.lastUpdateTime = time;
		},
		tick: function tick(time) {
			this.adjustState();
			this.adjustPoints(time);
		},
		getValues: function values() {
			return _.map(this.points, 'value');
		},
		getDelta: function delta(time) {
			return _.chain(this.points)
				.filter(point => point.time > time)
				.map('value')
				.value();
		}
	};
}

module.exports = function init({alphabet, pointsQty, absMax, delayMax}) {
	const blocks = _.chain(alphabet)
		.sortBy(() => 0.5 - _.random(0.0, 1.0, true))
		.slice(0, generateShiftedRandom(_.size(alphabet)))
		.transform((blocks, key) => blocks[key] = initBlock({pointsQty, absMax, delayMax}), {})
		.value();

	function tick() {
		const time = Date.now();
		_.forEach(_.keys(blocks), key => {
			blocks[key].tick(time);
		});
	}

	function getBlocks() {
		return _.transform(blocks, (result, block, key) => {
			result[key] = {
				enabled: blocks[key].enabled,
				points: block.getValues()
			};
		}, {});
	}

	function getDelta(key, time) {
		if (!blocks[key]) throw new Error(`Unknown key ${key}.`);
		return {
			enabled: blocks[key].enabled,
			delta: blocks[key].getDelta(time)
		};
	}

	return {
		tick,
		getBlocks,
		getDelta
	};
};
