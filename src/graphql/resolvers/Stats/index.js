"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.statsResovers = void 0;
const Enum = __importStar(require("../../../lib/enum"));
exports.statsResovers = {
    Query: {
        getOrganizationsStats: (_root, { organizationId }, { db }) => __awaiter(void 0, void 0, void 0, function* () {
            const MAX_ORGANIZATIONS = 1000; //If reached this, I will make a query to count the organizations
            let matchOrganization = {
                "$match": {
                    _id: {
                        $exists: true
                    }
                }
            }; //This is only for match everything
            let queryOrganization = {};
            if (organizationId) {
                matchOrganization =
                    {
                        "$match": {
                            //@ts-expect-error This one is intentional
                            organization_id: organizationId,
                        }
                    };
                //Only add filter if there is organization Id
                queryOrganization = {
                    organization_id: organizationId
                };
            }
            const defaultGraphData = { _id: "", value: 0 };
            const data = {
                //Int return -> For total sth
                total: 0,
                totalMale: 0,
                totalFemale: 0,
                avgAge: 0,
                totalBusCard: 0,
                totalFWIT: 0,
                totalDisabilityCert: 0,
                totalICP: 0,
                totalHS: 0,
                totalBMC: 0,
                totalMoreThan2Languages: 0,
                //Int return with label -> For data that has a label
                medianIncome: defaultGraphData,
                maxOrganization: defaultGraphData,
                minOrganization: defaultGraphData,
                medianReligion: defaultGraphData,
                medianEducation: defaultGraphData,
                //List of int return with labels -> for drawing graphs
                jobs: [defaultGraphData],
                brailleData: [defaultGraphData],
                educations: [defaultGraphData],
                postEducations: [defaultGraphData],
                politicalEducations: [defaultGraphData],
                governLevels: [defaultGraphData],
                socialWorkLevels: [defaultGraphData],
                languages: [defaultGraphData]
            };
            //======================= Int return ===============================
            const total = yield db.members.find(queryOrganization).count();
            if (total === 0) { //If there is no data
                return data;
            }
            data.totalMale = (yield db.members.countDocuments(Object.assign(Object.assign({}, queryOrganization), { "gender": Enum.Gender.Nam }))) || 0;
            data.totalFemale = (yield db.members.countDocuments(Object.assign(Object.assign({}, queryOrganization), { "gender": Enum.Gender.Nữ }))) || 0;
            data.total = data.totalFemale + data.totalMale;
            //Get ave age
            const aveYearObj = yield db.members.aggregate([
                matchOrganization,
                {
                    "$group": {
                        "_id": null,
                        "avgAge": {
                            "$avg": "$birthYear"
                        }
                    }
                }
            ]).next();
            // (Sum(current year - birth year)) / N = currentyear - sum(birthYear)/N
            data.avgAge = +(new Date().getFullYear() - aveYearObj.avgAge).toFixed(0);
            data.totalBusCard = yield db.members.countDocuments(Object.assign(Object.assign({}, queryOrganization), { "busCard": true }));
            data.totalFWIT = yield db.members.countDocuments(Object.assign(Object.assign({}, queryOrganization), { "familiarWIT": true }));
            data.totalDisabilityCert = yield db.members.countDocuments(Object.assign(Object.assign({}, queryOrganization), { "disabilityCert": true }));
            data.totalICP = yield db.members.countDocuments(Object.assign(Object.assign({}, queryOrganization), { "isCommunistPartisan": true }));
            data.totalHS = yield db.members.countDocuments(Object.assign(Object.assign({}, queryOrganization), { "healthInsuranceCard": true }));
            data.totalBMC = yield db.members.countDocuments(Object.assign(Object.assign({}, queryOrganization), { "blindManageCert": true }));
            //======================= Label + Int return ===============================
            const maxQueryByGroup = (field, limit = 1) => {
                const arr = [
                    matchOrganization,
                    {
                        $group: {
                            _id: `$${field}`,
                            value: { $sum: 1 }
                        }
                    },
                    {
                        $sort: {
                            value: -1
                        }
                    },
                    {
                        $limit: limit
                    }
                ];
                return arr;
            };
            //Do this for safety
            const minQueryByGroup = (field, limit = 1) => {
                const arr = [
                    matchOrganization,
                    {
                        $group: {
                            _id: `$${field}`,
                            value: { $sum: 1 }
                        }
                    },
                    {
                        $sort: {
                            value: 1
                        }
                    },
                    {
                        $limit: limit
                    }
                ];
                return arr;
            };
            data.medianIncome = yield db.members.aggregate(maxQueryByGroup("incomeType")).next();
            data.medianReligion = yield db.members.aggregate(maxQueryByGroup("religion")).next();
            data.medianEducation = yield db.members.aggregate(maxQueryByGroup("education")).next();
            data.maxOrganization = yield db.members.aggregate(maxQueryByGroup("organization_id", MAX_ORGANIZATIONS)).next();
            data.minOrganization = yield db.members.aggregate(minQueryByGroup("organization_id", MAX_ORGANIZATIONS)).next();
            //Get the name of the organizaiton
            const maxOrganization = yield db.organizations.findOne({ _id: data.maxOrganization._id });
            const minOrganization = yield db.organizations.findOne({ _id: data.minOrganization._id });
            data.maxOrganization = Object.assign(Object.assign({}, data.maxOrganization), { _id: maxOrganization.name });
            data.minOrganization = Object.assign(Object.assign({}, data.minOrganization), { _id: minOrganization.name });
            const languagesData = yield db.members.aggregate([
                matchOrganization,
                {
                    $group: {
                        _id: { $size: "$languages" },
                        count: { $sum: 1 }
                    }
                },
                {
                    $match: {
                        _id: { $gte: 2 },
                    }
                },
                {
                    $group: {
                        _id: null,
                        total: { $sum: "$count" }
                    }
                },
                {
                    $unset: "_id"
                }
            ]).next();
            data.totalMoreThan2Languages = languagesData && languagesData.total ? languagesData.total : 0;
            //======================= List of [Label + Int] return ===============================
            const graphAggQuery = (field) => [
                matchOrganization,
                {
                    $group: {
                        _id: `$${field}`,
                        value: { "$sum": 1 }
                    }
                }
            ];
            data.jobs = yield db.members.aggregate(graphAggQuery("occupation")).toArray();
            data.brailleData = yield db.members.aggregate(graphAggQuery("brailleComprehension")).toArray();
            data.educations = yield db.members.aggregate(graphAggQuery("education")).toArray();
            data.postEducations = yield db.members.aggregate(graphAggQuery("postEducation")).toArray();
            data.politicalEducations = yield db.members.aggregate(graphAggQuery("politicalEducation")).toArray();
            data.governLevels = yield db.members.aggregate(graphAggQuery("governmentAgencyLevel")).toArray();
            //Problem due to some people don't have this field => add this info to database
            data.socialWorkLevels = yield db.members.aggregate(graphAggQuery("socialWorkLevel")).toArray();
            data.languages = yield db.members.aggregate([
                matchOrganization,
                {
                    $unwind: {
                        path: "$languages"
                    }
                },
                {
                    $group: {
                        _id: "$languages",
                        value: { $sum: 1 }
                    }
                },
                {
                    $match: {
                        value: { $gt: 0 },
                    }
                },
            ]).toArray();
            // data.languages = await db.members.aggregate(
            //     graphAggQuery("languages")
            // ).toArray();
            return data;
        }),
        numsByAge: (_root, { organizationId, gender, start, end }, { db }) => __awaiter(void 0, void 0, void 0, function* () {
            let query = {};
            if (organizationId || organizationId !== "") {
                query["organization_id"] = organizationId;
            }
            switch (gender) {
                case "both":
                    //@ts-expect-error safe delete, even not exist
                    delete query.gender;
                    break;
                case "Nữ":
                    query = Object.assign(Object.assign({}, query), { gender });
                    break;
                case "Nam":
                    query = Object.assign(Object.assign({}, query), { gender });
                    break;
            }
            //@ts-expect-error safe delete, even not exist
            if (!organizationId)
                delete query.organization_id;
            const currentYear = new Date().getFullYear();
            //Ex: Current year = 2021, look for person in age 18-20 => 
            //Should find in range 2003-2001, which year switched : 2001 -> 2003
            const endYear = currentYear - start;
            const startYear = currentYear - end;
            const total = yield db.members.countDocuments(Object.assign(Object.assign({}, query), { "birthYear": { "$gte": startYear, "$lte": endYear } }));
            return total ? total : 0;
        }),
        customCount: (_root, { organizationId, input }, { db }) => __awaiter(void 0, void 0, void 0, function* () {
            let query = {};
            if (organizationId && organizationId !== "") {
                query["organization_id"] = organizationId;
            }
            query = Object.assign(Object.assign({}, query), input);
            const cursor = db.members.find(query);
            const total = cursor.count();
            return total;
        })
    },
};
