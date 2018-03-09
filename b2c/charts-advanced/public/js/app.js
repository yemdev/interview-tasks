(() => {

    let dataSource = {};
    let clientKey = null;

    // DOM Links
    let initBtn = document.querySelector('#init-btn');
    let graphsContainer = document.querySelector('#graphs-container');
    let filterDropDownContainer = document.querySelector('#filter .drop-down');
    let searchInp = document.querySelector('#search-inp');

    let selectedStation = null;
    let delay = 100;

    let colors = ['#607d8b', '#795548', '#9e9e9e', '#ff9800', '#4caf50', '#009688', '#00bcd4', '#03a9f4', '#673ab7', '#3f51b5', '#2196f3', '#9c27b0', '#e91e63', '#f44336'];

    let stationsFilter = {};

    /**
     * Get Random
     */
    function getRndNum (min = 0, max = 1) {
        return Math.floor(Math.random() * (max+1)) + min;
    }

    /**
     * Get Random Color
     */
    function getRandomColor (colors = []) {
        return colors[getRndNum(0, colors.length-1)];
    }
    /**
     * Get X Axis Step Length
     */
    function getXStepLength (station) {
        return (station.canvas.xMax - station.canvas.margin) / station.points.length;
    }

    /**
     * Draw Line
     */
    function drawLine (station, fromX, fromY, toX, toY, color, lineWidth) {
        station.canvas.ctx.beginPath();

        station.canvas.ctx.lineWidth = lineWidth || 2;
        station.canvas.ctx.strokeStyle = color || '#333';
        station.canvas.ctx.moveTo(fromX, fromY);
        station.canvas.ctx.lineTo(toX, toY);

        station.canvas.ctx.stroke();
    }
    
    /**
     * Draw Serie
     */
    function drawSerie (station) {

        let stepLength = getXStepLength(station);
        let stepLine = { fromX: station.canvas.xMin, fromY: station.canvas.yMid, toX: 0, toY: station.canvas.yMid };

        for (let i = 0, l = station.points.length; i < l; i++) {
            let point = station.points[i];

            // Define destination
            stepLine.toY = station.canvas.yMid - point;
            stepLine.toX = stepLine.fromX + stepLength;
            
            drawLine(station, stepLine.fromX, stepLine.fromY, stepLine.toX, stepLine.toY, station.canvas.color, 0.7);
            
            // Increase Step
            stepLine.fromX += stepLength;
            stepLine.fromY = stepLine.toY;
        }
    }

    /**
     * Draw Chart Viewport
     */
    function drawChartViewport (station) {

        let stationsNames = Object.keys(dataSource.stations);
        let points = station.points;
        let stepLength = getXStepLength(station);

        let { xMin, yMin, xMid, yMid, xMax, yMax, ctx, name } = station.canvas;

        let vLine = { fromX: xMin, fromY: yMin, toX: xMin, toY: yMax };
        let hMidLine = { fromX: xMin, fromY: yMid, toX: xMax, toY: yMid };
        let hLine = { fromX: xMin, fromY: yMax, toX: xMax, toY: yMax };
        let shortStepLine = { fromX: xMin + stepLength, fromY: yMax, toX: xMin + stepLength, toY: yMax + 10 };

        // Draw Station Name
        ctx.beginPath();
        ctx.font = '17px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(name, xMid, yMin - 24);
        ctx.stroke();

        // Station Disabled
        if (!station.enabled) {
            ctx.beginPath();
            // Display Offline State Message
            ctx.font = '21px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('STATION IS NOW OFFLINE', xMid, yMid);
            ctx.stroke();
        
        // Station Enabled
        } else {
            // Draw Left Vertical Line
            drawLine(station, vLine.fromX, vLine.fromY , vLine.toX, vLine.toY);

            // Draw Middle Horisontal Line
            drawLine(station, hMidLine.fromX, hMidLine.fromY , hMidLine.toX, hMidLine.toY, 'gray', 0.5);

            // Draw Bottom Horisontal Line
            drawLine(station, hLine.fromX, hLine.fromY , hLine.toX, hLine.toY);

            // Draw X Axis Steps Lines
            for (let i = 0, l = points.length; i < l; i++) {
                drawLine(station, shortStepLine.fromX, shortStepLine.fromY , shortStepLine.toX, shortStepLine.toY, 'gray', 0.5);
                shortStepLine.fromX += stepLength;
                shortStepLine.toX += stepLength;
            }

            // Draw Y Axis Values

        }
    }

    /**
     * Clear Canvas
     */
    function clearCanvas (station) {
        station.canvas.ctx.clearRect(0, 0, station.canvas.width, station.canvas.height);
    }

    /**
     * Start Timer
     */
    function startTimer (station) {
        if (station.filterEnabled) {
            station.canvas.timer = setTimeout(() => {
                updateStationData(station);
            }, delay);
        } else {
            stopTimer(station);
        }
    }

    /**
     * Stop Timer
     */
    function stopTimer (station) {
        station.canvas.timer && clearTimeout(station.canvas.timer);
        station.canvas.timer = null;
    }

    /**
     * Draw Station Chart
     */
    function drawChart (station) {
        
        // Stop Timer
        stopTimer(station);

        clearCanvas(station);
        
        drawChartViewport(station);
        if (station.enabled) {
            drawSerie(station);
        }

        // Start timer
        startTimer(station);
    }

    /**
     * Update Station Data
     */
    async function updateStationData (station) {
        let msgs = {
            offline: 'Will be back after lunch.'
        };

        let data = await fetch(`/api/v1/client/${clientKey}/delta/${station.canvas.name}/since/${station.time}`)
                .then(response => response.ok ? response.json() : response.text())
                .then(data => data)
                .catch(err => err.message);
        
        // Display Stattion Offline State
        if (data === msgs.offline) {
            station.enabled = false;
        }
                
        // Update Points
        else if (!data.error && data.time && data.delta) {
            station.enabled = true;
            
            station.time = data.time;
            station.points.splice(0, data.delta.length);
            station.points = station.points.concat(data.delta);
        }

        // Redraw
        drawChart(station);
    }

    /**
     * Init Stations
     */
    function initStations () {

        let graphHtml = '';
        let filterHtml = '';

        let prefix = '-station';
        let checkboxPrefix = '-toggle';
        let stationsKeys = Object.keys(dataSource.stations);

        for (let i = 0, l = stationsKeys.length; i < l; i++) {
            let key = stationsKeys[i];
            let id = key+prefix;
            let checkboxId = id + checkboxPrefix;
 
            dataSource.stations[key].time = dataSource.time;
            dataSource.stations[key].enabled = true;
            dataSource.stations[key].filterEnabled = true;
            dataSource.stations[key].visible = true;

            graphHtml += `<canvas id="${id}" width="750px" height="300px"></canvas>`;
            filterHtml += `
                <div>
                    <span>${key}</span>
                    <input id="${checkboxId}" data-station-name="${key}" type="checkbox" checked>
                </div>`;
             }

        graphsContainer.innerHTML = graphHtml;
        filterDropDownContainer.innerHTML = filterHtml;
            
        filterDropDownContainer.querySelectorAll('input').forEach(el => {
            el.addEventListener('change', e => filterStation(e.target.dataset.stationName, e.target.checked)); 
        });

        stationsKeys.forEach(key => initCanvas(key, prefix));
    }

    /**
     * Init Canvas
     */
    function initCanvas (key, prefix) {

        let id = key+prefix;
        let canvas = document.querySelector(`#${id}`);
        let width = canvas.width;
        let height = canvas.height;

        // Canvas Context
        let ctx = canvas.getContext("2d");

        // Canvas Margin
        let margin = 48;

        // Base Coordinates
        let xMin = 0 + margin;
        let yMin = 0 + margin;
        
        let xMax = width - margin;
        let yMax = height - margin;
        
        let xMid = width / 2;
        let yMid = height / 2;

        // Extend station with canvas context
        dataSource.stations[key].canvas = {
            name: key,
            color: getRandomColor(colors),

            width: width,
            height: height,
            margin: margin,
            
            xMin: xMin,
            yMin: yMin,

            xMax: xMax,
            yMax: yMax,

            xMid: xMid,
            yMid: yMid,

            canvas: canvas,
            ctx: ctx,
            timer: null
        };

        // Draw Chart
        drawChart(dataSource.stations[key]);
    }

    /**
     * Filter Station
     */
    function filterStation (stationName, value) {
        let station = dataSource.stations[stationName];
        station.filterEnabled = value;

        value ? startTimer(station) : stopTimer(station);
        document.querySelector(`#${stationName}-station`).setAttribute('enabled', value);
    }

    /**
     * Search
     */
    function search (value) {
        let stationsKeys = Object.keys(dataSource.stations);

        for (let i = 0, l = stationsKeys.length; i < l; i++) {
            
            let key = stationsKeys[i];
            if (!dataSource.stations[key].filterEnabled) continue;
            
            let isMatch = value != '' ? !!key.toLowerCase().match(value.toLowerCase()) : true;

            dataSource.stations[key].visible = isMatch;
            dataSource.stations[key].canvas.canvas.setAttribute('visible', isMatch);
        }
    }

    /**
     * Init Client
     */
    async function initClient () {

        let cientData = await fetch('/api/v1/init')
            .then(response => response.json())
            .then(cientData => cientData);
        
        clientKey = cientData.clientKey;
        dataSource = cientData;

        // Init Stations
        initStations();
    }

    // DOM Events
    initBtn.addEventListener('click', initClient);
    searchInp.addEventListener('keyup', e => search(e.target.value));

    // Init
    initClient();
})();