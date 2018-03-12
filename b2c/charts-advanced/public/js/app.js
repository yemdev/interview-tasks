import { Search } from './search.componect.js';
import { Filter } from './filter.componect.js';
import { Refresh } from './refresh.componect.js';
import { Stations } from './stations.componect.js';
import * as socket from './websocket.js';

/* App */
class App extends React.Component {

    constructor () {
        super();

        this.stations = [];

        this.state = {
            inited: false,
            clientKey: null,
            stationsKeys: [],
            search: '',
            filter: ''
        };

        this.initClient();
    }

    preprocess (data) {
        let stationsKeys = Object.keys(data.stations);

        stationsKeys.forEach(key => {
            let station = data.stations[key];

            station.name = key;
            station.time = data.time;
            station.filterEnabled = true;
            station.visible = true;
            station.online = true;
            station.clientKey = data.clientKey;
        });
        
        return {
            stations: data.stations,
            stationsKeys: stationsKeys
        };
    }

    async initClient () {
        let data = await fetch('/api/v1/init')
            .then(response => response.json())
            .then(data => data);
        
        let { stations, stationsKeys } = this.preprocess(data);

        this.stations = stations;

        this.setState({
            inited: true,
            clientKey: data.clientKey,
            stationsKeys: stationsKeys,
            filter: stationsKeys.join(',')
        });
    }

    reInitClient () {
        this.destroyClient();
        this.initClient();
    }

    destroyClient () {
        this.setState({ 
            inited: false,
            clientKey: null,
            stationsKeys: [] 
        });
    }

    search (e) {
        let searchTerm = e.target.value;
        this.setState({search: searchTerm});
    }

    onStationToggle (name, value) {
        let filter = this.state.filter.split(',');

        // On
        if (value) {
            !filter.includes(name) && filter.push(name);
        }

        // Off
        else {
            filter.forEach((itemName, i, arr) => itemName === name && arr.splice(i, 1));
        }

        this.setState({ filter: filter.join(',') });
    }

    render () {
        
        // Loading... view
        if (!this.state.inited) { // @TODO - ALIGN IT
            return <div>Loading...</div>
        }

        // App view
        else {

            let filter = this.state.filter.split(',');

            let stationsKeys = this.state.stationsKeys.filter(i => {
                let res = true;

                // off filter
                if (!filter.includes(i)) res = false;

                // Search filter
                if (!!this.state.search) {
                    res = this.state.search != '' ? !!key.toLowerCase().match(this.state.search.toLowerCase()) : true;
                }

                return res;
            });

            let stations = stationsKeys.map(i => this.stations[i]);

            return <div className="main-viewport">
            
                {/* Toolbar */}
                <div className="toolbar">
                    <Search onInpChange={this.search.bind(this)} />
                    <Filter stations={this.state.stationsKeys} onStationToggle={this.onStationToggle.bind(this)} />
                    <Refresh onRefresh={this.reInitClient.bind(this)} />
                </div>
            
                {/* Stations */}
                <Stations stations={stations} />
            </div>;
        }
    }
}

// Init App`
ReactDOM.render(<App />, document.getElementById('root'));