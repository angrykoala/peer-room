import express from 'express';
import { Server } from 'http';
import { SocketStreamRoom } from '../main';
import path from 'path';
import { Peer } from '../src/peer';

const app = express();
const server = new Server(app)

const streamRoom = new SocketStreamRoom(server);

streamRoom.on('connection', (peer: Peer) => {
    console.log("Peer connected", peer.id)
    streamRoom.registerPeer(peer)
})

app.use(express.static(path.join(__dirname, 'dist')));

server.listen(1222, () => {
    console.log("Listening at 1222");
});
