import { Injectable, ReflectiveInjector } from '@angular/core';
import { Subject, Observable } from 'rxjs';
// import * as io from 'socket.io-client';
import io from 'socket.io-client';

@Injectable()
export class SocketService {
    private url = 'http://xxx.xxx.xxx.xxx:portNumber';
    public socket;

    sockConnection: any = {};
    Rooms        = [];

    constructor() {}

    init (url) {
        this.url = url;

        this.socket = io(this.url);
    }

    Emit(...args: any[]) {
        if (args.length === 2) {
            this.socket.emit(args[0], args[1]);
        } else if (args.length === 3) {
            this.socket.emit(args[0], args[1], args[2]);
        } else {
            this.socket.emit(args[0], args[1], args[2], args[3]);
        }
    }

    EmitCallback (callback: Function, ...args: any[]) {
        if (args.length === 1) {
            this.socket.emit(args[0], function(obj) {
                callback(obj);
            });
        } else if (args.length === 2) {
            this.socket.emit(args[0], args[1], function(obj) {
                callback(obj);
            });
        } else if (args.length === 3) {
            this.socket.emit(args[0], args[1], args[2], function(obj) {
                callback(obj);
            });
        } else {
            this.socket.emit(args[0], args[1], args[2], args[3], function(obj) {
                callback(obj);
            });
        }
    }

    removeAllListener (eventName, callback) {
        this.socket.removeAllListeners(eventName, function() {
            const args = arguments;
        });
    }

    removeListener (connection, callback?) {
        const sConn = this.sockConnection[connection];
        if (typeof sConn === 'undefined') {
            return;
        }

        if (typeof sConn.length !== 'undefined' && sConn.length > 0) {
            for (let i = 0; i < sConn.length; i++) {
                sConn[i].unsubscribe();
            }
            this.sockConnection[connection] = [];
        }
        if (typeof callback === 'function') {
            callback();
        }

    }

    On (key) { // 두개의 인자값을 받아서 하나의 object로 결합하워 callback
        const observable = new Observable(observer => {
            this.socket.on(key, (...arg: any[]) => {
                observer.next(arg);
            });
            return () => { // unsubscribe 시 socket자체가 disconnect되는 것을 방지하기 위해 아래는 주석 처리한다.
                // this.socket.disconnect();
            };
        });
        return observable;
    }

    setLogin () {
        const socket_login: any = {}; // 이곳에 현재 보는 그래프의 기본 정보도 전달
        this.EmitCallback(function(obj) {
        }, 'login', socket_login); // 로그인 정보를 node에 전달한다.
    }

    joinRoom (room) {
        this.Rooms.push(room);
        this.Emit('joinRoom', {room: room});
    }

    leaveRoom () {
        for (let i = 0; i < this.Rooms.length; i++) {
            const room = this.Rooms[i];
            this.Emit('leave_curent_room', room);
        }

        this.Rooms = [];
    }
}
