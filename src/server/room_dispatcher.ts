export class RoomDispatcher {
    private static roomList: Set<string> = new Set();

    public static registerRoom(roomName: string): void {
        if (this.roomList.has(roomName)) throw new Error(`Room "${roomName}" already exists.`);
        this.roomList.add(roomName);
    }
}
