import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import io from 'socket.io-client';

@Injectable()
export class SocketService {
    private url = 'http://xxx.xxx.xxx.xxx:portNumber';
    private Socket: any;

    private onSubscribes: any = {}; //
    private Rooms = [];

    constructor() {}

    public init(url: string): void {
        this.url = url;
        this.Socket = io(this.url);
    }

    /**
     * @param Object obj {key: value}
     * this.SocketonSubscribes = this.Socket.On('myOn').subscribe(data => {...
     */
    public setOnSubscribes(group: string, key: string, observable: any): void {
        if (!this.onSubscribes[group]) {
            this.onSubscribes[group] = {};
        }

        this.onSubscribes[group][key] = observable;
    }

    get socket(): any {
        return this.Socket;
    }

    public Emit(...args: any[]): void {
        if (args.length === 2) {
            this.Socket.emit(args[0], args[1]);
        } else if (args.length === 3) {
            this.Socket.emit(args[0], args[1], args[2]);
        } else {
            this.Socket.emit(args[0], args[1], args[2], args[3]);
        }
    }

    public EmitCallback(callback: (body: any) => void, ...args: any[]): void {
        if (args.length === 1) {
            this.Socket.emit(args[0], (obj: any) => {
                callback(obj);
            });
        } else if (args.length === 2) {
            this.Socket.emit(args[0], args[1], (obj: any) => {
                callback(obj);
            });
        } else if (args.length === 3) {
            this.Socket.emit(args[0], args[1], args[2], (obj: any) =>  {
                callback(obj);
            });
        } else {
            this.Socket.emit(args[0], args[1], args[2], args[3], (obj: any) => {
                callback(obj);
            });
        }
    }

    public removeAllListener(eventName: string): void {
        this.Socket.removeAllListeners(eventName, () => {
            // const args = arguments;
        });
    }

    /**
     * remove On subscribe involved in a certain group
     */
    public removeListeners(subscribes: any, callback?: (body: any) => void): void {
        const sConn = this.onSubscribes[subscribes];
        if (typeof sConn === 'undefined') {
            if (typeof callback === 'function') {
                callback(true);
            }
        }

        for (const entry in sConn) {
            if (sConn.hasOwnProperty(entry)) {
                sConn[entry].unsubscribe();
            }
        }

        if (typeof callback === 'function') {
            callback(true);
        }
    }

    public On(key: string): any { // 두개의 인자값을 받아서 하나의 object로 결합하워 callback
        const observable = new Observable((observer) => {
            this.Socket.on(key, (...arg: any[]) => {
                observer.next(arg);
            });
            return () => { // unsubscribe 시 socket자체가 disconnect되는 것을 방지하기 위해 아래는 주석 처리한다.
                // this.Socket.disconnect();
            };
        });
        return observable;
    }

    public receive(grp: string, key: string): any { // 두개의 인자값을 받아서 하나의 object로 결합하워 callback
        const observable = new Observable((observer) => {
            this.Socket.on(key, (...arg: any[]) => {
                observer.next(arg);
            });
            return () => { // unsubscribe 시 socket자체가 disconnect되는 것을 방지하기 위해 아래는 주석 처리한다.
                // this.Socket.disconnect();
            };
        });
        this.setOnSubscribes (grp, key, observable);
        return observable;
    }

    public disconnect(): void {
        this.Socket.disconnect();
    }

    public setLogin(): void {
        const socketLogin: any = {};
        this.EmitCallback(() => {
        }, 'login', socketLogin); // 로그인 정보를 node에 전달한다.
    }

    public joinRoom(room: string): void {
        this.Rooms.push(room);
        this.Emit('joinRoom', {room});
    }

    public leaveRoom(): void {
        for (const room of this.Rooms) {
            this.Emit('leave_curent_room', room);
        }

        this.Rooms = [];
    }
}
