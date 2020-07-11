import { Socket } from 'socket.io';

export type SerializedPeer = {
    id: string
};

export class Peer {
    private socket: Socket;
    private rolesSet: Set<string> = new Set();

    constructor(socket: Socket) {
        this.socket = socket;
    }

    public get id(): string {
        return this.socket.id;
    }

    public get roles(): Array<string> {
        return Array.from(this.getRoleSet());
    }

    public addRole(...roles: Array<string>): void {
        for (const role of roles) {
            this.rolesSet.add(role);
        }
    }

    public hasRole(role: string): boolean {
        return this.getRoleSet().has(role);
    }

    public disconnect(): void {
        this.socket.disconnect(true);
    }

    public emit(event: string, data?: any): void {
        this.socket.emit(event, data);
    }

    public serialize(): SerializedPeer {
        return {
            id: this.id
        };
    }

    private getRoleSet(): Set<string> {
        if (this.rolesSet.size === 0) return new Set(["default"]);
        else return this.rolesSet;
    }
}
