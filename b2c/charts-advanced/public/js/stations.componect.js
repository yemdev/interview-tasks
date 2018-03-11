import { Station } from './station.componect.js';

/* Stations */
export class Stations extends React.Component {

    render () {
        const { stations, stationsKeys } = this.props;        
        
        return <div className="stations">
            {stationsKeys.map((key, index) => {
                return (
                    <Station key={index} data={stations[key]} />
                );
            })}
        </div>;
    }
}