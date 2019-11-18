import * as exec from '@actions/exec';
import * as sub from 'substituter';
import * as split from 'argv-split';


export class Command {
    static async execute(ocPath: string, args: string) {
        if (!ocPath) {
            return Promise.reject('Unable to find oc bundle');
        }

        const cmdArgs = await Command.prepareOcArgs(args);
        await exec.exec(ocPath, cmdArgs);
        return;
    }

    static async prepareOcArgs(ocArgs: string) {
        let interpolatedArgs = sub(ocArgs, process.env);
        let args = split(interpolatedArgs);
        if (args[0] === 'oc' || args[0] === 'oc.exe') {
            args = args.slice(1);
        }
        return args;
    }
}