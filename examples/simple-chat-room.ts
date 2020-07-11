import { ClientPeer } from "../src/cli/client_peer";
import { SocketStremClient } from "../src/cli/cli";

const connectButton = document.querySelector('#connectButton') as HTMLButtonElement;

connectButton.addEventListener("click", () => {
    connectButton.disabled = true;
    connect();
});

async function connect(): Promise<void> {
    const videoList = document.querySelector('#videos')!;
    const myVideo = document.querySelector('#my-video') as HTMLVideoElement;
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
    // const stream = await (navigator.mediaDevices as any).getDisplayMedia();

    // myVideo.srcObject = stream;
    // myVideo.play();

    const socketStreamClient = new SocketStremClient({
        location: document.location.host,
    });

    socketStreamClient.connect();
    socketStreamClient.on('peer-connected', (peer: ClientPeer) => {
        console.log("Peer connected");
        // peer.sendData("This is a test"); // This only works after properly connected
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
