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
exports.memberResolvers = void 0;
const utils_1 = require("../../../lib/utils");
exports.memberResolvers = {
    Query: {
        members: (_root, { organizationId, limit, page, input }, { db }) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                let initialInput = {
                    keyword: undefined,
                    filter: undefined,
                };
                const data = {
                    total: 0,
                    results: []
                };
                if (input) {
                    initialInput = input;
                }
                const { filter, keyword } = initialInput;
                let membersQuery = {};
                let aggQuery = [];
                //Must have search before everything, rule from mongo
                if (keyword && keyword !== "") { //or input...
                    aggQuery = [
                        {
                            $search: {
                                index: 'default',
                                text: {
                                    query: keyword,
                                    path: {
                                        'wildcard': '*'
                                    }
                                }
                            }
                        }
                    ];
                }
                if (organizationId && organizationId !== "") {
                    membersQuery = Object.assign(Object.assign({}, membersQuery), { organization_id: organizationId });
                }
                if (filter) {
                    membersQuery = Object.assign(Object.assign({}, membersQuery), filter);
                }
                if (membersQuery !== {}) { //If no member query exists, add it to the aggQuery
                    aggQuery = [...aggQuery,
                        {
                            '$match': membersQuery
                        },
                    ];
                }
                const agg = [
                    ...aggQuery,
                    {
                        '$sort': { 'isTransferring': 1, 'firstName': 1 }
                    },
                    {
                        $facet: {
                            results: [{
                                    $skip: page > 0 ? (page - 1) * limit : 0
                                }, {
                                    $limit: limit
                                }],
                            totalCount: [{
                                    $count: 'count'
                                }]
                        }
                    },
                    {
                        $unwind: {
                            path: "$totalCount"
                        }
                    },
                ];
                const cursor = yield db.members.aggregate(agg).next();
                data.total = cursor.totalCount["count"];
                data.results = cursor.results;
                return data;
            }
            catch (err) {
                // Error is mostly because cannot read the totalCount when there
                // is no data
                // throw new Error(`Failed to query members ${err}`);
                return {
                    total: 0,
                    results: []
                };
            }
        }),
        member: (_root, { organizationId, id }, { db }) => __awaiter(void 0, void 0, void 0, function* () {
            const memberQuery = {};
            if (organizationId) {
                memberQuery["organization_id"] = organizationId;
            }
            memberQuery["_id"] = `${id}`;
            const member = db.members.findOne(memberQuery);
            return member;
        }),
    },
    Mutation: {
        upsertMember: (_root, args, { db }) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                //On both case, we need to create new hash and set it to the _id field
                const newHash = utils_1.createHashFromUser(args.new);
                args.new["_id"] = newHash;
                //If old is provided, delete it to update a new _id
                let insertRes = undefined;
                if (args.old) {
                    const oldHash = utils_1.createHashFromUser(args.old);
                    const deleteRes = yield db.members.deleteOne({ _id: oldHash });
                    if (deleteRes.result.n == 1) {
                        insertRes = yield db.members.insertOne(args.new);
                        return "true";
                    }
                    else {
                        return "Cannot delete before insert. May be due to wrong hash";
                    }
                }
                const user = yield db.members.findOne({ _id: args.new["_id"] });
                if (!user) {
                    insertRes = yield db.members.insertOne(args.new);
                    return insertRes.result.n == 1 ? "true" : "cannot insert user";
                }
                else {
                    return "Duplicate user";
                }
            }
            catch (e) {
                throw e;
            }
        }),
        deleteMember: (_root, { memberId }, { db }) => __awaiter(void 0, void 0, void 0, function* () {
            const deleteRes = yield db.members.deleteOne({ _id: memberId });
            return deleteRes ? deleteRes.result.n == 1 : false;
        })
    },
    Member: {
        //Have to write sub-resolver for id because it's orginally id_
        id: member => member._id
    }
};
