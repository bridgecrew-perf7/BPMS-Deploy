"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageTypes = void 0;
const apollo_server_express_1 = require("apollo-server-express");
exports.MessageTypes = apollo_server_express_1.gql `
    type Message {
        id: String
    }

    type ServerMessage {
        action: ClientMessageAction!
        type: MessageType!
        from_id: String!
        # to_id: String!
        from_organizationId : String!
        content: String!
    }

    input ClientMessage {
        action: ServerMessageAction!
        type: MessageType!
        from_id: String!
        to_id: String
        to_organizationId : String!
        content: String!
    }

    input ApprovalRequest {
        id: ID
        user_id: String
        avatar: String
        isAdmin: Boolean
        organization_id: String
        organization_name: String
        content: String!
    }

    type MessagesData {
        total : Int!
        results : [ServerMessage!]!
        avatars : [String!]!
    }

    type MessageUserInfo {
        email: String!
        userName: String!
        organizationName: String!
        memberName: String!
    }
`;
