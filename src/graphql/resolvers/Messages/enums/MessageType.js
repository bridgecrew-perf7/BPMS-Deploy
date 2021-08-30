"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientMessageAction = exports.MessageType = exports.ServerMessageAction = void 0;
var ServerMessageAction;
(function (ServerMessageAction) {
    ServerMessageAction["REQUEST"] = "REQUEST";
    ServerMessageAction["APPROVE"] = "APPROVE";
    ServerMessageAction["DECLINE"] = "DECLINE";
    ServerMessageAction["DELETE"] = "DELETE";
})(ServerMessageAction = exports.ServerMessageAction || (exports.ServerMessageAction = {}));
var MessageType;
(function (MessageType) {
    MessageType["TRANSFER"] = "TRANSFER";
    MessageType["REGISTER"] = "REGISTER";
})(MessageType = exports.MessageType || (exports.MessageType = {}));
var ClientMessageAction;
(function (ClientMessageAction) {
    ClientMessageAction["APPROVE_DECLINE"] = "APPROVE_DECLINE";
    ClientMessageAction["INFO"] = "INFO";
})(ClientMessageAction = exports.ClientMessageAction || (exports.ClientMessageAction = {}));
