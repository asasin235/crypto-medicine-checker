/*
 * Chaincode entry point. Fabric peers load this via `main` in package.json.
 */

"use strict";

const { PharmaContract } = require("./pharma-contract");

module.exports.contracts = [PharmaContract];
module.exports.PharmaContract = PharmaContract;
