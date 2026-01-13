// src/lib/socket.service.ts

import { Injectable, NgZone } from "@angular/core"; // NgZone 추가
import { Observable, BehaviorSubject } from "rxjs";
import { io, Socket, ManagerOptions, SocketOptions } from "socket.io-client";

// 연결 상태 타입 정의
export enum SocketConnectionState {
  DISCONNECTED = "DISCONNECTED",
  CONNECTING = "CONNECTING",
  CONNECTED = "CONNECTED",
  CONNECT_ERROR = "CONNECT_ERROR",
  RECONNECTING = "RECONNECTING",
}

@Injectable({
  providedIn: "root",
})
export class SocketService {
  private url: string = "";
  private Socket!: Socket;

  // 3. 연결 상태 모니터링을 위한 Subject
  public connectionState$ = new BehaviorSubject<SocketConnectionState>(
    SocketConnectionState.DISCONNECTED
  );

  private onSubscribes: any = {};
  private Rooms: string[] = [];

  // 1. NgZone 주입
  constructor(private ngZone: NgZone) {}

  /**
   * 2. 옵션 지원 추가 (opts)
   * 예: { auth: { token: 'abc' }, query: { id: 1 } }
   */
  public init(
    url: string,
    opts?: Partial<ManagerOptions & SocketOptions>
  ): void {
    this.url = url;
    this.connectionState$.next(SocketConnectionState.CONNECTING);

    // 옵션 적용
    this.Socket = io(this.url, opts);

    // 기본 연결 이벤트 리스너 등록
    this.registerSystemEvents();
  }

  // 시스템 이벤트 등록 (연결 상태 관리)
  private registerSystemEvents() {
    this.Socket.on("connect", () => {
      this.ngZone.run(() =>
        this.connectionState$.next(SocketConnectionState.CONNECTED)
      );
    });

    this.Socket.on("disconnect", () => {
      this.ngZone.run(() =>
        this.connectionState$.next(SocketConnectionState.DISCONNECTED)
      );
    });

    this.Socket.on("connect_error", (err) => {
      console.error("Socket Connect Error:", err);
      this.ngZone.run(() =>
        this.connectionState$.next(SocketConnectionState.CONNECT_ERROR)
      );
    });

    // 재연결 시도 중
    this.Socket.io.on("reconnect_attempt", () => {
      this.ngZone.run(() =>
        this.connectionState$.next(SocketConnectionState.RECONNECTING)
      );
    });
  }

  get socket(): Socket {
    return this.Socket;
  }

  public Emit(eventName: string, ...args: any[]): void {
    if (this.Socket) {
      this.Socket.emit(eventName, ...args);
    }
  }

  public EmitCallback(callback: (body: any) => void, ...args: any[]): void {
    if (this.Socket) {
      // 콜백도 Zone 안에서 실행되도록 감싸주는 것이 안전함
      this.Socket.emit(args[0], ...args.slice(1), (obj: any) => {
        this.ngZone.run(() => callback(obj));
      });
    }
  }

  /**
   * 4. 제네릭(Generic) 적용 및 1. NgZone.run() 적용
   */
  public On<T = any>(key: string): Observable<T> {
    return new Observable<T>((observer) => {
      this.Socket.on(key, (data: T) => {
        // Socket.io 이벤트는 Angular Zone 밖에서 발생하므로
        // 화면 갱신을 위해 ngZone.run 안에서 실행해야 함.
        this.ngZone.run(() => {
          observer.next(data);
        });
      });

      // Observable이 unsubscribe 될 때 리스너 제거
      return () => {
        if (this.Socket) {
          this.Socket.off(key);
        }
      };
    });
  }

  // 기존 로직 유지하되 NgZone 적용
  public receive(grp: string, key: string): Observable<any> {
    const observable = new Observable((observer) => {
      this.Socket.on(key, (...arg: any[]) => {
        this.ngZone.run(() => {
          observer.next(arg);
        });
      });
      return () => {
        // teardown logic
      };
    });
    this.setOnSubscribes(grp, key, observable);
    return observable;
  }

  // ... 나머지 메서드들 (setOnSubscribes, removeListeners, joinRoom 등)은 기존 유지 ...

  public setOnSubscribes(group: string, key: string, observable: any): void {
    if (!this.onSubscribes[group]) {
      this.onSubscribes[group] = {};
    }
    this.onSubscribes[group][key] = observable;
  }

  public removeListeners(
    subscribes: any,
    callback?: (body: any) => void
  ): void {
    // ... 기존 코드 동일 ...
    const sConn = this.onSubscribes[subscribes];
    if (typeof sConn === "undefined") {
      if (typeof callback === "function") callback(true);
      return;
    }
    for (const entry in sConn) {
      if (sConn.hasOwnProperty(entry)) {
        sConn[entry].unsubscribe();
      }
    }
    if (typeof callback === "function") callback(true);
  }

  public disconnect(): void {
    if (this.Socket) {
      this.Socket.disconnect();
    }
  }

  public joinRoom(room: string): void {
    this.Rooms.push(room);
    this.Emit("joinRoom", { room });
  }

  public leaveRoom(): void {
    for (const room of this.Rooms) {
      this.Emit("leave_curent_room", room);
    }
    this.Rooms = [];
  }
}
