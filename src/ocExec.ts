import * as core from '@actions/core';
import { Installer } from './installer';

async function run() {
    const version = core.getInput('version');
    const runnerOS = process.env['RUNNER_OS'];

    core.debug(version);
    core.debug(runnerOS);
    core.debug(process.env['RUNNER_TEMP']);

    let ocPath = await Installer.installOc(version, runnerOS);
    if (ocPath === null) {
        throw new Error('no oc binary found');
    }
    
}

run().catch(core.setFailed);