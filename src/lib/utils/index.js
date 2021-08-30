"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createHashFromUser = exports.clean = void 0;
const js_sha256_1 = require("js-sha256");
const clean = (word) => {
    return word.replace(/[\d .//!-+@#$%^&*()={}~`<>,;:'"]/g, "");
};
exports.clean = clean;
const createHashFromUser = (input) => {
    const userString = exports.clean(input.lastName + input.firstName) + input.birthYear + input.gender + input.education;
    const hash = js_sha256_1.sha256.create();
    hash.update(userString);
    const hexString = hash.hex();
    return hexString;
};
exports.createHashFromUser = createHashFromUser;
