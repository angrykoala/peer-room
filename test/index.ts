import { SocketStremClient } from '../cli';
import { ClientPeer } from '../src/cli/client_peer';

async function main() {
    const videoList = document.querySelector('#videos')!
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
        // stream: stream
    })


    await socketStreamClient.connect();
    socketStreamClient.on('peer-connected', (peer: ClientPeer) => {
        console.log("PEEER CONNECTED")
        peer.stream(stream);
        let video: HTMLVideoElement;
        peer.on('stream', () => {
            console.log('stream', stream)
            video = document.createElement('video')
            video.srcObject = stream
            videoList.appendChild(video);
            video.play()
        })

        peer.on('disconnect', () => {
            console.log("Disconnect peer")
            if (video) {
                video.remove()
            }
        })

    })
}

main();
