# socket-stream
WebRTC + Sockets for a lovely P2P

> Warning: under heavy development, this will go kaboom 💥


* `npm run examples` to run examples in localhost:1222



> Warning: The following is a first design on how this is **intended** to work, not how this works currently
# Define topology of an use case
* **Rooms**
  * Every peer belongs to a room
* **Roles**
  * Every peer has one or more roles
  * Roles define who knows who (e.g. A streamer does not know about admins, but admin knows about everyone)

```js

const room = new SocketStreamRoom('name');

const adminRole=room.registerRole("admin"); // By default, admin does not connect to anything
const streamerRole=room.registerRole("streamer");
const viewerRole=room.registerRole("viewer", [streamerRole]); //Connect streamers and vieewers

viewerRole.connect(streamerRole) //Connect streamers and vieewers (same as before)

room.on('connect', (peerCandidate)=>{
    // Security goes here
   const peer=room.registerPeer(peerCandidate, [adminRole]); // Sets peer as admin
   if(whatever){
     peer.connectTo(anotherPeer) // Connects with a particular peer
     peer.connectTo("streamer") // Connects to all streamers
   }
})
```
_server.js_


```js
const connection= new SocketStream("url", {"myData": "data"})

connection.peers // up-to-date peers data
connection.role

connection.on('connect', (socket, role)=>{
  // Connected to server
})

connection.on('peer',(peer)=>{
  // New peer connection (simplePeer already handled)
  peer.on('stream',(stream)=>{
    // stream received
  })
  peer.on('msg',()=>{
    // socket msg
  })

  peer.socket.emit()//socket emit?
  peer.send() // p2p emit
  peer.stream(stream) // p2p send stream
})

```

_client.js_


## SocketStore
* Data synced among certain roles (blackboard)
