import { SocketStremClient } from '../cli';
import { ClientPeer } from '../src/cli/client_peer';

async function main() {
    const videoConstrains = [800, 600];
    // const videoComponent = document.querySelector('video')!;

    const stream = await navigator.mediaDevices.getUserMedia({
        video: {
            width: { max: videoConstrains[0] },
            height: { max: videoConstrains[1] },
            facingMode: "user"
        },
        audio: false
    });
    // videoComponent.srcObject = stream;

    const socketStreamClient = new SocketStremClient({
        location: document.location.host,
    })


    await socketStreamClient.connect();
    socketStreamClient.on('peer-connected', (peer: ClientPeer) => {
        console.log("PEER CONNECTED")
        peer.stream(stream);
    })
}

main();
