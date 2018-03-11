import { Chart } from './chart.componect.js';

/* Station */
export class Station extends React.Component {

    render () {
        let { points, enabled, name, online } = this.props.data;
            
        return <div className="station">
            <Chart name={name} points={points} online={online} />
        </div>;
    }
}