"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolvers = void 0;
const lodash_merge_1 = __importDefault(require("lodash.merge"));
const Members_1 = require("./Members");
const Messages_1 = require("./Messages");
const Viewer_1 = require("./Viewer");
const Organizations_1 = require("./Organizations");
const Stats_1 = require("./Stats");
exports.resolvers = lodash_merge_1.default(Members_1.memberResolvers, Viewer_1.viewerResolvers, Messages_1.messagesResolver, Organizations_1.organizationResovers, Stats_1.statsResovers);
