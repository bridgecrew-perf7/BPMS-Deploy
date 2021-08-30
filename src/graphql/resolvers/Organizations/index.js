"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.organizationResovers = void 0;
exports.organizationResovers = {
    Query: {
        //This one is only for admin
        organizations: (_root, {}, { db }) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                const data = {
                    total: 0,
                    results: []
                };
                const cursor = yield db.organizations.find({});
                cursor.sort({
                    _id: 1
                });
                const total = cursor.count();
                const results = cursor.toArray();
                data.total = total;
                data.results = results;
                return data;
            }
            catch (e) {
                throw e;
            }
        }),
        organization: (_root, { organizationId }, { db }) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                const data = yield db.organizations.findOne({ _id: organizationId });
                return data;
            }
            catch (e) {
                throw e;
            }
        })
    },
    Mutation: {
        updateOrganization: (_root, { organizationId, input }, { db }) => __awaiter(void 0, void 0, void 0, function* () {
            //When update this, all organization id in members, user,
            //orgtanization 
            //But we don't change the _id, so it will be fine
            try {
                const updateRes = yield db.organizations.updateOne({ _id: organizationId }, { $set: input });
                return updateRes.result.n == 1;
            }
            catch (e) {
                throw e;
            }
        })
    },
    Organization: {
    //Trivial resolvers provide help for this, no need to add thing
    }
};
