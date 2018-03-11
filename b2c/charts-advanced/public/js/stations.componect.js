import { Station } from './station.componect.js';
import { socket } from './websocket.js';

/* Stations */
export class Stations extends React.Component {
    
    render () {        
        return <div className="stations">
            {this.props.stationsKeys.map((key, index) => {
                return (
                    <Station key={index} name={key} data={this.props.stations[key]} />
                );
            })}
        </div>;
    }
}