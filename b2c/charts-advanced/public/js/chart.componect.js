import * as socket from './websocket.js';

/* Chart */
export class Chart extends React.Component {

    constructor (props) {
        super(props);

        this.points = [];
        this.online = true;
        this.time = props.time;
        
        // Subscribe for socket events
        socket.on(`${props.name}_updated`, this.onDataUpdated.bind(this));
        socket.on(`${props.name}_offline`, this.onOffline.bind(this));
    }

    requestUpdate () {
        let delay = 100;

        setTimeout(() => {
            socket.send({
                event: 'request_for_updates',
                data: {
                    clientKey: this.props.clientKey,
                    stationName: this.props.name,
                    time: this.time
                }
            });
        }, delay);
    }

    onDataUpdated (data) {
        !this.online && (this.online = true);
        
        this.points.splice(0, data.delta.length);
        this.points = this.points.concat(data.delta);

        this.time = data.time;
        
        this.updateCanvas();
    }

    onOffline (data) {
        this.online = false;
        this.updateCanvas();
    }

    getXStepLength (xMax, margin, points) {
        return (xMax - margin) / points;
    }

    getYStepLength (yMax, margin, points) {
        return (yMax - margin) / points;
    }

    updateCanvas() {

        let canvas = this.refs.canvas;
        if (!canvas) {
            return;
        }

        let points = this.points;

        // Set canvas width and height
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;

        let ctx = canvas.getContext('2d');
        let width = canvas.width;
        let height = canvas.height;

        ctx.clearRect(0, 0, width, height);

        // Canvas Margin
        let margin = 48;

        // Base Coordinates
        let xMin = 0 + margin;
        let yMin = 0 + margin;
        
        let xMax = width - margin;
        let yMax = height - margin;
        
        let xMid = width / 2;
        let yMid = height / 2;

        let xStepLength = this.getXStepLength(xMax, margin, points.length);
        let yStepLength = this.getYStepLength(yMax, margin, points.length);

        let vLine = { fromX: xMin, fromY: yMin, toX: xMin, toY: yMax };
        let hMidLine = { fromX: xMin, fromY: yMid, toX: xMax, toY: yMid };
        let hLine = { fromX: xMin, fromY: yMax, toX: xMax, toY: yMax };
        let shortXStepLine = { fromX: xMin + xStepLength, fromY: yMax, toX: xMin + xStepLength, toY: yMax + 10 };
        let shortYStepLine = { fromX: xMin, fromY: yMin, toX: xMin - 10, toY: yMin };

        // Draw Station Name
        ctx.beginPath();
        ctx.font = '17px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(this.props.name, xMid, yMin - 24);
        ctx.stroke();

        // Station Offline
        if (!this.online) {
            ctx.beginPath();

            // Display Offline State Message
            ctx.font = '21px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('STATION IS NOW OFFLINE', xMid, yMid);
            ctx.stroke();
        
        // Station Online
        } else {
            // Draw Left Vertical Line
            this.drawLine(ctx, vLine.fromX, vLine.fromY , vLine.toX, vLine.toY);

            // Draw Middle Horisontal Line
            this.drawLine(ctx, hMidLine.fromX, hMidLine.fromY , hMidLine.toX, hMidLine.toY, 'gray', 0.5);

            // Draw Bottom Horisontal Line
            this.drawLine(ctx, hLine.fromX, hLine.fromY , hLine.toX, hLine.toY);

            // Draw X Axis Steps Lines
            for (let i = 0, l = this.points.length; i < l; i++) {
                this.drawLine(ctx, shortXStepLine.fromX, shortXStepLine.fromY , shortXStepLine.toX, shortXStepLine.toY, 'gray', 0.5);
                shortXStepLine.fromX += xStepLength;
                shortXStepLine.toX += xStepLength;
            }

            // Draw Y Axis Values
            for (let i = 0, l = this.points.length/4; i < l; i++) {
                this.drawLine(ctx, shortYStepLine.fromX, shortYStepLine.fromY , shortYStepLine.toX, shortYStepLine.toY, 'gray', 0.5);
                shortYStepLine.fromY += yStepLength*4;
                shortYStepLine.toY += yStepLength*4;
            }

            // Draw Serie
            let stepLine = { fromX: xMin, fromY: yMid, toX: xStepLength, toY: yMid };
            for (let i = 0, l = this.points.length; i < l; i++) {
                let point = this.points[i];
    
                // Define destination
                stepLine.toY = yMid - point;
                stepLine.toX = stepLine.fromX + xStepLength;
                
                this.drawLine(ctx, stepLine.fromX, stepLine.fromY, stepLine.toX, stepLine.toY, 'red', 0.7);
                
                // Increase Step
                stepLine.fromX += xStepLength;
                stepLine.fromY = stepLine.toY;
            }
        }

        this.requestUpdate();
    }

    drawLine (ctx, fromX, fromY, toX, toY, color, lineWidth) {
        ctx.beginPath();

        ctx.lineWidth = lineWidth || 2;
        ctx.strokeStyle = color || '#333';
        ctx.moveTo(fromX, fromY);
        ctx.lineTo(toX, toY);

        ctx.stroke();
    }

    componentDidMount() {
        this.points = this.props.points;
        this.points && this.updateCanvas();
    }

    componentWillUnmount () {
        // unSubscribe for socket events
        socket.off(`${this.props.name}_updated`);
        socket.off(`${this.props.name}_offline`);
    }

    render () {     
        return <div className="chart-container">
            <canvas ref="canvas" />
        </div>;
    }
}