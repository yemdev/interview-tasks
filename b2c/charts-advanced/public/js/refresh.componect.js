/* Refresh */
export class Refresh extends React.Component {

    render () {
        const onRefresh = this.props.onRefresh;
        
        return <div>
            <img id="init-btn" onClick={onRefresh} className="re-init-client-btn" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAQAAABKfvVzAAAAwUlEQVR4Aa3QMWoCQRjH0deEVQg5g3VAN0QPKFilUgiym9t4C5EQ0niIXQL7pbBJ2K/YAd+0/x/MjHvZls6jdB6l89C7aNTTg9sZtGbTksraXiec8oSn5NFLV6GRePVtkXzrSm/I3vIh7GQOwtHIp/AisxHORn6EB5m50BnphUqmEnojF2FdcqVG2Mu8Ce9GaoPOMvnYhS/PEq1wtQLEn+RRauYkdA425uJfgjxpDeJ2piXUjs666QGgdK50ztZ9/AKaRlprB9qp9gAAAABJRU5ErkJggg==" />
        </div>;
    }
}