import { Station } from './station.componect.js';
import { socket } from './websocket.js';

/* Stations */
export class Stations extends React.Component {
    
    render () {        
        return <div className="stations">
            {this.props.stations.map((item, index) => {
                return (
                    <Station key={item.name} name={item.name} data={item} />
                );
            })}
        </div>;
    }
}