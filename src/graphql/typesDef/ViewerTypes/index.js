"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ViewerTypes = void 0;
const apollo_server_express_1 = require("apollo-server-express");
exports.ViewerTypes = apollo_server_express_1.gql `
    input LogInInput  {
        code: String!
    }

    type Viewer {
        id: ID
        name: String
        token: String
        avatar: String
        didRequest: Boolean!
        isAdmin: Boolean
        organization_id: String
        registering: Boolean
        # messages: [Message!]
    }
`;
