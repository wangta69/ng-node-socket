"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var Observable_1 = require("rxjs/Observable");
var io = require("socket.io-client");
var SocketService = (function () {
    function SocketService() {
        //private url = 'http://182.162.136.223:3001';
        this.url = 'http://182.162.136.223:50000';
        /**
        * 이후 다른 것들도 이곳에서 chattab을 관리한다.
        * publicChat : 공개 채팅방 관련 socket 처리
        * chanceTalkView : 찬스톡 상세 보기
        chatRoom: 채팅룸 리스트
        */
        this.sockConnection = { publicChat: [], chanceTalkView: [], chatRoom: [], chatRoomView: [] };
        this.Rooms = []; //일부 방(chancetalk, chatRoom)들은 랜덤 명이기 때문에 이곳에 저장해 두었다가 일괄적으로 방을 떠난다.
        this.init();
    }
    SocketService.prototype.init = function () {
        var _this = this;
        this.socket = io(this.url);
        this.On('connection').subscribe(function (obj) {
            var my_data = obj;
            _this.setLogin();
        });
    };
    SocketService.prototype.setLogin = function () {
        var socket_login = {}; //이곳에 현재 보는 그래프의 기본 정보도 전달
        this.Emit('login', socket_login, function (obj) {
            //console.log(obj);
        }); //로그인 정보를 node에 전달한다.
    };
    //	sendMessage(message){
    //		this.this.socketService.Emit('add-message', message);
    //	}
    /**
    * 모든 emit은 이곳에서 처리한다.
    */
    /*
    Emit(key, obj?){
        if(typeof obj == 'undefined')
            this.socket.emit(key);
        else
            this.socket.emit(key, obj);
    }
    */
    SocketService.prototype.Emit = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        if (args.length == 2)
            this.socket.emit(args[0], args[1]);
        else if (args.length == 3)
            this.socket.emit(args[0], args[1], args[2]);
        else
            this.socket.emit(args[0], args[1], args[2], args[3]);
    };
    SocketService.prototype.removeAllListener = function (eventName, callback) {
        this.socket.removeAllListeners(eventName, function () {
            var args = arguments;
        });
    };
    SocketService.prototype.removeListener = function (connection, callback) {
        //	return;
        var sConn;
        eval('sConn = this.sockConnection.' + connection);
        if (typeof sConn == 'undefined')
            return;
        if (typeof sConn.length != 'undefined' && sConn.length > 0) {
            for (var i = 0; i < sConn.length; i++) {
                sConn[i].unsubscribe();
            }
            eval('this.sockConnection.' + connection + '=[]');
            //sConn = [];
        }
        if (typeof callback == 'function')
            callback();
    };
    SocketService.prototype.addRoom = function (room) {
        this.Rooms.push(room);
        this.Emit("add_page", { page: room });
    };
    SocketService.prototype.leaveRoom = function () {
        for (var i = 0; i < this.Rooms.length; i++) {
            var room = this.Rooms[i];
            this.Emit("leave_curent_room", room);
        }
        this.Rooms = [];
    };
    /*
        On(key) {//하나의 인자값을 받는다.
            let observable = new Observable(observer => {
                this.socket.on(key, (data) => {
                    observer.next(data);
                });
                return () => {//unsubscribe 시 socket자체가 disconnect되는 것을 방지하기 위해 아래는 주석 처리한다.
                    //this.socket.disconnect();
                };
            })
            return observable;
        }
    */
    SocketService.prototype.On = function (key) {
        var _this = this;
        var observable = new Observable_1.Observable(function (observer) {
            _this.socket.on(key, function () {
                var arg = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    arg[_i] = arguments[_i];
                }
                observer.next(arg);
            });
            return function () {
                // this.socket.disconnect();
            };
        });
        return observable;
    };
    SocketService = __decorate([
        core_1.Injectable(),
        __metadata("design:paramtypes", [])
    ], SocketService);
    return SocketService;
}());
exports.SocketService = SocketService;
