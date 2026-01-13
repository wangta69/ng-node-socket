// src/lib/mSocket.service.ts

import { Injectable, NgZone } from "@angular/core";
import { Observable } from "rxjs";
import { io, Socket, ManagerOptions, SocketOptions } from "socket.io-client";

@Injectable({
  providedIn: "root",
})
export class SocketMultiService {
  // any 대신 명시적인 Socket 타입 사용
  private sockets: { [name: string]: Socket } = {};

  // Angular의 화면 갱신을 보장하기 위해 NgZone 주입
  constructor(private ngZone: NgZone) {}

  /**
   * 소켓 초기화
   * @param name 식별할 소켓 이름 (예: 'chat', 'notification')
   * @param url 접속 URL
   * @param opts Socket.io 옵션 (auth token, transports 등 설정 가능)
   */
  public init(
    name: string,
    url: string,
    opts?: Partial<ManagerOptions & SocketOptions>
  ): void {
    // 이미 존재하는 경우 연결을 끊고 새로 생성하거나, 기존 것을 리턴하는 정책을 정할 수 있음.
    // 여기서는 덮어쓰기 전 기존 연결이 있다면 끊어주는 안전 장치 추가
    if (this.sockets[name]) {
      this.sockets[name].disconnect();
    }

    this.sockets[name] = io(url, opts);
  }

  /**
   * 이벤트 전송
   * @param name 소켓 이름
   * @param eventName 이벤트 키
   * @param args 전송할 데이터
   */
  public Emit(name: string, eventName: string, ...args: any[]): void {
    if (this.sockets[name]) {
      this.sockets[name].emit(eventName, ...args);
    } else {
      console.warn(`[SocketMultiService] Socket '${name}' does not exist.`);
    }
  }

  /**
   * 이벤트 수신 (Observable)
   * @param name 소켓 이름
   * @param key 이벤트 키
   * @returns Observable<T>
   */
  public On<T = any>(name: string, key: string): Observable<T> {
    return new Observable<T>((observer) => {
      const socket = this.sockets[name];

      if (!socket) {
        observer.error(
          `[SocketMultiService] Socket '${name}' not initialized.`
        );
        return;
      }

      // 리스너 함수 정의
      const listener = (...args: any[]) => {
        // Socket.io 이벤트는 Angular Zone 밖에서 발생하므로
        // 화면 갱신을 위해 ngZone.run 안에서 실행
        this.ngZone.run(() => {
          // 인자가 여러 개일 경우 배열로, 하나일 경우 값으로 처리 (필요에 따라 조정 가능)
          if (args.length === 1) {
            observer.next(args[0]);
          } else {
            observer.next(args as any);
          }
        });
      };

      socket.on(key, listener);

      // Observable unsubscribe 시 이벤트 리스너 제거 (메모리 누수 방지)
      return () => {
        socket.off(key, listener);
      };
    });
  }

  /**
   * 소켓 존재 여부 확인
   * @param name 소켓 이름
   */
  public isSet(name: string): boolean {
    return !!this.sockets[name];
  }

  /**
   * 특정 소켓 연결 해제
   * @param name 소켓 이름
   */
  public disconnect(name: string): void {
    if (this.sockets[name]) {
      this.sockets[name].disconnect();
      delete this.sockets[name]; // 목록에서 제거
    }
  }

  /**
   * 모든 소켓 연결 해제 (앱 종료 시 등 사용)
   */
  public disconnectAll(): void {
    for (const name in this.sockets) {
      if (this.sockets.hasOwnProperty(name)) {
        this.sockets[name].disconnect();
      }
    }
    this.sockets = {};
  }

  /**
   * 특정 소켓 인스턴스 가져오기 (직접 제어 필요 시)
   */
  public getSocket(name: string): Socket | undefined {
    return this.sockets[name];
  }
}
