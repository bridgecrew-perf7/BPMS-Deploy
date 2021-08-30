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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.viewerResolvers = void 0;
const api_1 = require("../../../lib/api");
const crypto_1 = __importDefault(require("crypto"));
const cookieOptions = {
    httpOnly: true,
    sameSite: true,
    signed: true,
    secure: process.env.NODE_END == "development" ? false : true
};
const logInViaCookie = (token, db, req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const updateRes = yield db.users.findOneAndUpdate({ _id: req.signedCookies.viewer }, { $set: { token } }, { returnOriginal: false });
    const viewer = updateRes.value;
    if (!viewer) {
        res.clearCookie("viewer", cookieOptions);
    }
    return viewer;
});
const logInViaGoogle = (code, token, db, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { user } = yield api_1.Google.logIn(code);
    if (!user)
        throw new Error("Google login error, try again");
    //https://developers.google.com/people/api/rest/v1/people?hl=vi#Person
    const userNamesList = user.names && user.names.length ? user.names : null;
    const userPhotosList = user.photos && user.photos.length ? user.photos : null;
    const userEmailsList = user.emailAddresses && user.emailAddresses.length ? user.emailAddresses : null;
    const userName = userNamesList ? userNamesList[0].displayName : null;
    //https://developers.google.com/people/api/rest/v1/people?hl=vi#Person.Source
    const userId = userNamesList && userNamesList[0].metadata && userNamesList[0].metadata.source
        ? userNamesList[0].metadata.source.id
        : null;
    const userAvatar = userPhotosList && userPhotosList[0].url ? userPhotosList[0].url : null;
    const userEmail = userEmailsList && userEmailsList[0].value ? userEmailsList[0].value : null;
    if (!userId || !userName || !userAvatar || !userEmail) {
        throw new Error("Google login error");
    }
    const updateUser = yield db.users.findOneAndUpdate({ _id: userId }, {
        $set: {
            name: userName,
            avatar: userAvatar,
            contact: userEmail,
            token
        }
    }, { returnOriginal: false });
    let viewer = updateUser.value;
    if (!viewer) {
        const insertResult = yield db.users.insertOne({
            _id: userId,
            token,
            name: userName,
            avatar: userAvatar,
            contact: userEmail,
            isAdmin: undefined,
        });
        //Get data here and make another form to update it
        //=> Make another resolver, may be called it add additional user data
        viewer = insertResult.ops[0];
        return viewer;
    }
    //Set the cookie after login using google, this removes the need to login again when you are not using google
    res.cookie("viewer", userId, Object.assign(Object.assign({}, cookieOptions), { maxAge: 365 * 24 * 60 * 60 * 1000 }));
    return viewer;
});
exports.viewerResolvers = {
    Query: {
        authUrl: () => {
            try {
                return api_1.Google.authUrl;
            }
            catch (err) {
                throw new Error(`Failed to get auth url from Google Api: [ ${err} ]`);
            }
        }
    },
    Mutation: {
        logIn: (_root, { input }, { db, req, res }) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                const code = input ? input.code : null;
                //Make a session token
                const token = crypto_1.default.randomBytes(16).toString("hex");
                const viewer = code ? yield logInViaGoogle(code, token, db, res) : yield logInViaCookie(token, db, req, res);
                if (!viewer) {
                    return { didRequest: true };
                }
                return {
                    _id: viewer._id,
                    name: viewer.name,
                    token: viewer.token,
                    avatar: viewer.avatar,
                    isAdmin: viewer.isAdmin,
                    organization_id: viewer.organization_id,
                    registering: viewer.registering,
                    didRequest: true
                };
            }
            catch (e) {
                throw e;
            }
        }),
        logOut: (_root, {}, { res }) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                res.clearCookie("viewer", cookieOptions);
                return { didRequest: true };
            }
            catch (err) {
                throw new Error(`Failed to log out: ${err}`);
            }
        }),
    },
    //Notes: viewer is not inside mutation, it's just a type
    Viewer: {
        id: (viewer) => {
            return viewer._id;
        },
    }
};
