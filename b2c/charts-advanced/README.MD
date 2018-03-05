# Charts (advanced)

Start with forking `https://github.com/HexagonTech/interview-tasks.git` project
and cloning your fork locally. You will be only working with `b2c/charts-advanced`
subdirectory during this task.

Server side is already implemented, see `server.js` (Node.js used as a platform).
It serves a temperature data from several interplanetary stations named after Greek alphabet
letters. As a client connects to the server, only a subset of stations will be able to send
temperature data (due to high interplanetary bandwidth costs). Client should receive the
initial data by sending HTTP GET request to `/api/v1/init`, which will result in the following
response (just an example):
```
{
    "clientKey": "9e9df8c9a2ff69586a42df11e4b2de32",
    "time": 1520251655505,
    "stations": {
        "Psi": {
            "enabled": true,
            "points": [50, 25, -5, ...]
        },
        "Tau": {
             "enabled": true,
             "points": [...]
        },
        ...
    }
}
```
Client should store `clientKey` for further requests; `time` holds the server's timestamp of the last request;
`stations` contains hashmap of station info per station name. Client's top interest is the array of `points`.
These should be drawn on a canvas (one per station) of an arbitrary size in a format of a linear graph, where
the value of a point is represented by an Y-axis (and scaled accordingly around the center horizontal line of
the canvas) and the point sequential number is represented by an X-axis. See this (quite ugly, to be honest)
screenshot as an example (canvas size / colors might be chosen arbitrary; please make sure it looks at least
a bit better than this piece of art):

![Chart example](https://raw.githubusercontent.com/HexagonTech/interview-tasks/master/img/charts.png)

Each chart should have a station name next to it. Client should have a convenient way to filter the list of
stations' graphs by name and to sort it by name and highest/lowest temperature.

Unfortunately, server was developed by two teams with quite different views on architectural solutions, so
the client could only receive aggregated data once, in the very first request. To get updates from each station,
client should send periodical requests per station. Very inconvenient, but this is a world we code in.
Format of such request is: `/api/v1/client/<clientKey>/delta/<stationName>/since/<time>`. `clientKey` is the key,
received by a client during `/api/v1/init` request; `stationName` is a station name ("Psi" or "Tau" from the previous
example); `time` is the server's timestamp of a previous request for a particular station (or the timestamp from the
`/api/v1/init` result, if this is the first "delta" call). Example of a result for this call:
```
{
    "time": 1520252973650,
    "enabled": true,
    "delta": [81]
}
```
Again, `time` is the server's timestamp for the current call; `delta` is an array of newly arrived temperature values
(there might be more than one; or nothing if station haven't sent the data yet); `enabled` (here and in `init` request)
is the boolean flag which shows whether the station currently online. Yes, sometimes they go off. Client should represent
this with an arbitrary indicator (something like a large red letters saying "STATION IS NOW OFFLINE" will do). Stations
have auto-repair facilities: most of them should be back on in no time, so pay attention. As the new temperature points
arrive, client should maintain the size of a graphs and throw the old points away (who needs statistics anyway).

Please pay attention that all stations provide updates with a different rates (although with a constant rate per station).
So, you might choose to poll all stations with a smallest possible interval (which is, according to server teams, is 100ms),
or you go all fancy: dynamically determine the update rate for each station and use it.

There is also no preliminary information on the temperature boundaries, as the data is quite dynamic; so you will most
probably need to dynamically adjust graphs to scale according to data (again, per station).

Also, server sometimes returns an errors, so please deal with those as well.

One more thing: if client won't send "delta" requests for more than 5 seconds, it will be disconnected (`clientKey` will
no longer be valid). All the money, saved from the traffic of disconnected clients, will be spent to increase this time.

Server serves static contents from a `public` subdirectory, so you could put the client html/js/css there. Client should be
implemented using React library.

## Bonus task
As both server teams already left the team (and Solar system), it would be good if some good Samaritan adjusted the server
in a way so it would use some modern technologies so client will no longer be forced to send a whole bunch of requests
all the time.
