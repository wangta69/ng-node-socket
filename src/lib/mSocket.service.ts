import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import io from 'socket.io-client';

@Injectable()
export class SocketMultiService {
    private sockets: any = {}; // {socketName: io}
    constructor() {}

    /**
     * @param String name socketname
     * @param String url 'http://xxx.xxx.xxx.xxx:portNumber';
     */
    public init(name: string, url: string): void {
        this.sockets[name] = io(url);
    }

    public Emit(name: string, ...args: any[]): void {
        this.sockets[name].emit.apply(this.sockets[name], args);
    }

    /**
     * @param String name: socketName;
     * @param String key;
     */
    public On(name: string, key: string): any { // 두개의 인자값을 받아서 하나의 object로 결합하워 callback
        const observable = new Observable((observer) => {
            this.sockets[name].on(key, (...arg: any[]) => {
                observer.next(arg);
            });
            return () => { // unsubscribe 시 _socket자체가 disconnect되는 것을 방지하기 위해 아래는 주석 처리한다.
                // this._socket.disconnect();
            };
        });
        return observable;
    }
    /**
     * @param name: socketName;
     */
    public isSet(name: string): boolean {
        return this.sockets[name] ? true : false;
    }
}
