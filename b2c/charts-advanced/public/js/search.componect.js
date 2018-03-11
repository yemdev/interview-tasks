/* Search */
export class Search extends React.Component {

    doSearch (e) {
        let searchTerm = e.target.value;

        // ... Get stations list and filter them or ???
        
    }

    render () {
        return <div>
            <input onChange={this.doSearch.bind(this)} id="search-inp" className="search-inp" type="text" placeholder="Search" />
        </div>;
    }
}