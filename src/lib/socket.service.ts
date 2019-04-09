import { Injectable, ReflectiveInjector } from '@angular/core';
import { Subject, Observable } from 'rxjs';
// import * as io from 'socket.io-client';
import io from 'socket.io-client';

@Injectable()
export class SocketService {
    private url = 'http://xxx.xxx.xxx.xxx:portNumber';
    private _socket: any;

    _onSubscribes: any = {}; //
    Rooms = [];

    constructor() {}

    init (url: string) {
        this.url = url;
        this._socket = io(this.url);
    }

    /**
    *@param Object obj {key: value}
    // this.socketonSubscribes = this.socket.On('myOn').subscribe(data => {...
    */
    setOnSubscribes (group: string, key: string, observable: any) {
        if (!this._onSubscribes[group]) {
            this._onSubscribes[group] = {};
        }

        this._onSubscribes[group][key] = observable;
    }


    get socket () {
        return this._socket;
    }


    Emit(...args: any[]) {
        if (args.length === 2) {
            this._socket.emit(args[0], args[1]);
        } else if (args.length === 3) {
            this._socket.emit(args[0], args[1], args[2]);
        } else {
            this._socket.emit(args[0], args[1], args[2], args[3]);
        }
    }

    EmitCallback (callback: Function, ...args: any[]) {
        if (args.length === 1) {
            this._socket.emit(args[0], (obj: any) => {
                callback(obj);
            });
        } else if (args.length === 2) {
            this._socket.emit(args[0], args[1], (obj: any) => {
                callback(obj);
            });
        } else if (args.length === 3) {
            this._socket.emit(args[0], args[1], args[2], (obj: any) =>  {
                callback(obj);
            });
        } else {
            this._socket.emit(args[0], args[1], args[2], args[3], (obj: any) => {
                callback(obj);
            });
        }
    }

    removeAllListener (eventName: string) {
        this._socket.removeAllListeners(eventName, () => {
            // const args = arguments;
        });
    }

    /**
    * remove On subscribe involved in a certain group
    */
    removeListeners (subscribes: any, callback?: (body: any) => void) {
        console.log('removeListeners');
        console.log('subscribes:' + subscribes);
        const sConn = this._onSubscribes[subscribes];
        console.log('sConn');
        if (typeof sConn === 'undefined') {
            if (typeof callback === 'function') {
                callback(true);
            }
            return;
        }
        // console.log(sConn);

        for (const entry in sConn) {
        //    console.log(entry); // 1, "string", false
            if (sConn.hasOwnProperty(entry)) {
                sConn[entry].unsubscribe();
            }
        }

/*
        if (typeof sConn.length !== 'undefined' && sConn.length > 0) {
            for (let i = 0; i < sConn.length; i++) {
                sConn[i].unsubscribe();
            }

        }
        */
        if (typeof callback === 'function') {
            callback(true);
        }

    }

    On (key: string) { // 두개의 인자값을 받아서 하나의 object로 결합하워 callback
        const observable = new Observable(observer => {
            this._socket.on(key, (...arg: any[]) => {
                observer.next(arg);
            });
            return () => { // unsubscribe 시 _socket자체가 disconnect되는 것을 방지하기 위해 아래는 주석 처리한다.
                // this._socket.disconnect();
            };
        });
        return observable;
    }

    receive (grp: string, key: string) { // 두개의 인자값을 받아서 하나의 object로 결합하워 callback
        const observable = new Observable(observer => {
            this._socket.on(key, (...arg: any[]) => {
                observer.next(arg);
            });
            return () => { // unsubscribe 시 _socket자체가 disconnect되는 것을 방지하기 위해 아래는 주석 처리한다.
                // this._socket.disconnect();
            };
        });
        this.setOnSubscribes (grp, key, observable);
        return observable;
    }

    disconnect () {
        this._socket.disconnect();
    }

    setLogin () {
        const socket_login: any = {}; // 이곳에 현재 보는 그래프의 기본 정보도 전달
        this.EmitCallback(() => {
        }, 'login', socket_login); // 로그인 정보를 node에 전달한다.
    }

    joinRoom (room: string) {
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
