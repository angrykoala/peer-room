import { ClientPeer } from "../src/cli/client_peer";
import { SocketStremClient } from "../src/cli/cli";

const connectButton = document.querySelector('#connectButton') as HTMLButtonElement;
const buzzButton = document.querySelector('#buzzButton') as HTMLButtonElement;

connectButton.addEventListener("click", () => {
    connectButton.disabled = true;
    connect();
});

async function connect(): Promise<void> {
    const videoList = document.querySelector('#videos')!;
    const videoConstrains = [800, 600];

    const stream = await navigator.mediaDevices.getUserMedia({
        video: {
            width: { max: videoConstrains[0] },
            height: { max: videoConstrains[1] },
            facingMode: "user"
        },
        audio: false
    });

    (window as any).userStream = stream;

    buzzButton.disabled = false;

    const socketStreamClient = new SocketStremClient();

    socketStreamClient.connect();
    socketStreamClient.on('ready', () => {
        buzzButton.addEventListener("click", () => {
            socketStreamClient.send('buzz'); // Sends to server
        });

        socketStreamClient.onMessage('buzz', () => {
            console.log("Buzzed");
        });
    });
    socketStreamClient.on('peer-connected', (peer: ClientPeer) => {
        console.log("Peer connected");
        peer.sendData("Hello :3"); // Sends using p2p connection
        let video: HTMLVideoElement;

        peer.stream(stream);
        peer.on('stream', (peerStream) => {
            if (video) console.warn("VIDEO EXISTS!!");
            video = document.createElement('video');
            video.srcObject = peerStream;
            videoList.appendChild(video);
            video.play();
        });

        peer.on('disconnect', () => {
            console.log("On disconnect");
            if (video) {
                video.remove();
            }
        });
    });
}
