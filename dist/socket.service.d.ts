import { Observable } from 'rxjs/Observable';
export declare class SocketService {
    private url;
    socket: any;
    /**
    * 이후 다른 것들도 이곳에서 chattab을 관리한다.
    * publicChat : 공개 채팅방 관련 socket 처리
    * chanceTalkView : 찬스톡 상세 보기
    chatRoom: 채팅룸 리스트
    */
    sockConnection: any;
    Rooms: any[];
    me: any;
    constructor();
    init(): void;
    setLogin(): void;
    /**
    * 모든 emit은 이곳에서 처리한다.
    */
    Emit(...args: any[]): void;
    removeAllListener(eventName: any, callback: any): void;
    removeListener(connection: any, callback?: any): void;
    addRoom(room: any): void;
    leaveRoom(): void;
    On(key: any): Observable<{}>;
}
