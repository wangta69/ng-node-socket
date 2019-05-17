import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
// import * as io from 'socket.io-client';
import io from 'socket.io-client';

@Injectable()
export class SocketMultiService {
    private _sockets: any = {}; // {socketName: io}
    constructor() {}

    /**
     *@param name String socketname
     *@param url String 'http://xxx.xxx.xxx.xxx:portNumber';
     */
    init(name: string, url: string) {
        this._sockets[name] = io(url);
    }

    Emit(name: string, ...args: any[]) {
        this._sockets[name].emit.apply(this._sockets[name], args);
    }

    /**
     *@param name: socketName;
     *@param key;
    */
    On(name: string, key: string) { // 두개의 인자값을 받아서 하나의 object로 결합하워 callback
        const observable = new Observable(observer => {
            this._sockets[name].on(key, (...arg: any[]) => {
                observer.next(arg);
            });
            return () => { // unsubscribe 시 _socket자체가 disconnect되는 것을 방지하기 위해 아래는 주석 처리한다.
                // this._socket.disconnect();
            };
        });
        return observable;
    }
    /**
     *@param name: socketName;
    */
    isSet(name: string) {
        return this._sockets[name] ? true : false;
    }
}
