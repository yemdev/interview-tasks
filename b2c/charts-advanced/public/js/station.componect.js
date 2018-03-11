import { Chart } from './chart.componect.js';

/* Station */
export class Station extends React.Component {

    render () {
        let { name, points, enabled } = this.props.data;
            
        return <div className="station">
            <Chart name={name} points={points} enabled={enabled} />
        </div>;
    }
}