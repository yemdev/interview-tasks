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
            stationsKeys: []
        };

        this.initClient();
    }

    getRndNum (min = 0, max = 1) {
        return Math.floor(Math.random() * (max+1)) + min;
    }

    getRndColor () {
        let colors = ['#607d8b', '#795548', '#9e9e9e', '#ff9800', '#4caf50', '#009688', '#00bcd4', '#03a9f4', '#673ab7', '#3f51b5', '#2196f3', '#9c27b0', '#e91e63', '#f44336'];
        return colors[this.getRndNum(0, colors.length-1)];
    }

    preprocess (data) {
        let stationsKeys = Object.keys(data.stations);

        stationsKeys.forEach(key => {
            let station = data.stations[key];

            station.name = key;
            station.serieColor = this.getRndColor();
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

    render () {
        
        // Loading... view
        if (!this.state.inited) { // @TODO - FINISH IT
            return <div>Loading...</div>
        }

        // App view
        else {
            return <div className="main-viewport">
            
                {/* Toolbar */}
                <div className="toolbar">
                    <Search />
                    <Filter />
                    <Refresh onRefresh={this.reInitClient.bind(this)} />
                </div>
            
                {/* Stations */}
                <Stations stations={this.stations} stationsKeys={this.state.stationsKeys} />
            </div>;
        }
    }
}

// Init App`
ReactDOM.render(<App />, document.getElementById('root'));