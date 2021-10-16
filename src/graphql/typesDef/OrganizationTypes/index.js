"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrganizationTypes = void 0;
const apollo_server_express_1 = require("apollo-server-express");
exports.OrganizationTypes = apollo_server_express_1.gql `
    type Organization {
        _id : String!
        name: String!
        address: String
        phone: String
    }
    type OrganizationData {
        total : Int!
        results : [Organization]!
    }
    input OrganizationInput {
        name: String
        address: String
        phone: String
    }
`;
