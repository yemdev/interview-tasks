/* Filter */
export class Filter extends React.Component {
    render () {
        return <div id="filter" className="filter">
            <span>Filter Stations</span>
            <div className="drop-down">
                <div>
                    <span>Name</span>
                    <input id="xID" type="checkbox" />
                </div>
            </div>
        </div>;
    }
}