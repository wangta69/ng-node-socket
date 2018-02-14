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
        this.url = 'http://xxx.xxx.xxx.xxx:portNumber';
        this.sockConnection = {};
        this.Rooms = [];
    }
    SocketService.prototype.init = function (url) {
        var _this = this;
        this.url = url;
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
    SocketService.prototype.EmitCallback = function (callback) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        if (args.length == 2)
            this.socket.emit(args[0], args[1], function (obj) {
                callback(obj);
            });
        else if (args.length == 3)
            this.socket.emit(args[0], args[1], args[2], function (obj) {
                callback(obj);
            });
        else
            this.socket.emit(args[0], args[1], args[2], args[3], function (obj) {
                callback(obj);
            });
    };
    SocketService.prototype.removeAllListener = function (eventName, callback) {
        this.socket.removeAllListeners(eventName, function () {
            var args = arguments;
        });
    };
    SocketService.prototype.removeListener = function (connection, callback) {
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
