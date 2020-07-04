import express from 'express';
import { Server } from 'http';
import path from 'path';
import { SocketStreamRoom } from '../src/server/server';
import { Peer } from '../src/server/peer';

const app = express();
const server = new Server(app);

const streamRoom = new SocketStreamRoom(server);

streamRoom.on('connection', (peer: Peer) => {
    console.log("Peer connected", peer.id);
    streamRoom.registerPeer(peer);
});

app.use(express.static(path.join(__dirname, 'dist')));

server.listen(1222, () => {
    console.log("Listening at 1222");
});
