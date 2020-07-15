# socket-stream
WebRTC + Sockets for a lovely P2P

> Warning: under heavy development, this will go kaboom 💥


* Peer roles
* Rooms support
* Server-side network configuration and security
* P2P stream support


## Getting started

* `npm run examples` to run examples on http://localhost:1222

The following example connects multiple peers and sends a video stream

```js
const io = require('socket.io')(httpServer); // Here goes your express or http server

const SocketStream = require('socket-stream');

const socketStreamRoom = new SocketStream(io);

socketStreamRoom.on('connection', (peerCandidate) => {
    socketStreamRoom.registerPeer(peerCandidate);
});


httpServer.listen(3000);
```
_server.js_


```js
const stream = await navigator.mediaDevices.getUserMedia({
    audio: false
});

const socketStreamClient = new SocketStremClient();

socketStreamClient.connect();
socketStreamClient.on('peer-connected', (peer) => {
    console.log("Peer connected");
    peer.stream(stream); // Send stream to connected peer
    peer.on('stream', (peerStream) => {
      // attach remote stream to html video
    });
});
```
_client.js_

## Roles


## Rooms

## STUN and TURN


### Coturn

## SocketStore <to do>
* Data synced among certain roles (blackboard)
