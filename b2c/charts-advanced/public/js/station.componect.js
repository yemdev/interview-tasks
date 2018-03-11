import { Chart } from './chart.componect.js';

/* Station */
export class Station extends React.Component {
    
    render () {
        let { points, enabled, name, online, time, clientKey } = this.props.data || {};
            
        return <div className="station">
            <Chart name={name} points={points} online={online} time={time} clientKey={clientKey} />
        </div>;
    }
}