import { ClientPeer } from "../src/cli/client_peer";
import { SocketStremClient } from "../src/cli/cli";

const connectButton = document.querySelector('#connectButton') as HTMLButtonElement;

connectButton.addEventListener("click", () => {
    connectButton.disabled = true;
    connect();
});

async function connect(): Promise<void> {
    const videoList = document.querySelector('#videos')!;

    const socketStreamClient = new SocketStremClient({
        location: document.location.host,
    });

    socketStreamClient.connect();
    socketStreamClient.on('peer-connected', (peer: ClientPeer) => {
        console.log("PEEER CONNECTED");
        let video: HTMLVideoElement;
        peer.on('stream', (stream) => {
            console.log('stream', stream);
            video = document.createElement('video');
            video.srcObject = stream;
            videoList.appendChild(video);
            video.play();
        });

        peer.on('disconnect', () => {
            console.log("Disconnect peer");
            if (video) {
                video.remove();
            }
        });

    });
}
