import { User } from "./UserManager";


class SocketManager {
    private rooms: Map<string, User[]>;

    private static instance: SocketManager;

    private constructor() {
        this.rooms = new Map();
    }

    public static getInstance() {
        if (!SocketManager.instance) {
            SocketManager.instance = new SocketManager();
        }
        return SocketManager.instance;
    }

    public getRoom(roomId: string) {
        return this.rooms.get(roomId);
    }

    public findRoomByUserId(userId: string) {
        for (const [roomId, users] of this.rooms) {
            if (users.find((u) => u.userId === userId)) {
                return roomId;
            }
        }
        return null;
    }

    public createRoom(roomId: string) {
        this.rooms.set(roomId, []);
    }

    public addUserToRoom(roomId: string, user: User) {
        const users = this.rooms.get(roomId);
        if (users) {
            user.socket.send(JSON.stringify({ type: "existing-users", users: users.map((u) => u.userId) }));
            users.push(user);
        }
    }

    public removeUserFromRoom(userId: string) {
        const roomId = this.findRoomByUserId(userId);
        if(!roomId) return;
        const users = this.rooms.get(roomId);
        if (users) {
            this.broadcastToRoom(roomId, { type: "user-left", userId });
            this.rooms.set(roomId, users.filter((u) => u.userId !== userId));
            console.log('User removed: ', userId);
            if (this.rooms.get(roomId)?.length === 0) {
                this.rooms.delete(roomId);
                console.log('Room deleted: ', roomId);
            }
        }
    }

    public broadcastToRoom(roomId: string, message: any) {
        const users = this.rooms.get(roomId);
        if (users) {
            users.forEach((u) => {
                u.socket.send(JSON.stringify(message));
            })
        }
    }   

}
export const socketManager = SocketManager.getInstance();