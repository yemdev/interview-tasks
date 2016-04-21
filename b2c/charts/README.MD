# Charts

## Server
Already implemented, see `server.js` (Node.js used as a platform). Initially generates an array (one-dimensional) of random integer numbers. Every X milliseconds the first element of the array is shifted away and the new random integer number is pushed to the end of the array. There is also a HTTP-server running, which is responsible for:

- serving static [client] content from the `public` directory;
- responding to `/api/v1/config` HTTP GET request, which returns the basic configuration of the chart (see server's `CONFIG`)
- responding to `/api/v1/points` HTTP GET request, which returns the contents of the array, described above;

To run the server, type `node ./server` inside the project directory. After that, you could access the web-server from your browser by typing `http://localhost:3000/` to the address bar (feel free to change the port inside the server source code to any other value you like).

## Client
This part should be implemented by you (you can put markup to `public/index.html` and code to `public/client.js`, but it is completely up to you). Initially, the client should retrieve the server config (see `/api/v1/config` above). After that, every X milliseconds the client should receive the data (one-dimensional array) from the server (see `/api/v1/points` above). Received data should be drawn on a canvas of an arbitrary size in a format of a graph, where the value of a point is represented by an Y-axis (and scaled accordingly around the center horizontal line of the canvas) and the point sequential number is represented by an X-axis. Points should be connected by lines in the order of a sequence. See a screenshot as an example (canvas size / colors might be chosen arbitrary):

![Chart example](https://raw.githubusercontent.com/HexagonTech/interview-tasks/master/img/charts.png)

You can use any JS framework/libraries you are familiar with.

## Bonus task
As an optional bonus task, modify the server so it will maintain N different arrays, each of which should be available to the client via different HTTP-request (this might sound strange and ineffective, but let’s pretend that we’re modelling some external API here, which we don't have access to). Client should make requests in an arbitrary order and display/redraw N different graphs accordingly. On each update cycle redrawing should be performed only after all HTTP-requests have finished.
