/* Filter */
export class Filter extends React.Component {

    render () {
        let onStationToggle = this.props.onStationToggle;

        return <div id="filter" className="filter">
            <span>Filter Stations</span>
            
            <div className="drop-down">
                {this.props.stations.map(item => {
                    return (
                        <div key={item}>
                            <span>{item}</span>
                            <input type="checkbox" defaultChecked={true} onChange={e => onStationToggle(item, e.target.checked)} />
                        </div>
                    );
                })}
            </div>
        </div>;
    }
}