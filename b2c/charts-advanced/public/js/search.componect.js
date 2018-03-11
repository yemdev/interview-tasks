/* Search */
export class Search extends React.Component {

    render () {
        const onInpChange = this.props.onInpChange;
        
        return <div>
            <input onChange={onInpChange} className="search-inp" type="text" placeholder="Search" />
        </div>;
    }
}