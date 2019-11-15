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
const core = require("@actions/core");
const installer_1 = require("./installer");
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        const version = core.getInput('version');
        const runnerOS = process.env['RUNNER_OS'];
        core.debug(version);
        core.debug(runnerOS);
        core.debug(process.env['RUNNER_TEMP']);
        let ocPath = yield installer_1.Installer.installOc(version, runnerOS);
        if (ocPath === null) {
            throw new Error('no oc binary found');
        }
    });
}
run().catch(core.setFailed);
