"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatsTypes = void 0;
const apollo_server_express_1 = require("apollo-server-express");
exports.StatsTypes = apollo_server_express_1.gql `
    type GraphData {
        _id : String!, 
        value: Int!
    }

    type Stats {
        total: Int!
        totalMale : Int!
        totalFemale : Int!
        avgAge: Int!
        totalBusCard: Int!
        totalFWIT: Int!
        totalDisabilityCert: Int!
        totalICP: Int! #Is Communist partisan count
        totalHS: Int! #Health insurance count
        totalBMC: Int!
        totalMoreThan2Languages: Int!
        medianIncome: GraphData!
        maxOrganization: GraphData #Only return if it is admin
        minOrganization: GraphData #Only return if it is admin
        medianReligion: GraphData!
        medianEducation: GraphData!
        jobs: [GraphData!]!
        brailleData: [GraphData!]!
        #Add more from the blind requests
        educations: [GraphData!]!
        postEducations: [GraphData!]!
        politicalEducations: [GraphData!]!
        governLevels: [GraphData!]!
        languages: [GraphData!]!
        socialWorkLevels: [GraphData!]!
    }
`;
