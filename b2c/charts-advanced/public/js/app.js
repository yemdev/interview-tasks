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
            search: ''
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
            stationsKeys: stationsKeys
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

    render () {
        
        // Loading... view
        if (!this.state.inited) { // @TODO - FINISH IT
            return <div>Loading...</div>
        }

        // App view
        else {

            let stationsKeys = !!this.state.search ? this.state.stationsKeys.filter(key => {
                let match = this.state.search != '' ? !!key.toLowerCase().match(this.state.search.toLowerCase()) : true;
                return match;
            }) : this.state.stationsKeys;

            let stations = stationsKeys.map(i => this.stations[i]);

            return <div className="main-viewport">
            
                {/* Toolbar */}
                <div className="toolbar">
                    <Search onInpChange={this.search.bind(this)} />
                    <Filter />
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