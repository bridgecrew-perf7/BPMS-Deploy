"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnumTypes = void 0;
const apollo_server_express_1 = require("apollo-server-express");
exports.EnumTypes = apollo_server_express_1.gql `
    enum ServerMessageAction {
        #Client will send this to the server
        #Client wiil CONTROL server action
        #Controlled by handleMessage from Client
        REQUEST
        APPROVE
        DECLINE
        DELETE
    }

    enum MessageType {
        #Server will handle this differently, can be combine with message action
        TRANSFER
        REGISTER
    }

    enum ClientMessageAction {
        #Server now wiil CONTROL client action
        #Load message send this info to client, and client will handle
        APPROVE_DECLINE
        INFO
    }

`;
