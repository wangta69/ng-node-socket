import { Observable } from 'rxjs/Observable';
export declare class SocketService {
    private url;
    socket: any;
    sockConnection: any;
    Rooms: any[];
    constructor();
    init(url: any): void;
    setLogin(): void;
    Emit(...args: any[]): void;
    EmitCallback(callback: Function, ...args: any[]): void;
    removeAllListener(eventName: any, callback: any): void;
    removeListener(connection: any, callback?: any): void;
    addRoom(room: any): void;
    leaveRoom(): void;
    On(key: any): Observable<{}>;
}
