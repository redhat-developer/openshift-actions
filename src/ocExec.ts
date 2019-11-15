import * as core from '@actions/core';
import { Installer } from './installer';
import { Command } from './command';
import { OcAuth, OpenShiftEndpoint } from './auth';

async function run() {
    const openShiftUrl = core.getInput('openshift_server_url');
    const parameters = core.getInput('parameters');
    const version = core.getInput('version');
    const args = core.getInput('cmd');
    const runnerOS = process.env['RUNNER_OS'];

    core.debug(version);
    core.debug(runnerOS);
    core.debug(process.env['RUNNER_TEMP']);

    let ocPath = await Installer.installOc(version, runnerOS);
    if (ocPath === null) {
        throw new Error('no oc binary found');
    }

    const endpoint: OpenShiftEndpoint = await OcAuth.initOpenShiftEndpoint(openShiftUrl, parameters);
    await OcAuth.createKubeConfig(endpoint, ocPath, runnerOS);
    await Command.execute(ocPath, args);    
}

run().catch(core.setFailed);