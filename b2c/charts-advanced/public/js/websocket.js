let socket = new WebSocket("ws://127.0.0.1:8080/");

const SOCKET_EVENTS = {
    data_updated: 'data_updated',
    state_offline: 'state_offline'
};

let subscribers = {};

function send (data) {
    socket.send(JSON.stringify(data));
}

function on (eventName, handler = () => {}) {

    subscribers[eventName] && this.off(eventName);

    subscribers[eventName] = {
        triggerHandler: handler
    }
}

function off (eventName) {
    subscribers[eventName] && (subscribers[eventName] = undefined);
}

socket.onmessage = event => {
    let e = JSON.parse(event.data);
    let eventName = e.event;
    let data = e.data || null;
    let message = e.message || null;

    // on Data Updated
    if (eventName === SOCKET_EVENTS.data_updated && subscribers[data.stationName + '_updated']) {
        subscribers[data.stationName + '_updated'].triggerHandler(data);
    }

    // on Offline
    else if (eventName === SOCKET_EVENTS.state_offline && subscribers[data.stationName + '_offline']) {
        subscribers[data.stationName + '_offline'].triggerHandler(data);
    }
};

export { send, on, off };